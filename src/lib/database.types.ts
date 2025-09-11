export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          company: string | null
          email_notifications: boolean | null
          marketing_emails: boolean | null
          new_project_notifications: boolean | null
          video_generation_notifications: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          new_project_notifications?: boolean | null
          video_generation_notifications?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          new_project_notifications?: boolean | null
          video_generation_notifications?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          base_video_url: string | null
          voice_sample_url: string | null
          prospects_count: number
          videos_generated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          base_video_url?: string | null
          voice_sample_url?: string | null
          prospects_count?: number
          videos_generated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          base_video_url?: string | null
          voice_sample_url?: string | null
          prospects_count?: number
          videos_generated?: number
          created_at?: string
          updated_at?: string
        }
      }
      prospects: {
        Row: {
          id: string
          project_id: string
          user_id: string
          first_name: string
          last_name: string | null
          email: string
          company: string | null
          title: string | null
          phone: string | null
          custom_fields: Json
          video_status: string
          video_url: string | null
          video_generated_at: string | null
          email_sent_at: string | null
          video_viewed_at: string | null
          video_view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          first_name: string
          last_name?: string | null
          email: string
          company?: string | null
          title?: string | null
          phone?: string | null
          custom_fields?: Json
          video_status?: string
          video_url?: string | null
          video_generated_at?: string | null
          email_sent_at?: string | null
          video_viewed_at?: string | null
          video_view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          first_name?: string
          last_name?: string | null
          email?: string
          company?: string | null
          title?: string | null
          phone?: string | null
          custom_fields?: Json
          video_status?: string
          video_url?: string | null
          video_generated_at?: string | null
          email_sent_at?: string | null
          video_viewed_at?: string | null
          video_view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      csv_uploads: {
        Row: {
          id: string
          project_id: string
          user_id: string
          filename: string
          file_size: number
          total_rows: number
          successful_imports: number
          failed_imports: number
          status: string
          error_message: string | null
          import_errors: Json
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          filename: string
          file_size: number
          total_rows: number
          successful_imports?: number
          failed_imports?: number
          status?: string
          error_message?: string | null
          import_errors?: Json
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          filename?: string
          file_size?: number
          total_rows?: number
          successful_imports?: number
          failed_imports?: number
          status?: string
          error_message?: string | null
          import_errors?: Json
          created_at?: string
          completed_at?: string | null
        }
      }
      analytics: {
        Row: {
          id: string
          prospect_id: string
          event_type: string
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prospect_id: string
          event_type: string
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prospect_id?: string
          event_type?: string
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      video_jobs: {
        Row: {
          id: string
          project_id: string
          prospect_id: string
          status: string
          progress: number
          error_message: string | null
          result_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          prospect_id: string
          status?: string
          progress?: number
          error_message?: string | null
          result_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          prospect_id?: string
          status?: string
          progress?: number
          error_message?: string | null
          result_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}