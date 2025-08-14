import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Get organizations with member count
    const { data: organizations, error } = await supabaseAdmin
      .from("organizations")
      .select(`
        *,
        members:test_users(count)
      `)
      .order("name")

    if (error) throw error

    // Transform the data to include member count
    const orgsWithCounts =
      organizations?.map((org) => ({
        ...org,
        member_count: org.members?.[0]?.count || 0,
      })) || []

    return NextResponse.json(orgsWithCounts)
  } catch (error) {
    console.error("Failed to fetch organizations:", error)
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 })
    }

    const { data: organization, error } = await supabaseAdmin
      .from("organizations")
      .insert({ name })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Failed to create organization:", error)
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
  }
}
