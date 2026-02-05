import { createBrowserClient } from '@supabase/ssr'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_status: 'active' | 'inactive' | 'trial'
          subscription_tier: 'basic' | 'pro' | 'enterprise' | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      projects: {
        Row: {
          id: string
          user_id: string
          product_type: 'LuxPixPro' | 'GenStudioPro' | 'ArtMind' | null
          template_id: 'commercial-video' | 'commercial-photography' | 'social-content' | 'brand-campaign' | null
          name: string
          data: any
          current_version: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      project_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          data: any
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_versions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['project_versions']['Insert']>
      }
      documents: {
        Row: {
          id: string
          project_id: string
          type: string
          title: string
          stage: 'concept' | 'develop' | 'plan' | 'execute' | 'wrap'
          content: any
          status: 'draft' | 'in-progress' | 'review' | 'approved' | 'archived'
          progress: number
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      crew_membership: {
        Row: {
          id: string
          project_id: string
          user_email: string
          role: 'owner' | 'producer' | 'editor' | 'viewer'
          is_verified: boolean
          invited_at: string
        }
        Insert: Omit<Database['public']['Tables']['crew_membership']['Row'], 'id' | 'invited_at'>
        Update: Partial<Database['public']['Tables']['crew_membership']['Insert']>
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// KILL THE SINGLETON
// Export a function that creates a fresh client every time.
export const getClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)

// KEEP BACKWARD COMPAT (TEMPORARY)
// We must keep 'supabase' export for now to avoid breaking 100+ files instantly.
// But we re-assign it to a getter or a fresh instance.
// WARNING: This is still a singleton if just assigned.
// For true fix, we need to migrate usages. 
// BUT for immediate patch, we can make 'supabase' a lazy proxy or just keep it 
// and rely on getClient() for critical auth flows.

// Better approach for Refactor:
// We export 'supabase' as a fresh instance but we know it might be cached by module system.
// The critical fix is using getClient() in Auth flows.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
