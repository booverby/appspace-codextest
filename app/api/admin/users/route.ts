import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from("test_users")
      .select(`
        *,
        organization:organizations(name)
      `)
      .order("name")

    if (error) throw error

    return NextResponse.json(users || [])
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role, organization_id } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from("test_users")
      .insert({ email, password, name, role, organization_id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
