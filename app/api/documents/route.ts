import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client for data operations — documents have no user_id column,
// so ownership flows through the parent project. Auth is enforced at the
// application layer via authenticateRequest + canAccessProject below.
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ADMIN_EMAILS = ['casteelio@gmail.com', 'davidcasteel@gmail.com']

async function authenticateRequest(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return { user: null }

    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })

    const { data: { user }, error } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''))
    if (error || !user) return { user: null }

    return { user }
}

async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single()

    if (!project) return false
    if (project.user_id === userId) return true

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', userId)
        .single()

    return !!(profile?.is_admin || ADMIN_EMAILS.includes(profile?.email?.toLowerCase() ?? ''))
}

// GET - Load documents for a project
export async function GET(request: NextRequest) {
    const { user } = await authenticateRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const searchParams = request.nextUrl.searchParams
        const projectId = searchParams.get('projectId')
        const documentId = searchParams.get('documentId')

        if (documentId) {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single()

            if (error) return NextResponse.json({ error: error.message }, { status: 500 })

            if (!(await canAccessProject(user.id, data.project_id))) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            return NextResponse.json(data)
        } else if (projectId) {
            if (!(await canAccessProject(user.id, projectId))) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }

            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('project_id', projectId)
                .order('updated_at', { ascending: false })

            if (error) return NextResponse.json({ error: error.message }, { status: 500 })

            return NextResponse.json(data)
        } else {
            return NextResponse.json({ error: 'projectId or documentId required' }, { status: 400 })
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Create new document
export async function POST(request: NextRequest) {
    const { user } = await authenticateRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { projectId, type, title, stage, content, status, progress, metadata } = body

        if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
        if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })
        if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
        if (!stage) return NextResponse.json({ error: 'stage is required' }, { status: 400 })

        if (!(await canAccessProject(user.id, projectId))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('documents')
            .insert({
                project_id: projectId,
                type,
                title,
                stage,
                content: content || {},
                status: status || 'draft',
                progress: progress || 0,
                metadata: metadata || {}
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message || 'Failed to create document' }, { status: 500 })

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update document
export async function PATCH(request: NextRequest) {
    const { user } = await authenticateRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { documentId, ...updates } = body

        if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 })

        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select('project_id')
            .eq('id', documentId)
            .single()

        if (fetchError || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

        if (!(await canAccessProject(user.id, doc.project_id))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', documentId)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message || 'Failed to update document' }, { status: 500 })

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
    const { user } = await authenticateRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const searchParams = request.nextUrl.searchParams
        const documentId = searchParams.get('documentId')

        if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 })

        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select('project_id')
            .eq('id', documentId)
            .single()

        if (fetchError || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

        if (!(await canAccessProject(user.id, doc.project_id))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId)

        if (error) return NextResponse.json({ error: error.message || 'Failed to delete document' }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
