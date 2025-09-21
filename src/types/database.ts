// Database Types for Loom.AI - Matches the new 6-table schema
// Generated from consolidated schema migration (8 tables → 6 tables)

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      prospects: {
        Row: Prospect
        Insert: ProspectInsert
        Update: ProspectUpdate
      }
      csv_uploads: {
        Row: CsvUpload
        Insert: CsvUploadInsert
        Update: CsvUploadUpdate
      }
      video_jobs: {
        Row: VideoJob
        Insert: VideoJobInsert
        Update: VideoJobUpdate
      }
      video_usage: {
        Row: VideoUsage
        Insert: VideoUsageInsert
        Update: VideoUsageUpdate
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_video_usage: {
        Args: { user_id: string; count?: number }
        Returns: boolean
      }
      create_trial_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      subscription_status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due'
      video_status: 'pending' | 'processing' | 'completed' | 'failed'
      csv_upload_status: 'processing' | 'completed' | 'failed'
      video_job_status: 'pending' | 'processing' | 'completed' | 'failed'
    }
  }
}

// ============================================================================
// USERS TABLE (Unified profiles + subscriptions)
// ============================================================================

export interface User {
  id: string

  // Profile fields
  email: string | null
  full_name: string | null
  avatar_url: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  company: string | null

  // Subscription fields
  plan_id: string
  plan_name: string | null
  subscription_status: Database['public']['Enums']['subscription_status']
  billing_period: string | null
  current_period_start: string
  current_period_end: string
  videos_used: number
  videos_limit: number

  // Payment integration
  dodo_subscription_id: string | null
  dodo_customer_id: string | null
  dodo_checkout_session_id: string | null

  // Preferences
  email_notifications: boolean | null
  marketing_emails: boolean | null
  new_project_notifications: boolean | null
  video_generation_notifications: boolean | null

  // Onboarding
  welcomed_at: string | null
  onboarding_completed: boolean | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company?: string | null
  plan_id?: string
  plan_name?: string | null
  subscription_status?: Database['public']['Enums']['subscription_status']
  billing_period?: string | null
  current_period_start?: string
  current_period_end?: string
  videos_used?: number
  videos_limit?: number
  dodo_subscription_id?: string | null
  dodo_customer_id?: string | null
  dodo_checkout_session_id?: string | null
  email_notifications?: boolean | null
  marketing_emails?: boolean | null
  new_project_notifications?: boolean | null
  video_generation_notifications?: boolean | null
  welcomed_at?: string | null
  onboarding_completed?: boolean | null
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company?: string | null
  plan_id?: string
  plan_name?: string | null
  subscription_status?: Database['public']['Enums']['subscription_status']
  billing_period?: string | null
  current_period_start?: string
  current_period_end?: string
  videos_used?: number
  videos_limit?: number
  dodo_subscription_id?: string | null
  dodo_customer_id?: string | null
  dodo_checkout_session_id?: string | null
  email_notifications?: boolean | null
  marketing_emails?: boolean | null
  new_project_notifications?: boolean | null
  video_generation_notifications?: boolean | null
  welcomed_at?: string | null
  onboarding_completed?: boolean | null
  updated_at?: string
}

// ============================================================================
// PROJECTS TABLE
// ============================================================================

export interface Project {
  id: string
  user_id: string | null
  name: string
  description: string | null
  base_video_url: string | null
  voice_sample_url: string | null
  created_at: string
  updated_at: string
  prospects_count: number | null
  videos_generated: number | null
}

export interface ProjectInsert {
  id?: string
  user_id?: string | null
  name: string
  description?: string | null
  base_video_url?: string | null
  voice_sample_url?: string | null
  created_at?: string
  updated_at?: string
  prospects_count?: number | null
  videos_generated?: number | null
}

export interface ProjectUpdate {
  user_id?: string | null
  name?: string
  description?: string | null
  base_video_url?: string | null
  voice_sample_url?: string | null
  updated_at?: string
  prospects_count?: number | null
  videos_generated?: number | null
}

// ============================================================================
// PROSPECTS TABLE (Enhanced with scraping fields)
// ============================================================================

export interface Prospect {
  id: string
  project_id: string | null
  user_id: string
  first_name: string
  last_name: string | null
  email: string | null
  company: string | null
  title: string | null
  phone: string | null
  website_url: string | null

  // Video fields
  personalized_video_url: string | null
  video_status: Database['public']['Enums']['video_status'] | null
  video_url: string | null
  video_generated_at: string | null

  // Enhanced scraping fields (added in migration)
  website_title: string | null
  website_description: string | null
  website_content: string | null
  screenshot_url: string | null
  website_scraped_at: string | null

  // Communication tracking
  email_sent_at: string | null

