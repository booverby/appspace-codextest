import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()

    // Clear the demo user session cookie
    cookieStore.delete("demo_user_id")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to logout:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
