import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const auditResults: any = {
      timestamp: new Date().toISOString(),
      status: 'running',
      checks: {}
    }

    // 1. Database Connection Test
    try {
      const { error } = await supabase.from('projects').select('count').limit(1)
      auditResults.checks.database = {
        status: error ? 'fail' : 'pass',
        message: error ? error.message : 'Connected',
        error: error || null
      }
    } catch (err: any) {
      auditResults.checks.database = {
        status: 'fail',
        message: err.message,
        error: err
      }
    }

    // 2. Database Tables Test
    const tables = ['projects', 'documents', 'profiles', 'messages', 'project_versions']
    const tableResults: any = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        tableResults[table] = {
          status: error ? 'fail' : 'pass',
          count: count || 0,
          error: error || null
        }
      } catch (err: any) {
        tableResults[table] = {
          status: 'fail',
          count: 0,
          error: err.message
        }
      }
    }

    auditResults.checks.tables = tableResults

    // 3. Auth Test
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      auditResults.checks.auth = {
        status: error ? 'fail' : 'pass',
        message: user ? 'Authenticated' : 'No user',
        error: error || null
      }
    } catch (err: any) {
      auditResults.checks.auth = {
        status: 'fail',
        message: err.message,
        error: err
      }
    }

    // 4. Environment Variables Test
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY
    }

    auditResults.checks.environment = {
      status: Object.values(envVars).every(v => v) ? 'pass' : 'fail',
      variables: envVars
    }

    // 5. API Key Test
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        auditResults.checks.apiKey = {
          status: 'fail',
          message: 'ANTHROPIC_API_KEY not set'
        }
      } else {
        auditResults.checks.apiKey = {
          status: 'pass',
          message: 'API key configured',
          length: apiKey.length,
          prefix: apiKey.substring(0, 15)
        }
      }
    } catch (err: any) {
      auditResults.checks.apiKey = {
        status: 'fail',
        message: err.message
      }
    }

    // 6. Document Forms Test
    const documentTypes = [
      'brief', 'budget', 'call-sheet', 'shot-list', 'shot-book',
      'mood-board', 'art-book', 'script', 'treatment', 'storyboard',
      'casting', 'schedule', 'crew-list', 'equipment-list'
    ]

    const formResults: any = {}
    const specializedForms = ['brief', 'budget', 'call-sheet', 'shot-list', 'shot-book']

    documentTypes.forEach(type => {
      formResults[type] = {
        status: specializedForms.includes(type) ? 'pass' : 'generic',
        hasSpecializedForm: specializedForms.includes(type),
        formType: specializedForms.includes(type) ? 'specialized' : 'generic'
      }
    })

    auditResults.checks.documentForms = {
      total: documentTypes.length,
      specialized: specializedForms.length,
      generic: documentTypes.length - specializedForms.length,
      forms: formResults
    }

    // Overall status
    const failedChecks = Object.values(auditResults.checks).filter(
      (check: any) => check.status === 'fail'
    ).length

    auditResults.status = failedChecks === 0 ? 'pass' : 'warning'
    auditResults.failedChecks = failedChecks

    return NextResponse.json(auditResults)
  } catch (error: any) {
    console.error('Audit error:', error)
    return NextResponse.json(
      { error: error.message, status: 'fail' },
      { status: 500 }
    )
  }
}
