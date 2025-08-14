import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== Database Connection Test ===")

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
            hasServiceKey: !!serviceRoleKey,
          },
        },
        { status: 500 },
      )
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Supabase client created successfully")

    // Test 1: Simple query to check connection
    console.log("Testing basic connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("users").select("count").limit(1)

    if (connectionError) {
      console.error("Connection test failed:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionError,
        },
        { status: 500 },
      )
    }

    console.log("Connection test passed")

    // Test 2: Check if api_keys table exists
    console.log("Testing api_keys table access...")
    const { data: apiKeysTest, error: apiKeysError } = await supabase.from("api_keys").select("count").limit(1)

    if (apiKeysError) {
      console.error("API keys table test failed:", apiKeysError)
      return NextResponse.json(
        {
          success: false,
          error: "API keys table access failed",
          details: apiKeysError,
        },
        { status: 500 },
      )
    }

    console.log("API keys table test passed")

    // Test 3: Try the actual query from the failing endpoint
    console.log("Testing full API keys query...")
    const { data: apiKeys, error: queryError } = await supabase
      .from("api_keys")
      .select(`
        id,
        name,
        key_preview,
        provider,
        created_at,
        updated_at,
        organization:organizations(name)
      `)
      .order("created_at", { ascending: false })

    if (queryError) {
      console.error("Full query test failed:", queryError)
      return NextResponse.json(
        {
          success: false,
          error: "Full API keys query failed",
          details: queryError,
        },
        { status: 500 },
      )
    }

    console.log("Full query test passed, found", apiKeys?.length || 0, "API keys")

    return NextResponse.json({
      success: true,
      message: "All database tests passed",
      results: {
        connectionTest: "passed",
        apiKeysTableTest: "passed",
        fullQueryTest: "passed",
        apiKeysCount: apiKeys?.length || 0,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error during database test",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
