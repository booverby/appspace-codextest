import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get usage stats by app
    const { data: appUsage, error: appError } = await supabaseAdmin
      .from("usage_logs")
      .select(`
        app_id,
        app:apps(name, icon),
        created_at
      `)
      .gte("created_at", startDate.toISOString())

    if (appError) throw appError

    // Get usage stats by organization
    const { data: orgUsage, error: orgError } = await supabaseAdmin
      .from("usage_logs")
      .select(`
        tenant_id,
        tenant:tenants(name),
        created_at
      `)
      .gte("created_at", startDate.toISOString())

    if (orgError) throw orgError

    // Process app usage
    const appStats =
      appUsage?.reduce((acc: any, log) => {
        const appName = log.app?.name || "Unknown"
        acc[appName] = (acc[appName] || 0) + 1
        return acc
      }, {}) || {}

    // Process org usage
    const orgStats =
      orgUsage?.reduce((acc: any, log) => {
        const orgName = log.tenant?.name || "Unknown"
        acc[orgName] = (acc[orgName] || 0) + 1
        return acc
      }, {}) || {}

    // Get daily usage for chart
    const dailyUsage =
      appUsage?.reduce((acc: any, log) => {
        const date = new Date(log.created_at).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json({
      totalUsage: appUsage?.length || 0,
      appStats,
      orgStats,
      dailyUsage,
      period: `${days} days`,
    })
  } catch (error) {
    console.error("Failed to fetch usage analytics:", error)
    return NextResponse.json({ error: "Failed to fetch usage analytics" }, { status: 500 })
  }
}
