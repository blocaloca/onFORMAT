
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function DebugProjectsPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY! // Using Service Key to bypass RLS

    if (!url || !key) {
        return (
            <div className="p-10 text-red-500">
                ERROR: Missing Env Vars on Vercel.<br />
                URL: {url ? 'OK' : 'MISSING'}<br />
                SERVICE_KEY: {key ? 'OK' : 'MISSING'}
            </div>
        )
    }

    const supabase = createClient(url, key)

    // 1. List Projects (Admin Mode)
    const { data: projects, error: projectsError } = await supabase.from('projects').select('*')

    // 2. List Users (Admin Mode) - to see who exists
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    return (
        <div className="p-10 bg-white text-black font-mono">
            <h1 className="text-2xl font-bold mb-4">Debug Console</h1>

            <div className="mb-8">
                <h2 className="text-xl font-bold">Projects (Raw DB Dump):</h2>
                {projectsError ? (
                    <pre className="text-red-500">{JSON.stringify(projectsError, null, 2)}</pre>
                ) : (
                    <pre className="bg-gray-100 p-4 rounded text-xs">
                        {JSON.stringify(projects, null, 2)}
                    </pre>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold">Auth Users (Registered Identities):</h2>
                {usersError ? (
                    <pre className="text-red-500">{JSON.stringify(usersError, null, 2)}</pre>
                ) : (
                    <div className="space-y-2">
                        {users?.map(u => (
                            <div key={u.id} className="border p-2">
                                {u.email} ({u.id})
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
