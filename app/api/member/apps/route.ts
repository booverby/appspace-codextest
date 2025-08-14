import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const { data: apiKeys, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(1)

    if (apiKeyError) throw apiKeyError

    const hasApiKey = apiKeys && apiKeys.length > 0

    const { data: enabledApps, error } = await supabaseAdmin
      .from("org_apps")
      .select(`
        app:apps(*)
      `)
      .eq("organization_id", organizationId)
      .eq("enabled", true)

    if (error) throw error

    const apps = enabledApps?.map((item) => item.app).filter(Boolean) || []

    return NextResponse.json({ apps, hasApiKey })
  } catch (error) {
    console.error("Failed to fetch enabled apps:", error)
    return NextResponse.json({ error: "Failed to fetch enabled apps" }, { status: 500 })
  }
}
