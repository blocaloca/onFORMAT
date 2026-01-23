import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bug, Lightbulb, MessageSquare, ArrowLeft, Archive, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Security Gate
  // Security Gate
  if (profile?.role !== 'admin' && user.email !== 'casteelio@gmail.com') {
    redirect('/dashboard')
  }

  // Fetch Feedback
  const { data: feedbackItems } = await supabase
    .from('feedback')
    .select(`
            *,
            profiles (
                email,
                full_name
            )
        `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <div>
            <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-2 text-xs uppercase tracking-widest font-bold">
              <ArrowLeft size={12} /> Back to App
            </Link>
            <h1 className="text-2xl font-light">Admin Dashboard</h1>
          </div>
          <div className="bg-emerald-900/30 text-emerald-500 px-3 py-1 rounded text-xs uppercase tracking-widest border border-emerald-900">
            Authorized: {user.email}
          </div>
        </div>

        {/* Subscriptions Stats Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded">
            <h3 className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-2">Total Feedback</h3>
            <p className="text-3xl font-light text-white">{feedbackItems?.length || 0}</p>
          </div>
        </div>

        {/* Feedback List */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">User Feedback</h2>

        <div className="space-y-4">
          {feedbackItems?.map((item: any) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded flex gap-6 items-start hover:border-zinc-700 transition-colors">
              {/* Icon */}
              <div className={`p-3 rounded border ${item.category === 'bug' ? 'bg-red-900/10 border-red-900/30 text-red-500' :
                item.category === 'feature' ? 'bg-emerald-900/10 border-emerald-900/30 text-emerald-500' :
                  'bg-blue-900/10 border-blue-900/30 text-blue-500'
                }`}>
                {item.category === 'bug' ? <Bug size={20} /> :
                  item.category === 'feature' ? <Lightbulb size={20} /> :
                    <MessageSquare size={20} />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.category === 'bug' ? 'bg-red-500 text-black' :
                      item.category === 'feature' ? 'bg-emerald-500 text-black' :
                        'bg-blue-500 text-black'
                      }`}>
                      {item.category}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">
                    {item.profiles?.email || 'Unknown User'}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-600 font-mono">
                  <span>ID: {item.id.slice(0, 8)}...</span>
                  <span>Status: {item.status}</span>
                </div>
              </div>
            </div>
          ))}

          {(!feedbackItems || feedbackItems.length === 0) && (
            <div className="text-center py-12 text-zinc-500">
              No feedback received yet.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
