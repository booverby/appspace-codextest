import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Key Test Started ===")
    const { organization_id, provider } = await request.json()
    console.log("Request data:", { organization_id, provider })

    if (!organization_id || !provider) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ success: false, message: "Missing organization_id or provider" }, { status: 400 })
    }

    // Check if ENCRYPTION_KEY is available
    if (!process.env.ENCRYPTION_KEY) {
      console.log("❌ ENCRYPTION_KEY environment variable not set")
      return NextResponse.json(
        { success: false, message: "Server configuration error: ENCRYPTION_KEY not set" },
        { status: 500 },
      )
    }

    // Get Supabase client
    console.log("🔍 Connecting to database...")
    const supabase = createServerComponentClient({ cookies })

    // Get the API key for this organization and provider
    console.log(`🔍 Looking for API key: organization_id=${organization_id}, provider=${provider}`)
    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("encrypted_key, created_at")
      .eq("organization_id", organization_id)
      .eq("provider", provider)
      .single()

    if (keyError) {
      console.log("❌ Database error:", keyError)
      return NextResponse.json({ success: false, message: `Database error: ${keyError.message}` }, { status: 500 })
    }

    if (!apiKeyData) {
      console.log("❌ No API key found")
      return NextResponse.json(
        { success: false, message: "No API key found for this organization and provider" },
        { status: 404 },
      )
    }

    console.log("✅ API key found, created at:", apiKeyData.created_at)

    // Decrypt the API key
    console.log("🔓 Attempting to decrypt API key...")
    let decryptedKey: string
    try {
      decryptedKey = decrypt(apiKeyData.encrypted_key)
      console.log("✅ API key decrypted successfully")
      console.log("🔑 Decrypted key details:", {
        length: decryptedKey?.length || 0,
        startsWithSk: decryptedKey?.startsWith("sk-") || false,
        hasValidFormat: decryptedKey ? /^sk-[a-zA-Z0-9]{48,}$/.test(decryptedKey) : false,
        isEmpty: !decryptedKey || decryptedKey.trim() === "",
        firstChars: decryptedKey ? decryptedKey.substring(0, 8) + "..." : "null/undefined",
      })
    } catch (error: any) {
      console.log("❌ Decryption failed:", error.message)
      return NextResponse.json(
        { success: false, message: `Failed to decrypt API key: ${error.message}` },
        { status: 500 },
      )
    }

    if (!decryptedKey || decryptedKey.trim() === "") {
      console.log("❌ Decrypted key is empty or null")
      return NextResponse.json(
        { success: false, message: "Decrypted API key is empty - encryption/decryption may have failed" },
        { status: 500 },
      )
    }

    // Validate API key format
    if (!decryptedKey.startsWith("sk-")) {
      console.log("❌ Invalid API key format - doesn't start with sk-")
      return NextResponse.json(
        { success: false, message: "Invalid OpenAI API key format - should start with 'sk-'" },
        { status: 400 },
      )
    }

    // Test the API key based on provider
    if (provider === "openai") {
      console.log("🤖 Testing OpenAI API key...")
      console.log("🔑 About to call OpenAI with key:", decryptedKey.substring(0, 8) + "...")
      try {
        const startTime = Date.now()

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${decryptedKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say 'Hello' in one word only." }],
            max_tokens: 10,
          }),
        })

        const duration = Date.now() - startTime

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log("❌ OpenAI API error response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          })

          let errorMessage = "OpenAI API test failed"
          if (response.status === 401) {
            errorMessage = "Invalid OpenAI API key - check that the key is correct and active"
          } else if (response.status === 429) {
            errorMessage = "OpenAI API rate limit exceeded - try again in a moment"
          } else if (errorData.error?.code === "insufficient_quota") {
            errorMessage = "OpenAI API quota exceeded - check your billing and usage limits"
          } else if (errorData.error?.message) {
            errorMessage = `OpenAI API error: ${errorData.error.message}`
          }

          return NextResponse.json({
            success: false,
            message: errorMessage,
            details: {
              status: response.status,
              error: errorData.error,
            },
          })
        }

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content?.trim() || ""

        console.log("✅ OpenAI API response received:", { text, duration: `${duration}ms`, usage: data.usage })

        if (text) {
          console.log("✅ API key test successful!")
          return NextResponse.json({
            success: true,
            message: `OpenAI API key is working correctly! Response: "${text}" (${duration}ms)`,
          })
        } else {
          console.log("⚠️ Empty response content")
          return NextResponse.json({
            success: false,
            message: "OpenAI API responded but with empty content",
          })
        }
      } catch (error: any) {
        console.log("❌ OpenAI API error:", {
          message: error.message,
          stack: error.stack?.split("\n")[0],
        })

        let errorMessage = "OpenAI API test failed"
        if (error.message?.includes("ENOTFOUND") || error.message?.includes("network")) {
          errorMessage = "Network error - check internet connection"
        } else if (error.message?.includes("timeout")) {
          errorMessage = "OpenAI API timeout - try again"
        } else if (error.message) {
          errorMessage = `OpenAI API error: ${error.message}`
        }

        return NextResponse.json({
          success: false,
          message: errorMessage,
          details: {
            error: error.message,
          },
        })
      }
    } else {
      console.log("❌ Unsupported provider:", provider)
      return NextResponse.json(
        { success: false, message: `Testing not implemented for provider: ${provider}` },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("❌ Test API key server error:", {
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 3),
    })
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error.message}`,
        details: error.stack?.split("\n")[0],
      },
      { status: 500 },
    )
  }
}
