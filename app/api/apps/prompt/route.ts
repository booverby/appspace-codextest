import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { decrypt } from "@/lib/crypto"

export async function POST(request: Request) {
  try {
    const { message, organizationId, userId } = await request.json()

    console.log("Prompt API called with:", { message: message?.substring(0, 50), organizationId, userId })

    if (!message || !organizationId || !userId) {
      console.log("Missing required fields:", { message: !!message, organizationId: !!organizationId, userId: !!userId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.ENCRYPTION_KEY) {
      console.error("ENCRYPTION_KEY environment variable not set")
      return NextResponse.json({ error: "Server configuration error: encryption key not set" }, { status: 500 })
    }

    // Check if user has access to this app
    const { data: orgApp, error: orgAppError } = await supabaseAdmin
      .from("org_apps")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("app_id", "550e8400-e29b-41d4-a716-446655440001") // Prompt app ID
      .eq("enabled", true)
      .single()

    console.log("Org app check:", { orgApp, orgAppError, organizationId })

    if (orgAppError) {
      console.error("Database error checking org_apps:", orgAppError)
      return NextResponse.json({ error: `Database error: ${orgAppError.message}` }, { status: 500 })
    }

    if (!orgApp) {
      console.log("App not enabled for organization:", organizationId)
      return NextResponse.json({ error: "App not enabled for your organization" }, { status: 403 })
    }

    // Get organization's OpenAI API key
    const { data: apiKey, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("encrypted_key")
      .eq("organization_id", organizationId)
      .eq("provider", "openai")
      .single()

    console.log("API key check:", { hasApiKey: !!apiKey, apiKeyError, organizationId })

    if (apiKeyError) {
      console.error("Database error fetching API key:", apiKeyError)
      return NextResponse.json({ error: `Database error: ${apiKeyError.message}` }, { status: 500 })
    }

    if (!apiKey) {
      console.log("No OpenAI API key found for organization:", organizationId)
      return NextResponse.json({ error: "No OpenAI API key configured for your organization" }, { status: 400 })
    }

    // Decrypt the API key
    let decryptedKey: string
    try {
      decryptedKey = decrypt(apiKey.encrypted_key)
      console.log("API key decrypted successfully")
    } catch (decryptError) {
      console.error("Failed to decrypt API key:", decryptError)
      return NextResponse.json(
        {
          error: `Failed to decrypt API key: ${decryptError instanceof Error ? decryptError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    console.log("Calling OpenAI API directly...")
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${decryptedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenAI API error response:", response.status, errorData)
        return NextResponse.json({ error: `OpenAI API error: ${response.status} ${errorData}` }, { status: 500 })
      }

      const data = await response.json()
      const text = data.choices[0]?.message?.content || "No response generated"

      console.log("OpenAI response received, length:", text.length)

      // Log usage
      try {
        await supabaseAdmin.from("usage_logs").insert({
          user_id: userId,
          organization_id: organizationId,
          app_id: "550e8400-e29b-41d4-a716-446655440001",
          action: "prompt_completion",
          metadata: {
            app_name: "Prompt",
            prompt_length: message.length,
            response_length: text.length,
          },
        })
      } catch (logError) {
        console.error("Failed to log usage:", logError)
        // Don't fail the request if logging fails
      }

      return NextResponse.json({ response: text })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      return NextResponse.json(
        {
          error: `OpenAI API error: ${openaiError instanceof Error ? openaiError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Prompt API error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
