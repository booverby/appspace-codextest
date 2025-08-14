import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { tenantAuth } from "@/lib/tenant-auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantIdParam = searchParams.get("tenantId")

    const auth = await tenantAuth()
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error.message, code: auth.error.code },
        { status: auth.error.status },
      )
    }

    const { tenant } = auth.data

    if (tenantIdParam && tenantIdParam !== tenant.id) {
      return NextResponse.json({ error: "Tenant mismatch" }, { status: 403 })
    }

    const { data: apiKeys, error: apiKeyError } = await supabaseAdmin
      .from("api_keys")
      .select("id")
      .eq("tenant_id", tenant.id)
      .limit(1)

    if (apiKeyError) throw apiKeyError

    const hasApiKey = apiKeys && apiKeys.length > 0

    const { data: enabledApps, error } = await supabaseAdmin
      .from("org_apps")
      .select(`
        app:apps(*)
      `)
      .eq("tenant_id", tenant.id)
      .eq("enabled", true)

    if (error) throw error

    const apps = enabledApps?.map((item) => item.app).filter(Boolean) || []

    return NextResponse.json({ apps, hasApiKey })
  } catch (error) {
    console.error("Failed to fetch enabled apps:", error)
    return NextResponse.json({ error: "Failed to fetch enabled apps" }, { status: 500 })
  }
}
