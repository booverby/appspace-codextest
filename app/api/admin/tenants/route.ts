import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data: tenants, error } = await supabaseAdmin.from("tenants").select("*").order("name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch tenants", details: error.message }, { status: 500 })
    }

    return NextResponse.json(tenants || [])
  } catch (error) {
    console.error("Failed to fetch tenants:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tenants",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data: tenant, error } = await supabaseAdmin.from("tenants").insert({ name }).select().single()

    if (error) throw error

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Failed to create tenant:", error)
    return NextResponse.json({ error: "Failed to create tenant" }, { status: 500 })
  }
}
