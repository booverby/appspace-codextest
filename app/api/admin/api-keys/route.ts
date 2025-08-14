import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { encrypt } from "@/lib/crypto"

export async function GET() {
  try {
    console.log("=== API Keys GET Request Start ===")

    if (!supabaseAdmin) {
      console.error("Supabase admin client not available - check environment variables")
      return NextResponse.json(
        {
          error: "Database connection not available",
          details: "Supabase admin client is not configured. Please check environment variables.",
        },
        { status: 500 },
      )
    }

    console.log("Supabase admin client is available, attempting query...")

    const { data: testData, error: testError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .limit(1)

    if (testError) {
      console.error("Basic connection test failed:", testError)
      return NextResponse.json(
        {
          error: "Database connection test failed",
          details: testError.message,
        },
        { status: 500 },
      )
    }

    console.log("Basic connection test passed, fetching API keys...")

    const { data: apiKeys, error } = await supabaseAdmin
      .from("api_keys")
      .select(`
        *,
        organization:organizations(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch API keys", details: error.message }, { status: 500 })
    }

    console.log("API keys fetched successfully:", apiKeys?.length || 0, "records")

    // Don't return the actual encrypted keys, just metadata
    const safeKeys =
      apiKeys?.map((key) => ({
        ...key,
        encrypted_key: "***hidden***",
        has_key: !!key.encrypted_key,
      })) || []

    return NextResponse.json(safeKeys)
  } catch (error) {
    console.error("Failed to fetch API keys:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch API keys",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available - check environment variables")
      return NextResponse.json(
        {
          error: "Database connection not available",
          details: "Supabase admin client is not configured. Please check environment variables.",
        },
        { status: 500 },
      )
    }

    const { organization_id, provider, api_key } = await request.json()

    if (!organization_id || !provider || !api_key) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Encrypt the API key
    const encryptedKey = encrypt(api_key)

    const { data: savedKey, error } = await supabaseAdmin
      .from("api_keys")
      .upsert({ organization_id, provider, encrypted_key: encryptedKey }, { onConflict: "organization_id,provider" })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      ...savedKey,
      encrypted_key: "***hidden***",
      has_key: true,
    })
  } catch (error) {
    console.error("Failed to save API key:", error)
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 })
  }
}
