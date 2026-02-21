import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getInitialDocuments } from '@/lib/default-document-content'
import { STRIPE_PLANS } from '@/lib/stripe-products'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')

    // 1. Verify Auth
    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing Auth Header' }, { status: 401 });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Check Admin Status (for overrides)
    const { data: profile } = await supabase.from('profiles').select('is_admin, email').eq('id', user.id).single();
    const isAdmin = profile?.is_admin || ['casteelio@gmail.com', 'davidcasteel@gmail.com'].includes(profile?.email?.toLowerCase() || '');

    if (projectId) {
      // Get specific project
      const query = supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      const { data, error } = await query;

      if (error) throw error;

      // Ensure ownership or admin
      if (data.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(data)
    } else if (userId) {
      // Get all projects for user
      // BLOCK access to other users unless admin
      if (userId !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Default: Return OWN projects if no params
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error;
      return NextResponse.json(data);
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
    if (supabaseServiceKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. Cannot create projects.' },
        { status: 500 }
      );
    }

    console.log('========================================')
    console.log('POST /api/projects - Request received')
    console.log('========================================')

    const body = await request.json()

    // 1. Verify Auth
    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing Auth Header' }, { status: 401 });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let finalUserId = user.id;
    let finalUserEmail = user.email || '';

    const isFounder = ['casteelio@gmail.com', 'davidcasteel@gmail.com'].includes(user.email?.toLowerCase() || '');

    // 2. Admin/Founder Override Check (Optional - if admin wants to create for others)
    // We check if the request body tries to specify a different user.
    if (body.userId && body.userId !== user.id) {
      if (isFounder) {
        console.log(`👮‍♂️ Admin ${user.email} creating project for ${body.email || body.userId}`);
        // If admin, we allow using the body's userId - BUT we need to ensure that user exists in profiles.
        // For now, let's just stick to "creating for self" to be safe, unless specifically requested.
        // If we want to support admin creation, we'd set finalUserId = body.userId here.
        // But simpler is to enforce self-creation for now.
        // finalUserId = body.userId; 
      } else {
        // If not admin, ignore the body userId and force self.
        console.warn(`User ${user.id} tried to create project for ${body.userId}. Forced to self.`);
      }
    }

    const { productType, templateId, name, data: projectData, templateData } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Ensure Profile Exists (Self-Repair)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: finalUserId,
        email: finalUserEmail,
        // Don't overwrite existing sub status if it exists, but how to do that with upsert?
        // Actually, we shouldn't overwrite sub/tier here blindly if they already exist.
        // Better to just INSERT ON CONFLICT DO NOTHING for critical fields, 
        // OR just check if exists.
        // Let's rely on the trigger that creates profiles, OR just select first.
      }, { onConflict: 'id', ignoreDuplicates: true });
    // ignoreDuplicates=true avoids overwriting subscription_status with defaults if record exists

    if (profileError) console.warn('Profile Ensure Warning:', profileError.message);
    else console.log('✅ Ensured Profile exists for:', finalUserId);


    // --- CHECK PROJECT LIMITS ---
    // 1. Get current project count
    const { count: projectCount, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', finalUserId);

    if (countError) {
      console.error('Failed to check project count:', countError);
      return NextResponse.json({ error: 'Failed to verify project limits.' }, { status: 500 });
    }

    // 2. Get user's subscription tier
    const { data: userProfile, error: tierError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', finalUserId)
      .single();

    // Default to 'free' (Scout) if no profile or error
    const tierKey = (userProfile?.subscription_tier || 'free') as keyof typeof STRIPE_PLANS;
    const plan = STRIPE_PLANS[tierKey] || STRIPE_PLANS.free;

    // 3. Enforce Limit
    // Note: We check if count is >= max. (e.g. if max is 1, and they have 1, they cannot create another).
    if (!isFounder && (projectCount || 0) >= plan.maxProjects) {
      console.warn(`⛔️ User ${finalUserId} reached project limit for tier ${tierKey}. Count: ${projectCount}, Max: ${plan.maxProjects}`);
      return NextResponse.json(
        {
          error: `Project limit reached for ${plan.name} plan.`,
          code: 'PROJECT_LIMIT_REACHED',
          limit: plan.maxProjects,
          tier: tierKey
        },
        { status: 403 }
      );
    }
    console.log(`✅ Limit Check Passed: ${isFounder ? 'Founder Override' : `${projectCount}/${plan.maxProjects === Infinity ? '∞' : plan.maxProjects}`} (Tier: ${tierKey})`);
    // ----------------------------

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

    // 1. Verify Auth
    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing Auth Header' }, { status: 401 });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Check Admin Status (for overrides)
    const { data: profile } = await supabase.from('profiles').select('is_admin, email').eq('id', user.id).single();
    const isAdmin = profile?.is_admin || ['casteelio@gmail.com', 'davidcasteel@gmail.com'].includes(profile?.email?.toLowerCase() || '');


    // Get current project
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError) throw fetchError

    // 3. Verify Ownership
    if (currentProject.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // 1. Verify Auth
    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing Auth Header' }, { status: 401 });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Check Admin Status (for overrides)
    const { data: profile } = await supabase.from('profiles').select('is_admin, email').eq('id', user.id).single();
    const isAdmin = profile?.is_admin || ['casteelio@gmail.com', 'davidcasteel@gmail.com'].includes(profile?.email?.toLowerCase() || '');

    // Check ownership before delete!
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError) throw fetchError;

    if (currentProject.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
