import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const supabaseAdmin = (() => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("Supabase Admin Client Initialization:")
  console.log("- URL available:", !!supabaseUrl)
  console.log("- URL value:", supabaseUrl?.substring(0, 20) + "...")
  console.log("- Service key available:", !!supabaseServiceKey)
  console.log("- Service key length:", supabaseServiceKey?.length || 0)

  if (!supabaseUrl) {
    console.error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable")
    return null
  }

  if (!supabaseServiceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
    return null
  }

  try {
    const client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "User-Agent": "supabase-admin-client",
        },
      },
    })
    console.log("Supabase admin client created successfully")
    return client
  } catch (error) {
    console.error("Failed to create Supabase admin client:", error)
    return null
  }
})()
