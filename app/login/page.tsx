'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
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
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center text-white font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-zinc-900 to-transparent opacity-20 pointer-events-none" />

      <div className="w-full max-w-md p-8 md:p-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">onFORMAT</h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Production Operating System
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

          {message && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase text-center rounded-sm">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full bg-zinc-900/50 border border-zinc-800 pl-12 p-4 text-sm text-white font-bold outline-none focus:border-white focus:bg-zinc-900 transition-all placeholder-zinc-700 rounded-sm uppercase"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                className="w-full bg-zinc-900/50 border border-zinc-800 pl-12 pr-12 p-4 text-sm text-white font-bold outline-none focus:border-white focus:bg-zinc-900 transition-all placeholder-zinc-700 rounded-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>{isLogin ? 'Enter System' : 'Create Account'} <ArrowRight size={16} /></>}
          </button>

          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
              className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider font-bold transition-colors"
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
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
                  });
                  setLoading(false);
                  if (error) setMessage(error.message);
                  else setMessage("Magic Link sent! Check your email to login.");
                }}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-wider font-bold transition-colors"
              >
                Forgot Password / Use Magic Link
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="absolute bottom-12 text-center text-zinc-800 text-[10px] uppercase font-mono">
        v1.0.0 • Live
      </div>
    </div>
  );
}
