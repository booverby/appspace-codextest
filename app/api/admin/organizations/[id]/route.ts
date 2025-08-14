import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get organization with members
    const { data: organization, error } = await supabaseAdmin
      .from("tenants")
      .select(`
        *,
        members:test_users(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Failed to fetch organization:", error)
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 })
    }

    const { data: organization, error } = await supabaseAdmin
      .from("tenants")
      .update({ name })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Failed to update organization:", error)
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if organization has members
    const { data: members, error: membersError } = await supabaseAdmin
      .from("test_users")
      .select("id")
      .eq("tenant_id", id)

    if (membersError) throw membersError

    if (members && members.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete organization with existing members. Remove all members first." },
        { status: 400 },
      )
    }

    // Delete organization
    const { error } = await supabaseAdmin.from("tenants").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete organization:", error)
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 })
  }
}
