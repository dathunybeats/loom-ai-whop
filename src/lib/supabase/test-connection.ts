import { createClient } from './client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()

    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase connection test successful')
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function testSupabaseAuth() {
  try {
    const supabase = createClient()

    // Test auth connection
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Supabase auth test failed:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase auth test successful')
    return { success: true, session: data.session }
  } catch (error) {
    console.error('Supabase auth test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}