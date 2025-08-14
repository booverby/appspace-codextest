import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from("usage_logs")
      .select(`
        *,
        user:test_users(name, email),
        tenant:tenants(name),
        app:apps(name, icon)
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error("Failed to fetch usage logs:", error)
    return NextResponse.json({ error: "Failed to fetch usage logs" }, { status: 500 })
  }
}
