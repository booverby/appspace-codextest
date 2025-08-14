import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data: members, error } = await supabaseAdmin
      .from("test_users")
      .select("*")
      .eq("tenant_id", id)
      .order("name")

    if (error) throw error

    return NextResponse.json(members || [])
  } catch (error) {
    console.error("Failed to fetch organization members:", error)
    return NextResponse.json({ error: "Failed to fetch organization members" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { user_ids } = await request.json()

    if (!user_ids || !Array.isArray(user_ids)) {
      return NextResponse.json({ error: "user_ids array is required" }, { status: 400 })
    }

    // Update users to belong to this organization
    const { data: updatedUsers, error } = await supabaseAdmin
      .from("test_users")
      .update({ tenant_id: id })
      .in("id", user_ids)
      .select()

    if (error) throw error

    return NextResponse.json(updatedUsers)
  } catch (error) {
    console.error("Failed to add members to organization:", error)
    return NextResponse.json({ error: "Failed to add members to organization" }, { status: 500 })
  }
}
