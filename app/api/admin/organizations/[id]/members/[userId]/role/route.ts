import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function PUT(request: Request, { params }: { params: { id: string; userId: string } }) {
  try {
    const { userId } = params
    const { role } = await request.json()

    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required (admin or member)" }, { status: 400 })
    }

    // For now, we'll store role in the user's metadata or create a separate table
    // Since we don't have org_members table yet, we'll use a simple approach
    const { data: updatedUser, error } = await supabaseAdmin
      .from("test_users")
      .update({
        // Store org role in a metadata field - this would ideally be in a separate org_members table
        role: role === "admin" ? "org_admin" : "member",
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Failed to update member role:", error)
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 })
  }
}
