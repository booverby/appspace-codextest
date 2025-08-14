import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("=== DIAGNOSTIC TEST START ===")

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("SUPABASE_URL exists:", !!supabaseUrl)
    console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!serviceRoleKey)

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!serviceRoleKey,
          },
        },
        { status: 500 },
      )
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Supabase client created successfully")

    // Test simple query
    const { data, error } = await supabase.from("tenants").select("id, name").limit(1)

    console.log("Query result:", { data, error })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Database query failed",
          details: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Connection test successful",
      data: data,
    })
  } catch (error) {
    console.error("Diagnostic test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
