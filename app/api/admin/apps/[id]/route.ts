import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { validateAppDefinition } from "@/lib/app-framework"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: app, error } = await supabaseAdmin.from("apps").select("*").eq("id", params.id).single()

    if (error) throw error

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    return NextResponse.json(app)
  } catch (error) {
    console.error("Failed to fetch app:", error)
    return NextResponse.json({ error: "Failed to fetch app" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appData = await request.json()

    // Validate app definition
    const validationErrors = validateAppDefinition({ ...appData, id: params.id })
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    const { data: updatedApp, error } = await supabaseAdmin
      .from("apps")
      .update({
        name: appData.name,
        description: appData.description,
        icon: appData.icon,
        version: appData.version,
        category: appData.category,
        permissions: appData.permissions,
        settings: appData.settings || {},
        author: appData.author,
        homepage: appData.homepage,
        repository: appData.repository,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    if (!updatedApp) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    return NextResponse.json(updatedApp)
  } catch (error) {
    console.error("Failed to update app:", error)
    return NextResponse.json({ error: "Failed to update app" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // First, remove app from all organizations
    await supabaseAdmin.from("org_apps").delete().eq("app_id", params.id)

    // Then delete the app
    const { error } = await supabaseAdmin.from("apps").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete app:", error)
    return NextResponse.json({ error: "Failed to delete app" }, { status: 500 })
  }
}
