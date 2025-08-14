import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: app, error } = await supabaseAdmin
      .from("apps")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    return NextResponse.json(app)
  } catch (error) {
    console.error("Failed to approve app:", error)
    return NextResponse.json({ error: "Failed to approve app" }, { status: 500 })
  }
}
