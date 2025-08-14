import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { validateAppDefinition } from "@/lib/app-framework"

export async function GET() {
  try {
    const { data: apps, error } = await supabaseAdmin.from("apps").select("*").order("name")

    if (error) throw error

    return NextResponse.json(apps || [])
  } catch (error) {
    console.error("Failed to fetch apps:", error)
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const appData = await request.json()

    // Validate app definition
    const validationErrors = validateAppDefinition(appData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Check if app ID already exists
    const { data: existingApp } = await supabaseAdmin.from("apps").select("id").eq("id", appData.id).single()

    if (existingApp) {
      return NextResponse.json(
        {
          error: "App ID already exists",
        },
        { status: 409 },
      )
    }

    // Insert new app
    const { data: newApp, error } = await supabaseAdmin
      .from("apps")
      .insert({
        id: appData.id,
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
        status: "pending", // New apps start as pending approval
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newApp, { status: 201 })
  } catch (error) {
    console.error("Failed to create app:", error)
    return NextResponse.json({ error: "Failed to create app" }, { status: 500 })
  }
}