  // Flexible data
  custom_fields: Record<string, any> | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface ProspectInsert {
  id?: string
  project_id?: string | null
  user_id: string
  first_name: string
  last_name?: string | null
  email?: string | null
  company?: string | null
  title?: string | null
  phone?: string | null
  website_url?: string | null
  personalized_video_url?: string | null
  video_status?: Database['public']['Enums']['video_status'] | null
  video_url?: string | null
  video_generated_at?: string | null
  website_title?: string | null
  website_description?: string | null
  website_content?: string | null
  screenshot_url?: string | null
  website_scraped_at?: string | null
  email_sent_at?: string | null
  custom_fields?: Record<string, any> | null
  created_at?: string
  updated_at?: string
}

export interface ProspectUpdate {
  project_id?: string | null
  user_id?: string
  first_name?: string
  last_name?: string | null
  email?: string | null
  company?: string | null
  title?: string | null
  phone?: string | null
  website_url?: string | null
  personalized_video_url?: string | null
  video_status?: Database['public']['Enums']['video_status'] | null
  video_url?: string | null
  video_generated_at?: string | null
  website_title?: string | null
  website_description?: string | null
  website_content?: string | null
  screenshot_url?: string | null
  website_scraped_at?: string | null
  email_sent_at?: string | null
  custom_fields?: Record<string, any> | null
  updated_at?: string
}

// ============================================================================
// CSV_UPLOADS TABLE
// ============================================================================

export interface CsvUpload {
  id: string
  project_id: string
  user_id: string
  filename: string
  file_size: number
  total_rows: number
  successful_imports: number | null
  failed_imports: number | null
  status: Database['public']['Enums']['csv_upload_status'] | null
  error_message: string | null
  import_errors: Record<string, any> | null
  created_at: string
  completed_at: string | null
}

export interface CsvUploadInsert {
  id?: string
  project_id: string
  user_id: string
  filename: string
  file_size: number
  total_rows: number
  successful_imports?: number | null
  failed_imports?: number | null
  status?: Database['public']['Enums']['csv_upload_status'] | null
  error_message?: string | null
  import_errors?: Record<string, any> | null
  created_at?: string
  completed_at?: string | null
}

export interface CsvUploadUpdate {
  project_id?: string
  user_id?: string
  filename?: string
  file_size?: number
  total_rows?: number
  successful_imports?: number | null
  failed_imports?: number | null
  status?: Database['public']['Enums']['csv_upload_status'] | null
  error_message?: string | null
  import_errors?: Record<string, any> | null
  completed_at?: string | null
}

// ============================================================================
// VIDEO_JOBS TABLE
// ============================================================================

export interface VideoJob {
  id: string
  project_id: string | null
  prospect_id: string | null
  status: Database['public']['Enums']['video_job_status'] | null
  progress: number | null
  error_message: string | null
  result_url: string | null
  created_at: string
  updated_at: string
}

export interface VideoJobInsert {
  id?: string
  project_id?: string | null
  prospect_id?: string | null
  status?: Database['public']['Enums']['video_job_status'] | null
  progress?: number | null
  error_message?: string | null
  result_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface VideoJobUpdate {
  project_id?: string | null
  prospect_id?: string | null
  status?: Database['public']['Enums']['video_job_status'] | null
  progress?: number | null
  error_message?: string | null
  result_url?: string | null
  updated_at?: string
}

// ============================================================================
// VIDEO_USAGE TABLE
// ============================================================================

export interface VideoUsage {
  id: string
  user_id: string
  month: string
  videos_generated: number
  plan_limit: number
  last_reset: string | null
  created_at: string
  updated_at: string
}

export interface VideoUsageInsert {
  id?: string
  user_id: string
  month: string
  videos_generated?: number
  plan_limit?: number
  last_reset?: string | null
  created_at?: string
  updated_at?: string
}

export interface VideoUsageUpdate {
  user_id?: string
  month?: string
  videos_generated?: number
  plan_limit?: number
  last_reset?: string | null
  updated_at?: string
}

// ============================================================================
// HELPER TYPES FOR APPLICATION USE
// ============================================================================

// Combined user data (for contexts and components)
export interface UserWithSubscription extends User {
  // Helper computed properties
  isActive: boolean
  canCreateVideo: boolean
  videosRemaining: number
  daysUntilReset: number
}

// Project with related data
export interface ProjectWithStats extends Project {
  prospect_count: number
  videos_generated_count: number
  success_rate: number
}

// Prospect with video status
export interface ProspectWithVideo extends Prospect {
  has_video: boolean
  video_ready: boolean
  processing_status: string
}

// CSV upload with progress
export interface CsvUploadWithProgress extends CsvUpload {
  progress_percentage: number
  is_processing: boolean
  has_errors: boolean
}

// Video job with prospect info
export interface VideoJobWithProspect extends VideoJob {
  prospect_name: string
  prospect_email: string
  project_name: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Subscription plan info
export interface PlanInfo {
  id: string
  name: string
  price: string
  videos_limit: number
  features: string[]
}

// Analytics event type
export interface AnalyticsEvent {
  prospect_id: string
  event_type: 'view' | 'click' | 'share' | 'download'
  timestamp: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
}