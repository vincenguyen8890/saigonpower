export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          preferred_language: 'vi' | 'en'
          role: 'customer' | 'admin' | 'agent'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          zip: string
          service_type: 'residential' | 'commercial'
          preferred_language: 'vi' | 'en'
          status: 'new' | 'contacted' | 'quoted' | 'enrolled' | 'lost'
          source: string | null
          notes: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      quote_requests: {
        Row: {
          id: string
          lead_id: string | null
          user_id: string | null
          service_type: 'residential' | 'commercial'
          name: string
          email: string
          phone: string
          zip: string
          business_name: string | null
          monthly_usage_kwh: number | null
          notes: string | null
          preferred_language: 'vi' | 'en'
          status: 'pending' | 'reviewed' | 'sent' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quote_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quote_requests']['Insert']>
      }
      providers: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website: string | null
          phone: string | null
          description: string | null
          rating: number | null
          review_count: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['providers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['providers']['Insert']>
      }
      plans: {
        Row: {
          id: string
          provider_id: string
          name: string
          rate_kwh: number
          rate_kwh_500: number | null
          rate_kwh_2000: number | null
          term_months: number
          rate_type: 'fixed' | 'variable' | 'indexed'
          plan_type: 'residential' | 'commercial' | 'both'
          renewable_percent: number
          cancellation_fee: number
          monthly_fee: number
          avg_monthly_bill: number
          badges: Json
          features: Json
          terms_url: string | null
          efl_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['plans']['Insert']>
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          provider_id: string
          service_address: string
          zip: string
          esid: string | null
          start_date: string
          end_date: string
          rate_kwh: number
          term_months: number
          service_type: 'residential' | 'commercial'
          status: 'active' | 'expired' | 'cancelled' | 'pending'
          renewal_reminded: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title_vi: string
          title_en: string
          excerpt_vi: string | null
          excerpt_en: string | null
          content_vi: string | null
          content_en: string | null
          author_id: string | null
          cover_image: string | null
          tags: Json
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
    }
  }
}
