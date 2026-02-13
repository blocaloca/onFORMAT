'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, CreditCard, Loader2, Lock, Eye, EyeOff, Megaphone, Upload, Check } from 'lucide-react';
import Link from 'next/link';
import { STRIPE_PLANS } from '@/lib/stripe-products';

export default function AccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
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

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
            setFullName(data.full_name || '');
            setAvatarUrl(data.avatar_url || null);

            // Simple check for Founder Mode (can be expanded)
            // Replace with your actual email or an admin flag
            if (data.email === 'casteelio@gmail.com' || data.is_admin) {
                setIsFounder(true);
            }
        }
        setLoading(false);
    };

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch('/api/announcements');
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

            // Reload to update header avatar
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

    // Founder Control Panel functions
    const handleAnnouncementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isFounder || !user || !e.target.files || e.target.files.length === 0) return;
        setUploadingAnnouncement(true);

        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `announcement-${Date.now()}.${fileExt}`;

            // Upload directly to 'announcements' bucket
            const { error: uploadError } = await supabase.storage
                .from('announcements')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('announcements')
                .getPublicUrl(filePath);

            // Create record via API
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    media_url: publicUrl,
                    message: newMessage // Optional message
                })
            });

            if (res.ok) {
                alert("Announcement Updated!");
                fetchAnnouncement(); // Refresh view
                setNewMessage('');
            } else {
                alert("Failed to update announcement record.");
            }

        } catch (error: any) {
            console.error(error);
            alert('Failed to upload announcement media.');
        } finally {
            setUploadingAnnouncement(false);
        }
    };

    if (loading) return <div className="h-screen bg-zinc-900 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-zinc-900 text-white font-sans p-8 md:p-12">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl font-light mb-2">Control Panel</h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Global Settings & Status</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: The "Control Panel" (Identity + Sub + Security) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Identity Section */}
                    <div className="bg-black/20 border border-zinc-800 p-8 rounded-lg relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

                            {/* Avatar */}
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 shrink-0 group-hover:border-zinc-500 transition-colors">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <User size={32} />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={saving} />
                                </label>
                            </div>

                            {/* Identity Inputs */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-white outline-none transition-colors text-sm rounded-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full bg-zinc-900 border border-zinc-800 p-3 text-zinc-500 cursor-not-allowed text-sm rounded-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <button
                                        onClick={updateProfile}
                                        disabled={saving}
                                        className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 rounded-sm"
                                    >
                                        {saving ? 'Saving...' : 'Save Identity'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription & Security Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Subscription */}
                        <div className="bg-black/20 border border-zinc-800 p-8 rounded-lg h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                    <CreditCard size={16} /> Subscription
                                </h2>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-xl font-bold text-white uppercase">
                                            {profile?.subscription_status === 'active'
                                                ? (STRIPE_PLANS[profile?.subscription_tier as keyof typeof STRIPE_PLANS]?.name || 'Pro')
                                                : 'Scout'}
                                        </p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold ${profile?.subscription_status === 'active'
                                                ? 'bg-emerald-900/30 text-emerald-500 border border-emerald-900'
                                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                            }`}>
                                            {profile?.subscription_status === 'active' ? 'Active' : 'Free'}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-xs">
                                        {profile?.subscription_status === 'active'
                                            ? 'Your account is fully active.'
                                            : 'Upgrade to unlock more projects.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                {/* Upgrade Logic */}
                                {(!profile?.subscription_status || profile.subscription_status !== 'active') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setLoading(true);
                                                fetch('/api/stripe/checkout', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ priceId: STRIPE_PLANS.pro.id })
                                                })
                                                    .then(res => res.json())
                                                    .then(data => { if (data.url) window.location.href = data.url; })
                                                    .catch(() => alert('Checkout failed'))
                                                    .finally(() => setLoading(false));
                                            }}
                                            disabled={loading}
                                            className="w-full bg-white text-black px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 rounded-sm flex items-center justify-between group"
                                        >
                                            <span>Upgrade to Pro</span>
                                            <span className="text-zinc-500 group-hover:text-black">$15/mo</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setLoading(true);
                                                fetch('/api/stripe/checkout', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ priceId: STRIPE_PLANS.studio.id })
                                                })
                                                    .then(res => res.json())
                                                    .then(data => { if (data.url) window.location.href = data.url; })
                                                    .catch(() => alert('Checkout failed'))
                                                    .finally(() => setLoading(false));
                                            }}
                                            disabled={loading}
                                            className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 rounded-sm flex items-center justify-between group"
                                        >
                                            <span>Upgrade to Studio</span>
                                            <span className="text-zinc-400 group-hover:text-white">$29/mo</span>
                                        </button>
                                    </>
                                )}

                                {/* Studio Upgrade */}
                                {profile?.subscription_status === 'active' && profile?.subscription_tier === 'pro' && (
                                    <button
                                        onClick={() => {
                                            setLoading(true);
                                            fetch('/api/stripe/checkout', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ priceId: STRIPE_PLANS.studio.id })
                                            })
                                                .then(res => res.json())
                                                .then(data => { if (data.url) window.location.href = data.url; })
                                                .catch(() => alert('Checkout failed'))
                                                .finally(() => setLoading(false));
                                        }}
                                        disabled={loading}
                                        className="w-full bg-white text-black px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 rounded-sm flex items-center justify-between"
                                    >
                                        <span>Upgrade to Studio</span>
                                        <span>$29/mo</span>
                                    </button>
                                )}

                                {/* Portal Link */}
                                {profile?.subscription_status === 'active' && (
                                    <button
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                const res = await fetch('/api/stripe/portal', { method: 'POST' });
                                                const data = await res.json();
                                                if (data.url) window.location.href = data.url;
                                                else alert('Failed to load portal');
                                            } catch (e) {
                                                alert('Error loading portal');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full mt-2 bg-transparent border border-zinc-700 text-zinc-400 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-zinc-500 rounded-sm"
                                    >
                                        Manage Subscription
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-black/20 border border-zinc-800 p-8 rounded-lg h-full">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                <Lock size={16} /> Security
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Update Password</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New Password"
                                                className="w-full bg-black border border-zinc-700 p-3 pr-10 text-white focus:border-white outline-none transition-colors text-sm rounded-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={updatePassword}
                                            disabled={saving || !newPassword}
                                            className="bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50 w-full"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Announcements Frame */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-zinc-800/10 border border-zinc-800 rounded-lg p-1 h-full min-h-[400px] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <Megaphone size={14} /> Announcements
                            </h2>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-black/40 relative overflow-hidden flex flex-col">
                            {announcement ? (
                                <>
                                    {announcement.media_url && (
                                        <div className="flex-1 w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden">
                                            <img src={announcement.media_url} alt="Announcement" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    {announcement.message && (
                                        <div className="p-6">
                                            <p className="text-sm text-zinc-300 leading-relaxed font-mono">
                                                {announcement.message}
                                            </p>
                                        </div>
                                    )}

                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                                    <Megaphone size={32} className="mb-4 text-zinc-600" />
                                    <p className="text-sm text-zinc-500 font-mono">No active announcements.</p>
                                </div>
                            )}
                        </div>

                        {/* Founder Control Panel (Hidden unless authorized) */}
                        {isFounder && (
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Founder Controls</p>
                                    <input
                                        type="text"
                                        placeholder="Announcement text..."
                                        className="w-full bg-black border border-zinc-700 p-2 text-xs text-white rounded-sm"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <label className="flex items-center justify-center w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-sm cursor-pointer transition-colors">
                                        {uploadingAnnouncement ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        <span>{uploadingAnnouncement ? 'Uploading...' : 'Publish Update'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAnnouncementUpload}
                                            disabled={uploadingAnnouncement}
                                        />
                                    </label>
                                    <p className="text-[10px] text-zinc-600 text-center">Uploading an image will immediately publish.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div >
        </div >
    );
}
