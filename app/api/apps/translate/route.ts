import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { decrypt } from "@/lib/crypto"

const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
}

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang, organizationId, userId } = await request.json()

    if (!text || !sourceLang || !targetLang || !organizationId || !userId) {
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
      .eq("app_id", "550e8400-e29b-41d4-a716-446655440002") // Translate app ID
      .eq("enabled", true)
      .single()

    if (orgAppError || !orgApp) {
      return NextResponse.json({ error: "App not enabled for your organization" }, { status: 403 })
    }

    // Get organization's OpenAI API key
    const { data: apiKey, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("encrypted_key")
      .eq("organization_id", organizationId)
      .eq("provider", "openai")
      .single()

    if (apiKeyError || !apiKey) {
      return NextResponse.json({ error: "No OpenAI API key configured for your organization" }, { status: 400 })
    }

    // Decrypt the API key
    let decryptedKey: string
    try {
      decryptedKey = decrypt(apiKey.encrypted_key)
    } catch (decryptError) {
      console.error("Failed to decrypt API key:", decryptError)
      return NextResponse.json({ error: "Failed to decrypt API key" }, { status: 500 })
    }

    // Generate translation using direct OpenAI API call
    const prompt = `Translate the following text from ${languageNames[sourceLang]} to ${languageNames[targetLang]}. Only return the translation, no additional text:

${text}`

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
              content: prompt,
            },
          ],
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenAI API error response:", response.status, errorData)
        return NextResponse.json({ error: `OpenAI API error: ${response.status}` }, { status: 500 })
      }

      const data = await response.json()
      const translation = data.choices[0]?.message?.content || "Translation failed"

      // Log usage
      try {
        await supabaseAdmin.from("usage_logs").insert({
          user_id: userId,
          organization_id: organizationId,
          app_id: "550e8400-e29b-41d4-a716-446655440002",
          action: "translation",
          metadata: {
            app_name: "Translate",
            source_lang: sourceLang,
            target_lang: targetLang,
            text_length: text.length,
            translation_length: translation.length,
          },
        })
      } catch (logError) {
        console.error("Failed to log usage:", logError)
        // Don't fail the request if logging fails
      }

      return NextResponse.json({ translation })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
    }
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
