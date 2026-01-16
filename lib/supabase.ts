import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

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
    }
  }
}
