'use client';
import { useState } from 'react';
import { getClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton'; // Using our new premium button
import { getURL } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const supabase = getClient();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      await supabase.auth.signOut();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setMessage('Please check your email to confirm your account.');
        }
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // MACHINED GLASS CHASSIS: bg-zinc-50 (Light Mode Forced)
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans overflow-hidden relative text-zinc-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Background Grid/Noise texture could go here if needed, keeping it clean for now */}
      <div className="absolute inset-0 bg-[url('/grid-pixel.png')] opacity-[0.03] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">

        {/* LOGO & HEADER */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-64 max-w-[80vw] mx-auto flex justify-center mb-4">
            <img src="/octo%20logo%20bk.png" alt="onFORMAT Logo" className="w-full h-auto object-contain" />
          </div>
          {!isLogin && (
            <div className="text-zinc-600 font-medium text-sm">
              Start your <span className="font-bold text-zinc-900">14-Day Free Trial</span>. <br />
              <span className="text-xs text-zinc-400">No credit card or tier selection needed.</span>
            </div>
          )}
        </div>

        {/* GLASS CARD CONTAINER */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-xl p-8 mb-6 relative overflow-hidden">
          {/* Top Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

          <form onSubmit={handleAuth} className="space-y-5">

            {message && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wide text-center rounded-sm">
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-white/50 border border-zinc-200 pl-12 p-3.5 text-xs text-zinc-900 font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-zinc-400 rounded-lg uppercase tracking-wide font-mono"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full bg-white/50 border border-zinc-200 pl-12 pr-12 p-3.5 text-xs text-zinc-900 font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-zinc-400 rounded-lg font-mono"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Premium Glass Button */}
            <GlassButton
              type="submit"
              variant="primary" // This defaults to dark in GlassButton, let's override or use styles?
              // The primary variant in GlassButton is bg-zinc-900 text-white. That works well for contrast on light mode.
              size="lg"
              className="w-full justify-center mt-2 group"
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  <span className="text-white group-hover:text-white/90">{isLogin ? 'Enter System' : 'Create Account'}</span>
                  <ArrowRight size={14} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </GlassButton>
          </form>

          {/* Footer Actions */}
          <div className="mt-6 flex flex-col items-center gap-3 pt-6 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
              className="text-[10px] text-zinc-500 hover:text-zinc-900 uppercase tracking-widest font-bold transition-colors"
            >
              {isLogin ? "Need an account? Create one" : "Already have an account? Sign In"}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={async () => {
                  if (!email) { setMessage("Please enter your email above first."); return; }
                  setLoading(true);
                  const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: { emailRedirectTo: `${getURL()}auth/callback` }
                  });
                  setLoading(false);
                  if (error) setMessage(error.message);
                  else setMessage("Magic Link sent! Check your email to login.");
                }}
                className="text-[9px] text-zinc-400 hover:text-blue-600 uppercase tracking-widest font-medium transition-colors"
              >
                Forgot Password / Use Magic Link
              </button>
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-orange-600 text-xs font-black uppercase tracking-[0.25em]">
            Beta Notice: Expect a few bugs-n-glitches
          </p>
          <div className="text-zinc-300 text-[9px] uppercase font-mono tracking-widest">
            v1.0.0 • Machined Glass
          </div>
        </div>
      </div>
    </div>
  );
}
