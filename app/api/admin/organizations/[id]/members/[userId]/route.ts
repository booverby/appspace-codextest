import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: { id: string; userId: string } }) {
  try {
    const { userId } = params

    // Remove user from organization by setting organization_id to null
    const { data: updatedUser, error } = await supabaseAdmin
      .from("test_users")
      .update({ organization_id: null })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Failed to remove member from organization:", error)
    return NextResponse.json({ error: "Failed to remove member from organization" }, { status: 500 })
  }
}
