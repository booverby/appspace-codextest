import { supabaseAdmin } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { TestUser } from "@/lib/types"

export async function getCurrentUser(): Promise<TestUser | null> {
  try {
    if (!supabaseAdmin) {
      console.warn("Supabase admin client not available")
      return null
    }

    let userId = "550e8400-e29b-41d4-a716-446655440000" // Default to John from Acme

    try {
      const cookieStore = cookies()
      const userCookie = cookieStore.get("demo_user_id")
      if (userCookie?.value) {
        userId = userCookie.value
      }
    } catch (error) {
      // If cookies() fails (e.g., in non-server context), use default
      console.warn("Could not read cookies, using default user")
    }

    const { data: users, error } = await supabaseAdmin
      .from("test_users")
      .select("*")
      .eq("id", userId)

    if (error) {
      console.error("Error fetching current user:", error)
      return null
    }

    if (!users || users.length === 0) {
      console.warn("No user found with ID:", userId)
      return null
    }

    return users[0] || null
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

export async function getAllUsers(): Promise<TestUser[]> {
  try {
    if (!supabaseAdmin) {
      console.warn("Supabase admin client not available")
      return []
    }

    const { data: users, error } = await supabaseAdmin
      .from("test_users")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching all users:", error)
      return []
    }

    return users || []
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return []
  }
}

export async function switchUser(userId: string) {
  try {
    console.log("Switching to user:", userId)
    // In a real implementation, this would update the session
    // For now, just log the action
  } catch (error) {
    console.error("Error switching user:", error)
  }
}
