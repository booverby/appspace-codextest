import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { decrypt } from "@/lib/crypto"
import { tenantAuth } from "@/lib/tenant-auth"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    console.log("Prompt API called with:", { message: message?.substring(0, 50) })

    if (!message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const auth = await tenantAuth("Prompt")
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error.message, code: auth.error.code },
        { status: auth.error.status },
      )
    }

    const { tenant, user, app } = auth.data

    if (!process.env.ENCRYPTION_KEY) {
      console.error("ENCRYPTION_KEY environment variable not set")
      return NextResponse.json({ error: "Server configuration error: encryption key not set" }, { status: 500 })
    }

    // Get organization's OpenAI API key
    const { data: apiKey, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("encrypted_key")
      .eq("tenant_id", tenant.id)
      .eq("provider", "openai")
      .single()

    console.log("API key check:", { hasApiKey: !!apiKey, apiKeyError, tenantId: tenant.id })

    if (apiKeyError) {
      console.error("Database error fetching API key:", apiKeyError)
      return NextResponse.json({ error: `Database error: ${apiKeyError.message}` }, { status: 500 })
    }

    if (!apiKey) {
      console.log("No OpenAI API key found for tenant:", tenant.id)
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
          user_id: user.id,
          tenant_id: tenant.id,
          app_id: app?.id || "",
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
