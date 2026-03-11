'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Upload, Loader2, Link as LinkIcon, X } from 'lucide-react';
import { getClient } from '@/lib/supabase';

export default function AnnouncementEditor({ user }: { user: any }) {
    const supabase = getClient();
    const [announcement, setAnnouncement] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            if (data && !data.error) {
                setAnnouncement(data);
                // Pre-fill form if needed, or keep blank for new updates? 
                // Usually better to keep blank so they know they are posting NEW content, 
                // but showing current content is helpful context.
            }
        } catch (e) {
            console.error("Failed to fetch announcements", e);
        }
    };

    const handlePublish = async (file?: File) => {
        if (!user) return;
        setIsSaving(true);
        setIsUploading(!!file);

        try {
            let finalMediaUrl = mediaUrl;

            // 1. Upload File if provided
            if (file) {
                const fileExt = file.name.split('.').pop();
                const filePath = `announcement-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('announcements')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('announcements')
                    .getPublicUrl(filePath);

                finalMediaUrl = publicUrl;
            }

            // 2. Post to API
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    media_url: finalMediaUrl,
                    message: message
                })
            });

            if (res.ok) {
                alert("Announcement Published!");
                setMessage('');
                setMediaUrl('');
                fetchAnnouncement(); // Refresh preview
            } else {
                const errData = await res.json();
                alert(`Failed to publish: ${errData.error || 'Unknown Error'}`);
            }

        } catch (error) {
            console.error(error);
            alert("Error publishing announcement.");
        } finally {
            setIsSaving(false);
            setIsUploading(false);
        }
    };

    const renderMedia = (url: string) => {
        if (!url) return null;

        // 1. YouTube Handling (Robust Regex)
        // Matches watch?v=, shorts/, embed/, live/, youtu.be/, etc.
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const ytMatch = url.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
            return (
                <div className="w-full h-full relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        // 2. Vimeo Handling
        const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            const vimeoId = vimeoMatch[1];
            // Check for privacy hash (e.g. vimeo.com/123/abc)
            const parts = url.split('vimeo.com/')[1]?.split('?')[0].split('/');
            const hash = (parts && parts.length > 1) ? `?h=${parts[1]}` : '';

            return (
                <div className="w-full h-full relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}${hash}`}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        // 3. Raw Video Handling
        const urlWithoutQuery = url.split('?')[0].toLowerCase();
        if (urlWithoutQuery.match(/\.(mp4|webm|ogg|mov)$/i)) {
            return (
                <video
                    src={url}
                    controls
                    playsInline
                    className="w-full h-full object-cover bg-black"
                />
            );
        }

        // 4. Default to Image
        return <img src={url} alt="Preview" className="w-full h-full object-cover" />;
    };

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <Megaphone size={20} className="text-zinc-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Global Announcement (v2 Debug)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* EDITOR */}
                <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Create New Update</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-md focus:border-black focus:ring-0 transition-colors resize-none h-24"
                                placeholder="What's happening?"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Media</label>

                            <div className="flex flex-col gap-3">
                                {/* URL Input */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={mediaUrl}
                                            onChange={(e) => setMediaUrl(e.target.value)}
                                            placeholder="Paste video or image URL..."
                                            className="w-full pl-9 p-2 text-sm bg-zinc-50 border border-zinc-200 rounded-md focus:border-black transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400">OR</span>
                                    <div className="h-px bg-zinc-100 flex-1"></div>
                                </div>

                                {/* File Upload */}
                                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-zinc-200 rounded-lg hover:border-zinc-400 hover:bg-zinc-50 transition-all cursor-pointer group">
                                    <Upload size={16} className="text-zinc-400 group-hover:text-black transition-colors" />
                                    <span className="text-xs text-zinc-500 font-medium group-hover:text-black">Upload Media</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handlePublish(e.target.files[0]);
                                        }}
                                        disabled={isSaving}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100">
                            <button
                                onClick={() => handlePublish()}
                                disabled={isSaving || (!message && !mediaUrl)}
                                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />}
                                {isSaving ? 'Publishing...' : 'Publish Update'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 overflow-hidden flex flex-col h-full min-h-[300px]">
                    <div className="p-3 border-b border-zinc-800 bg-black/50 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Preview</span>
                        {announcement && <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active</span>}
                    </div>

                    <div className="flex-1 relative bg-black flex flex-col">
                        {announcement ? (
                            <>
                                {announcement.media_url && (
                                    <div className="w-full aspect-video bg-zinc-900 relative">
                                        {renderMedia(announcement.media_url)}
                                    </div>
                                )}
                                {announcement.message && (
                                    <div className="p-6">
                                        <p className="text-sm text-zinc-300 font-mono leading-relaxed">{announcement.message}</p>
                                    </div>
                                )}
                                <div className="mt-auto p-4 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono text-center">
                                    Posted {new Date(announcement.created_at).toLocaleDateString()}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-8">
                                <Megaphone size={32} className="mb-4 opacity-20" />
                                <p className="text-xs font-mono">No active announcement.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
}
