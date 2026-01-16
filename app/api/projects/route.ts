import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getInitialDocuments } from '@/lib/default-document-content'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')

    if (projectId) {
      // Get specific project
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      return NextResponse.json(data)
    } else if (userId) {
      // Get all projects for user
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: 'userId or projectId required' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('========================================')
    console.log('POST /api/projects - Request received')
    console.log('========================================')

    const body = await request.json()
    console.log('1. Request body received:', JSON.stringify(body, null, 2))

    const { userId, userEmail, productType, templateId, name, data: projectData, templateData } = body
    console.log('2. Destructured values:')
    console.log('   - userId:', userId)
    console.log('   - userEmail:', userEmail)
    console.log('   - productType:', productType)
    console.log('   - templateId:', templateId)
    console.log('   - name:', name)
    console.log('   - projectData:', projectData)
    console.log('   - templateData:', templateData ? 'provided' : 'not provided')

    // Validate required fields
    if (!name) {
      console.error('ERROR: name is missing')
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    // AUTO-RESOLVE USER ID for Offline/Dev Mode
    const DUMMY_ID = '00000000-0000-0000-0000-000000000000';
    let finalUserId = userId;
    let finalUserEmail = userEmail || 'dev@onformat.com';

    if (!finalUserId || finalUserId === DUMMY_ID) {
      console.log(`🚨 Resolving User ID for email: ${finalUserEmail}`);

      // 1. Try to find user in Auth list
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

      const existingUser = users?.find(u => u.email === finalUserEmail) || users?.[0];

      if (existingUser) {
        finalUserId = existingUser.id;
        finalUserEmail = existingUser.email || finalUserEmail;
        console.log('✅ Resolved Existing User ID:', finalUserId);
      } else {
        // 2. Create new user if not found
        console.log('⚠️ User not found. Creating new user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: finalUserEmail,
          password: 'password123',
          email_confirm: true
        });

        if (newUser.user) {
          finalUserId = newUser.user.id;
          console.log('✅ Created New User ID:', finalUserId);
        } else {
          console.error('❌ Failed to create user:', createError);
          // Fallback to error or throw?
          // If we can't get a user, we can't create a project linked to a user.
          // But maybe we can create it orphaned? No, schema likely requires user_id.
          if (createError?.message?.includes("already registered")) {
            // Edge case: User exists but wasn't in first page of listUsers?
            // Not resolving this edge case for now.
            throw new Error('User already exists but could not be resolved.');
          }
          throw new Error('Failed to resolve user context.');
        }
      }
    }

    // CRITICAL: Ensure this user has a PROFILE to satisfy "projects_user_id_fkey"
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: finalUserId,
        email: finalUserEmail,
        subscription_status: 'active',
        subscription_tier: 'pro'
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn('⚠️ Warning: Could not ensure profile exists:', profileError.message);
      // Continue anyway, as failure might be RLS or schema related, 
      // hope for the best or that it already exists.
    } else {
      console.log('✅ Ensured Profile exists for:', finalUserId);
    }

    // Construct proper initial state to prevent WorkspaceEditor crash
    // The editor expects { activePhase, phases: {...}, ... }
    const defaultState = {
      activePhase: 'DEVELOPMENT',
      activeTool: 'brief',
      phases: {
        DEVELOPMENT: { locked: false, drafts: {} },
        PRE_PRODUCTION: { locked: false, drafts: {} },
        ON_SET: { locked: false, drafts: {} },
        POST: { locked: false, drafts: {} },
      },
      chat: {},
      clientName: projectData?.clientName || '' // Preserve client name if passed
    };

    // Merge provided data with default state to ensure structure exists
    const finalProjectData = {
      ...defaultState,
      ...(projectData || {})
    };

    const insertData = {
      user_id: finalUserId,
      product_type: productType || 'LuxPixPro',
      template_id: templateId || null,
      name: name,
      data: finalProjectData,
      current_version: 1,
    }
    console.log('3. Data to insert into Supabase:', JSON.stringify(insertData, null, 2))

    // Create new project
    console.log('4. Calling supabase.from("projects").insert()...')
    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('========================================')
      console.error('SUPABASE INSERT ERROR:')
      console.error('Error object:', JSON.stringify(error, null, 2))
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('========================================')
      return NextResponse.json(
        { error: error.message || 'Failed to create project', details: error },
        { status: 500 }
      )
    }

    console.log('5. Project created successfully:', JSON.stringify(data, null, 2))

    // Create initial version
    console.log('6. Creating initial version...')
    const { error: versionError } = await supabase
      .from('project_versions')
      .insert({
        project_id: data.id,
        version_number: 1,
        data: projectData || {},
      })

    if (versionError) {
      console.error('Version creation error:', versionError)
      // Don't fail the whole request if version creation fails
    } else {
      console.log('7. Initial version created successfully')
    }

    // Pre-populate initial documents based on template
    console.log('🚨 CHECKPOINT: About to check templateId:', templateId)
    if (templateId) {
      console.log('🚨 8. Pre-populating initial documents for template:', templateId)

      let initialDocuments: any[] = []

      // Check if this is a custom template
      if (templateId.startsWith('custom-')) {
        console.log('🚨   Detected CUSTOM template')

        // For custom templates, we need the templateData to be provided in the request
        if (templateData && templateData.stages) {
          console.log('🚨   Template data provided, extracting documents from stages')
          console.log('🚨   Template has', templateData.stages.length, 'stages')

          // Extract documents from all stages
          templateData.stages.forEach((stage: any, stageIndex: number) => {
            console.log(`🚨   Processing stage ${stageIndex + 1}: ${stage.name}`)
            console.log(`🚨     Stage has ${stage.documents?.length || 0} documents`)

            if (stage.documents && Array.isArray(stage.documents)) {
              stage.documents.forEach((doc: any) => {
                initialDocuments.push({
                  type: doc.type,
                  title: doc.label || doc.type,
                  stage: stage.id || stage.name.toLowerCase().replace(/\s+/g, '-'),
                  content: {},
                  status: 'draft'
                })
              })
            }
          })

          console.log(`🚨   Extracted ${initialDocuments.length} documents from custom template`)
        } else {
          console.log('🚨 ⚠️ Custom template but no templateData provided in request')
          console.log('🚨 ⚠️ Cannot pre-populate documents without template definition')
        }
      } else {
        // Built-in template - use existing function
        console.log('🚨   Using built-in template:', templateId)
        initialDocuments = getInitialDocuments(templateId)
      }

      console.log(`🚨   Found ${initialDocuments.length} documents to create`)
      console.log('🚨   Documents:', JSON.stringify(initialDocuments, null, 2))

      if (initialDocuments.length > 0) {
        const documentsToInsert = initialDocuments.map(doc => ({
          project_id: data.id,
          type: doc.type,
          title: doc.title,
          stage: doc.stage,
          content: doc.content,
          status: doc.status,
          progress: 0,
          metadata: {}
        }))

        console.log('🚨   About to insert documents:', JSON.stringify(documentsToInsert, null, 2))

        const { data: createdDocs, error: docsError } = await supabase
          .from('documents')
          .insert(documentsToInsert)
          .select()

        if (docsError) {
          console.error('🚨 ❌ Error creating initial documents:', docsError)
          console.error('🚨 ❌ Error details:', JSON.stringify(docsError, null, 2))
          // Don't fail the whole request if document creation fails
        } else {
          console.log(`🚨 ✅ Created ${createdDocs?.length || 0} initial documents`)
          console.log('🚨 ✅ Created docs:', JSON.stringify(createdDocs, null, 2))
        }
      } else {
        console.log('🚨 ⚠️ No documents to create (length is 0)')
      }
    } else {
      console.log('🚨 ⚠️ No templateId provided, skipping document pre-population')
    }

    console.log('9. Returning success response')
    console.log('========================================')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('========================================')
    console.error('POST /api/projects - EXCEPTION CAUGHT:')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('========================================')
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, data: projectData } = body

    // Get current project
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError) throw fetchError

    const newVersion = currentProject.current_version + 1

    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update({
        data: projectData,
        current_version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error

    // Create version snapshot
    await supabase
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: newVersion,
        data: projectData,
      })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
