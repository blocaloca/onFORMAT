'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // MOCK AUTH ONLY - No Supabase calls to prevent restriction
      localStorage.setItem('onformat_user', email);
      router.push('/dashboard');
    }
  };

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col items-center justify-center text-black font-sans">
      <div className="w-full max-w-md p-12 bg-white shadow-2xl">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">onFORMAT</h1>
        <p className="text-xs font-mono text-zinc-400 mb-12 uppercase tracking-widest">
          Production Operating System
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2">
              Email Access
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL"
              className="w-full bg-zinc-50 border-b-2 border-zinc-200 p-4 text-sm font-bold outline-none focus:border-black transition-colors placeholder-zinc-300"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-industrial-accent hover:text-black transition-colors"
          >
            Enter System
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[9px] text-zinc-300 font-mono uppercase">
            v0.9.1 (BETA) • Offline Mode
          </p>
        </div>
      </div>
    </div>
  );
}
