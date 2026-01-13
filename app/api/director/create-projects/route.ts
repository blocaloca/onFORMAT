import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTemplate } from '@/lib/project-templates'

// Create service role client that bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    console.log('🎬 DIRECTOR API: Received project creation request')

    const { userId, projects } = await request.json()

    console.log('📦 Request data:', { userId, projectCount: projects?.length })
    console.log('📋 Projects to create:', projects)

    if (!userId || !projects || !Array.isArray(projects)) {
      console.error('❌ Invalid request: missing userId or projects array')
      return NextResponse.json(
        { error: 'userId and projects array are required' },
        { status: 400 }
      )
    }

    console.log('✅ Using user ID from frontend:', userId)

    const createdProjects = []
    const errors = []

    for (const projectData of projects) {
      console.log(`🔨 Creating project: "${projectData.name}"`)

      // Get the template to understand the structure
      const template = getTemplate(projectData.type)
      if (!template) {
        const errorMsg = `Template not found: ${projectData.type}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
        continue
      }

      console.log(`✅ Template found: ${template.name}`)

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: projectData.name,
          product_type: 'LuxPixPro',
          current_version: 1,
          data: {
            template_id: projectData.type,
            status: 'active',
            budget: projectData.budget,
            deliverables: projectData.deliverables
          }
        })
        .select()
        .single()

      if (projectError) {
        const errorMsg = `Error creating project "${projectData.name}": ${projectError.message}`
        console.error('❌', errorMsg)
        console.error('Full error:', JSON.stringify(projectError, null, 2))
        errors.push(errorMsg)
        continue
      }

      if (!project) {
        const errorMsg = `Project creation returned null for "${projectData.name}"`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
        continue
      }

      console.log(`✅ Project created with ID: ${project.id}`)

      // Create only essential pre-filled documents
      let docCount = 0
      const documentsToCreate = []

      // Phase 1 Cleanup: Updated to use new document types and stage names
      // Always create Brief (has deliverables info)
      documentsToCreate.push({
        project_id: project.id,
        type: 'brief',
        title: 'Brief',
        stage: 'concept', // Updated from 'develop'
        content: {
          projectObjective: projectData.deliverables || '',
          budget: projectData.budget || '',
          timeline: 'To be determined',
          deliverables: projectData.deliverables || '',
          notes: `Created by Director from conversation`
        },
        status: 'draft',
        progress: 0,
        completed: false,
        metadata: {
          createdBy: 'Director',
          projectType: projectData.type
        }
      })

      // Always create Budget (has breakdown)
      const budgetAmount = parseInt(projectData.budget?.replace(/[$,]/g, '') || '10000')
      documentsToCreate.push({
        project_id: project.id,
        type: 'budget',
        title: 'Budget',
        stage: 'plan',
        content: {
          lineItems: [
            { category: 'Production', description: 'Main production costs', amount: Math.round(budgetAmount * 0.5) },
            { category: 'Talent', description: 'Talent and crew fees', amount: Math.round(budgetAmount * 0.3) },
            { category: 'Equipment', description: 'Equipment and location', amount: Math.round(budgetAmount * 0.2) }
          ],
          total: budgetAmount,
          contingency: Math.round(budgetAmount * 0.1),
          notes: `Budget from conversation with Director`
        },
        status: 'draft',
        progress: 0,
        completed: false,
        metadata: {
          createdBy: 'Director',
          projectType: projectData.type
        }
      })

      // Add Creative Direction document (formerly treatment/shot-book)
      documentsToCreate.push({
        project_id: project.id,
        type: 'creative-direction', // New consolidated type
        title: 'Creative Direction',
        stage: 'concept',
        content: {
          projectBudget: projectData.budget,
          projectDeliverables: projectData.deliverables,
          notes: `Visual approach and creative direction from conversation`
        },
        status: 'draft',
        progress: 0,
        completed: false,
        metadata: {
          createdBy: 'Director',
          projectType: projectData.type
        }
      })

      // Insert all documents at once
      const { error: docError } = await supabase
        .from('documents')
        .insert(documentsToCreate)

      if (docError) {
        console.error(`❌ Error creating documents:`, docError)
        console.error('Document error details:', JSON.stringify(docError, null, 2))
      } else {
        docCount = documentsToCreate.length
        console.log(`✅ Created ${docCount} essential documents (only populated ones)`)
      }

      console.log(`✅ Created ${docCount} documents for project ${project.id}`)

      createdProjects.push(project)
    }

    console.log(`🎉 Successfully created ${createdProjects.length} project(s)`)

    if (createdProjects.length === 0) {
      console.error('❌ No projects were created')
      console.error('Errors:', errors)
      return NextResponse.json({
        error: errors.length > 0 ? errors.join('; ') : 'Failed to create projects',
        details: errors
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      projects: createdProjects
    })
  } catch (error: any) {
    console.error('💥 DIRECTOR API ERROR:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to create projects' },
      { status: 500 }
    )
  }
}
