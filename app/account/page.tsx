'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, CreditCard, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

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

    useEffect(() => {
        getProfile();
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
        }
        setLoading(false);
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

            const { data: updatedRows, error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)
                .select();

            if (updateError) throw updateError;

            // Force reload to ensure Sidebar/Header picks up the change
            window.location.reload();

            setAvatarUrl(publicUrl);
        } catch (error: any) {
            console.error(error);
            alert('Failed to upload avatar. Ensure "avatars" bucket is public.');
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

    if (loading) return <div className="h-screen bg-zinc-900 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-zinc-900 text-white font-sans p-8 md:p-12">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-8">
                <div>
                    <h1 className="text-4xl font-light mb-2">User Dashboard</h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Manage your Identity, Community, & Security</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Column 1: Identity */}
                <div className="space-y-8">
                    <div className="bg-black/20 border border-zinc-800 p-8 rounded-lg relative overflow-hidden group">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <User size={16} /> Identity
                        </h2>

                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 mb-4 group-hover:border-zinc-500 transition-colors">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <User size={48} />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-xs font-bold uppercase tracking-widest">Upload</span>
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={saving} />
                                </label>
                            </div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">{user.email}</p>
                        </div>

                        <div className="space-y-4">
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
                            <button
                                onClick={updateProfile}
                                disabled={saving}
                                className="w-full bg-white text-black px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 rounded-sm"
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 2: Community */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 p-8 rounded-lg h-full">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                            <User size={16} /> Community
                        </h2>
                        <div className="text-center py-8">
                            <h3 className="text-2xl font-bold mb-4">Join the Network</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                Connect with other Directors, share templates, and get exclusive access to beta features in our Community Discord.
                            </p>
                            <a
                                href="https://discord.gg/placeholder"
                                target="_blank"
                                className="inline-flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors w-full"
                            >
                                Launch Discord
                            </a>
                        </div>
                    </div>
                </div>

                {/* Column 3: Subscription & Security */}
                <div className="space-y-8">
                    {/* Subscription */}
                    <div className="bg-black/20 border border-zinc-800 p-8 rounded-lg">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <CreditCard size={16} /> Plan Status
                        </h2>
                        <div className="flex items-center justify-between bg-zinc-900 p-4 border border-zinc-800 rounded-sm mb-4">
                            <div>
                                <p className="text-zinc-400 text-xs uppercase font-bold">Current Plan</p>
                                <p className="text-xl font-bold text-white uppercase">{profile?.subscription_status === 'active' ? 'Pro Plan' : 'Free Beta'}</p>
                            </div>
                            <div className="text-emerald-500 font-mono text-xs uppercase">
                                {profile?.subscription_status === 'active' ? '● Active' : '● Inactive'}
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-black/20 border border-zinc-800 p-8 rounded-lg">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <Lock size={16} /> Security
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Update Password</label>
                                <div className="flex gap-2 items-start">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="*******"
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
                                        className="bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
