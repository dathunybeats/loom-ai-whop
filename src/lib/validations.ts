import { z } from 'zod'

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const emailSchema = z.string().email('Invalid email format')
export const urlSchema = z.string().url('Invalid URL format')

// File validation schemas
export const videoFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive').max(100 * 1024 * 1024, 'File size must be less than 100MB'),
  type: z.string().regex(/^video\/(mp4|mov|avi|webm)$/, 'Invalid video file type. Supported: mp4, mov, avi, webm'),
})

export const csvFileSchema = z.object({
  name: z.string().min(1, 'File name is required').regex(/\.csv$/i, 'File must be a CSV'),
  size: z.number().positive('File size must be positive').max(10 * 1024 * 1024, 'CSV file size must be less than 10MB'),
  type: z.string().refine(type => type === 'text/csv' || type === 'application/vnd.ms-excel', 'Invalid CSV file type'),
})

// User validation schemas
export const userProfileSchema = z.object({
  id: uuidSchema,
  email: emailSchema.optional(),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name too long').optional(),
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  last_name: z.string().max(50, 'Last name too long').optional(),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]*$/, 'Invalid phone number format').optional().or(z.literal('')),
  company: z.string().max(100, 'Company name too long').optional(),
})

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
})

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: uuidSchema,
  base_video_url: urlSchema.optional(),
  voice_sample_url: urlSchema.optional(),
})

// Prospect validation schemas
export const prospectSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z.string()
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-']*$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  email: emailSchema,
  company: z.string().max(100, 'Company name too long').optional(),
  title: z.string().max(100, 'Title too long').optional(),
  phone: z.string()
    .regex(/^[\+]?[\d\s\-\(\)]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  social_media_url: z.string().url('Invalid social media URL').optional().or(z.literal('')),
  custom_fields: z.record(z.string(), z.any()).optional(),
})

export const createProspectSchema = z.object({
  project_id: uuidSchema,
  prospects: z.array(prospectSchema).min(1, 'At least one prospect is required').max(1000, 'Maximum 1000 prospects per upload'),
})

// CSV upload validation
export const csvUploadSchema = z.object({
  project_id: uuidSchema,
  filename: z.string().min(1, 'Filename is required'),
  file_size: z.number().positive('File size must be positive'),
  total_rows: z.number().min(1, 'File must contain at least one row'),
})

// Video upload validation schemas
export const videoUploadSchema = z.object({
  projectId: uuidSchema,
  file: z.any().refine((file) => file instanceof File, 'Valid file is required'),
})


// Share project validation
export const shareProjectSchema = z.object({
  projectId: uuidSchema,
})

// Analytics validation schemas
export const analyticsEventSchema = z.object({
  prospect_id: uuidSchema,
  event_type: z.enum(['view', 'click', 'share', 'download'], {
    message: 'Event type must be one of: view, click, share, download',
  }),
  metadata: z.record(z.string(), z.any()).optional(),
  ip_address: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'Invalid IP address').optional(),
  user_agent: z.string().optional(),
})

// Authentication validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
})

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Settings validation schemas
export const userSettingsSchema = z.object({
  email_notifications: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  new_project_notifications: z.boolean().optional(),
  video_generation_notifications: z.boolean().optional(),
})

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Search and filter validation
export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  filters: z.record(z.string(), z.any()).optional(),
})

// Error response validation
export const apiErrorSchema = z.object({
  error: z.string().min(1, 'Error message is required'),
  code: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
})

// Success response validation
export const apiSuccessSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
})

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`)
    }
    throw error
  }
}

// Helper function to validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  const data: Record<string, string | string[]> = {}

  for (const [key, value] of params.entries()) {
    if (data[key]) {
      // Convert to array if multiple values
      if (Array.isArray(data[key])) {
        (data[key] as string[]).push(value)
      } else {
        data[key] = [data[key] as string, value]
      }
    } else {
      data[key] = value
    }
  }

  return validateRequestBody(schema, data)
}