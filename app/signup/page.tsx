'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getClient } from '@/lib/supabase'
import { forceLogout } from '@/lib/auth-actions'

export default function SignupPage() {
  const supabase = getClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Double Check: Atomic Logout (Redundant but Safe)
      // ... existing logic ...
      const { data: currentSession } = await supabase.auth.getSession();

      if (currentSession?.session) {
        // If logged in, we MUST kill the session atomically before proceeding
        await fetch('/api/auth/logout', { method: 'POST' });

        // Clear client storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      }

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create profile
      if (data.user) {
        // Attempt to create profile (might fail if verification required and RLS blocks, but we try)
        // If Supabase is set to 'Confirm Email', session will be null here.
        // We catch the error but don't block the "Check Email" message for that case.
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              subscription_status: 'trial',
              subscription_tier: null,
            })
          if (profileError) console.warn("Profile creation deferred (Pending Verification):", profileError);
        } catch (e) { /* ignore */ }
      }

      // Clone Master Demo (Spawn-on-Signup Logic)
      if (data.user) {
        try {
          await fetch('/api/auth/register-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id, userEmail: email })
          });
          console.log("Successfully triggered Spawn-on-Signup for", email);
        } catch (cloneErr) {
          console.warn("⚠️ Failed to trigger Spawn-on-Signup background job:", cloneErr);
        }
      }

      // NO LONGER STOPPING FOR SESSION NULL IF WE WANT THE USER EXPERIENCE TO FEEL FAST
      // But if session is null, it means verification is pending.
      // We still redirect OR show message.
      if (!data.session) {
        setError("Account created! Please check your email to verify your account.");
        return; // Stop here, do not redirect
      }

      // FORCE HARD RELOAD to clear any client-side singleton state
      // This is critical to prevent "Shared Account" ghosting.
      window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Start Creating
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-purple-200 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
              <p className="text-xs text-purple-300 mt-1">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Start Free Trial'}
            </button>
          </form>

          <p className="text-xs text-purple-300 text-center mt-4">
            14-day free trial. No credit card required.
          </p>

          <p className="text-center text-purple-200 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-semibold hover:text-purple-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
