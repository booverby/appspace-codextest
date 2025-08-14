import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: organizationId } = params

    // Get all apps
    const { data: allApps, error: appsError } = await supabaseAdmin.from("apps").select("*").order("name")

    if (appsError) {
      console.error("Error fetching apps:", appsError)
      return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 })
    }

    // Get enabled apps for this organization
    const { data: enabledApps, error: enabledError } = await supabaseAdmin
      .from("org_apps")
      .select("app_id")
      .eq("organization_id", organizationId)

    if (enabledError) {
      console.error("Error fetching enabled apps:", enabledError)
      return NextResponse.json({ error: "Failed to fetch enabled apps" }, { status: 500 })
    }

    const enabledAppIds = new Set(enabledApps?.map((ea) => ea.app_id) || [])

    const appsWithStatus =
      allApps?.map((app) => ({
        ...app,
        enabled: enabledAppIds.has(app.id),
      })) || []

    return NextResponse.json(appsWithStatus)
  } catch (error) {
    console.error("Error in GET /api/admin/organizations/[id]/apps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: organizationId } = params
    const { appId, enabled } = await request.json()

    if (enabled) {
      // Enable app for organization
      const { error } = await supabaseAdmin.from("org_apps").insert({
        organization_id: organizationId,
        app_id: appId,
        enabled: true,
      })

      if (error) {
        console.error("Error enabling app:", error)
        return NextResponse.json({ error: "Failed to enable app" }, { status: 500 })
      }
    } else {
      // Disable app for organization
      const { error } = await supabaseAdmin
        .from("org_apps")
        .delete()
        .eq("organization_id", organizationId)
        .eq("app_id", appId)

      if (error) {
        console.error("Error disabling app:", error)
        return NextResponse.json({ error: "Failed to disable app" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/admin/organizations/[id]/apps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
