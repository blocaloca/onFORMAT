import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Load documents for a project
export async function GET(request: NextRequest) {
  try {
    console.log('========================================')
    console.log('GET /api/documents - Request received')
    console.log('========================================')

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const documentId = searchParams.get('documentId')

    console.log('Query params:')
    console.log('  - projectId:', projectId)
    console.log('  - documentId:', documentId)

    if (documentId) {
      // Get specific document
      console.log('Fetching single document:', documentId)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (error) {
        console.error('Error fetching document:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      console.log('Document fetched successfully')
      return NextResponse.json(data)
    } else if (projectId) {
      // Get all documents for project
      console.log('Fetching all documents for project:', projectId)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      console.log(`Fetched ${data?.length || 0} documents successfully`)
      return NextResponse.json(data)
    } else {
      console.error('Missing required parameter: projectId or documentId')
      return NextResponse.json(
        { error: 'projectId or documentId required' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('========================================')
    console.error('GET /api/documents - EXCEPTION:')
    console.error('Error:', error)
    console.error('========================================')
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new document
export async function POST(request: NextRequest) {
  try {
    console.log('========================================')
    console.log('POST /api/documents - Request received')
    console.log('========================================')

    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    const { projectId, type, title, stage, content, status, progress, metadata } = body

    // Validate required fields
    if (!projectId) {
      console.error('ERROR: projectId is missing')
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }
    if (!type) {
      console.error('ERROR: type is missing')
      return NextResponse.json(
        { error: 'type is required' },
        { status: 400 }
      )
    }
    if (!title) {
      console.error('ERROR: title is missing')
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }
    if (!stage) {
      console.error('ERROR: stage is missing')
      return NextResponse.json(
        { error: 'stage is required' },
        { status: 400 }
      )
    }

    const insertData = {
      project_id: projectId,
      type: type,
      title: title,
      stage: stage,
      content: content || {},
      status: status || 'draft',
      progress: progress || 0,
      metadata: metadata || {}
    }
    console.log('Insert data:', JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase
      .from('documents')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('========================================')
      console.error('SUPABASE INSERT ERROR:')
      console.error('Error:', JSON.stringify(error, null, 2))
      console.error('========================================')
      return NextResponse.json(
        { error: error.message || 'Failed to create document' },
        { status: 500 }
      )
    }

    console.log('Document created successfully:', data)
    console.log('========================================')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('========================================')
    console.error('POST /api/documents - EXCEPTION:')
    console.error('Error:', error)
    console.error('========================================')
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update document
export async function PATCH(request: NextRequest) {
  try {
    console.log('========================================')
    console.log('PATCH /api/documents - Request received')
    console.log('========================================')

    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    const { documentId, ...updates } = body

    if (!documentId) {
      console.error('ERROR: documentId is missing')
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    console.log('Updating document:', documentId)
    console.log('Updates:', JSON.stringify(updates, null, 2))

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      console.error('========================================')
      console.error('SUPABASE UPDATE ERROR:')
      console.error('Error:', JSON.stringify(error, null, 2))
      console.error('========================================')
      return NextResponse.json(
        { error: error.message || 'Failed to update document' },
        { status: 500 }
      )
    }

    console.log('Document updated successfully:', data)
    console.log('========================================')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('========================================')
    console.error('PATCH /api/documents - EXCEPTION:')
    console.error('Error:', error)
    console.error('========================================')
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    console.log('========================================')
    console.log('DELETE /api/documents - Request received')
    console.log('========================================')

    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      console.error('ERROR: documentId is missing')
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      )
    }

    console.log('Deleting document:', documentId)

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('========================================')
      console.error('SUPABASE DELETE ERROR:')
      console.error('Error:', JSON.stringify(error, null, 2))
      console.error('========================================')
      return NextResponse.json(
        { error: error.message || 'Failed to delete document' },
        { status: 500 }
      )
    }

    console.log('Document deleted successfully')
    console.log('========================================')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('========================================')
    console.error('DELETE /api/documents - EXCEPTION:')
    console.error('Error:', error)
    console.error('========================================')
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
