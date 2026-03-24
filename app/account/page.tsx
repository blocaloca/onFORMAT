'use client';
import { useState, useEffect } from 'react';
import { getClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, CreditCard, Loader2, Lock, Eye, EyeOff, Megaphone, Upload, Check, Crown } from 'lucide-react';
import Link from 'next/link';
import { STRIPE_PLANS } from '@/lib/stripe-products';
import { isFounder as checkIsFounder } from '@/lib/permissions';

export default function AccountPage() {
    const router = useRouter();
    const supabase = getClient();
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [saving, setSaving] = useState(false);

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Announcements State
    const [announcement, setAnnouncement] = useState<any>(null);
    const [isFounder, setIsFounder] = useState(false);
    const [uploadingAnnouncement, setUploadingAnnouncement] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        getProfile();
        fetchAnnouncement();
    }, []);

    const getProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
        setUser(user);

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
            setFullName(data.full_name || '');
            setAvatarUrl(data.avatar_url || null);

            const emailToCheck = data.email || user.email;
            if (checkIsFounder(emailToCheck) || data.is_admin) {
                setIsFounder(true);
            }
        }
        setLoading(false);
    };

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch(`/api/announcements?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data && !data.error) {
                setAnnouncement(data);
            }
        } catch (e) {
            console.error("Failed to fetch announcements", e);
        }
    };

    const updateProfile = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);

        if (error) {
            alert('Error updating profile');
        } else {
            alert('Profile updated');
        }
        setSaving(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !e.target.files || e.target.files.length === 0) return;
        setSaving(true);
        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            alert('Failed to upload avatar.');
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async () => {
        setSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert("Password updated successfully!");
            setNewPassword('');
        }
        setSaving(false);
    };

    const handleCheckout = async (priceId: string, buttonId: string) => {
        setCheckoutLoading(buttonId);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Network response was not ok');
            }

            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert('Checkout failed');
        } catch (e: any) {
            console.error(e);
            alert(`Error starting checkout: ${e.message}`);
        } finally {
            setCheckoutLoading(null);
        }
    };

    const handleAnnouncementUpdate = async (file?: File) => {
        if (!isFounder || !user) return;
        setUploadingAnnouncement(true);
        try {
            let mediaUrl = videoUrl;
            if (file) {
                const fileExt = file.name.split('.').pop();
                const filePath = `announcement-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('announcements')
                    .upload(filePath, file, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('announcements').getPublicUrl(filePath);
                mediaUrl = publicUrl;
            }
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            const cleanMessage = newMessage.trim();
            const cleanMediaUrl = mediaUrl.trim();

            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ userId: user.id, media_url: cleanMediaUrl, message: cleanMessage })
            });
            if (res.ok) {
                alert("Announcement Updated!");
                fetchAnnouncement();
                setNewMessage('');
                setVideoUrl('');
            } else {
                const errData = await res.json();
                console.error("Publish failed:", errData);
                alert(`Failed to update: ${errData.error || 'Unknown Error'}`);
            }
        } catch (error: any) {
            console.error(error);
            alert('Failed to update announcement.');
        } finally {
            setUploadingAnnouncement(false);
        }
    };

    const renderMedia = (url: string) => {
        if (!url) return null;

        // 1. YouTube Handling (Robust Regex)
        // Matches watch?v=, shorts/, embed/, live/, youtu.be/, etc.
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
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
        const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
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

        // 4. Fallback to Image
        return <img src={url} alt="Announcement" className="w-full h-full object-cover" />;
    };

    if (loading && !profile) return <div className="h-screen bg-zinc-50 flex items-center justify-center text-zinc-900"><Loader2 className="animate-spin" /></div>;

    // Corrected Display Logic
    const isPro = (profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro') || profile?.manual_pro_override;
    const isStudio = profile?.subscription_status === 'active' && profile?.subscription_tier === 'studio';
    const isScout = !isPro && !isStudio && (!profile?.subscription_status || profile?.subscription_tier === 'scout');

    return (
        <div className="min-h-screen relative bg-zinc-50 text-zinc-950 font-sans p-6 md:p-12">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 mb-10 transition-colors text-xs font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> BACK TO DASHBOARD
            </Link>

            {/* HEADER WITH BETA BADGE */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-zinc-200 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight flex items-center">
                        ACCOUNT CONTROL
                        {profile?.is_beta_user && (
                            <span className="ml-4 px-3 py-1 bg-zinc-900 text-zinc-50 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                Beta User
                            </span>
                        )}
                    </h1>
                    <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mt-2 px-1">Global Settings & Configuration</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* IDENTITY SECTION */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-x-0 bottom-0 py-2 bg-black/70 text-[9px] font-black uppercase tracking-widest text-white text-center rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                Change
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={saving} />
                            </label>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Display Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        autoComplete="off"
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono text-zinc-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <button onClick={updateProfile} disabled={saving} className="bg-zinc-900 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all active:scale-[0.98]">
                                {saving ? 'Saving...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SECURITY SECTION */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <Lock size={18} className="text-zinc-900" />
                        <h2 className="text-xs font-black uppercase tracking-widest">Security Configuration</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Update Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button onClick={updatePassword} disabled={saving || !newPassword} className="bg-zinc-100 text-zinc-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98]">
                            UPDATE PASSWORD
                        </button>
                    </div>
                </section>
            {/* BULLETINS SECTION */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm h-full flex flex-col">
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-zinc-900">
                                <Megaphone size={16} />
                                <h3 className="text-xs font-black uppercase tracking-widest">BULLETINS</h3>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            {announcement ? (
                                <>
                                    {announcement.media_url && (
                                        <div className="aspect-video bg-black">
                                            {renderMedia(announcement.media_url)}
                                        </div>
                                    )}
                                    {announcement.message && (
                                        <div className="p-5 font-mono text-[11px] leading-relaxed text-zinc-600 whitespace-pre-wrap">
                                            {announcement.message}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-8 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No Bulletins</div>
                            )}
                        </div>
                    </div>

                    {/* FOUNDER EDITOR */}
                    {isFounder && (
                        <div className="pt-8 border-t border-zinc-100">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Founder Controls</p>
                            <div className="space-y-4">
                                <textarea
                                    placeholder="Broadcast message..."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-[11px] font-mono outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Video Link..."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-mono outline-none"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleAnnouncementUpdate()} disabled={uploadingAnnouncement} className="bg-zinc-100 text-zinc-600 py-3 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200">
                                        PUBLISH
                                    </button>
                                    <label className="bg-blue-50 text-blue-600 py-3 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-100 text-center cursor-pointer">
                                        {uploadingAnnouncement ? '...' : 'UPLOAD MEDIA'}
                                        <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAnnouncementUpdate(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
                </div>

                {/* PRICING MATRIX */}
                <section className="mt-16">
                    <div className="flex items-center gap-2 mb-8">
                        <CreditCard size={18} className="text-zinc-900" />
                        <h2 className="text-xs font-black uppercase tracking-widest">Membership Plans</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* SOLO */}
                        <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between hover:border-zinc-300 transition-colors">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Solo Tier</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-zinc-950">$19</span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {['3 Active Projects'].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-600 uppercase tracking-tight">
                                            <Check size={14} className="text-zinc-400" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {isScout ? (
                                <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                                    CURRENT PLAN
                                </button>
                            ) : (
                                <button disabled className="w-full bg-zinc-50 text-zinc-400 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                                    DOWNGRADE PRO ONLY
                                </button>
                            )}
                        </div>

                        {/* PRO */}
                        <div className="bg-white border border-zinc-300 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:border-zinc-400 transition-colors">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">Pro Tier</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-zinc-950">$49</span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {['Unlimited Active Projects', 'Custom Studio Branding'].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-600 uppercase tracking-tight">
                                            <Check size={14} className="text-zinc-600" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {isPro ? (
                                <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed">
                                    CURRENT PLAN
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleCheckout(STRIPE_PLANS.pro.id, 'pro')}
                                    disabled={checkoutLoading === 'pro'}
                                    className="w-full bg-zinc-900 text-white py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    {checkoutLoading === 'pro' ? <Loader2 size={16} className="animate-spin" /> : "UPGRADE"}
                                </button>
                            )}
                        </div>

                        {/* STUDIO */}
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
                            {/* Overlay */}
                            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]"></div>

                            {/* Top Badge */}
                            <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-20 shadow-sm">
                                COMING SOON
                            </div>

                            <div className="relative z-0">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Studio Tier</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-zinc-400">$129</span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {['Unlimited Active Projects', '3 Producer Seats', 'Priority Support'].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-tight">
                                            <Check size={14} className="text-zinc-300" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button disabled className="relative z-20 w-full bg-zinc-200 text-zinc-500 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed border border-zinc-300">
                                COMING SOON
                            </button>
                        </div>
                    </div>
                </section>
            </div>


        </div>
    );
}
