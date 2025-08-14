import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/server"
import { createUsageLogger } from "@/lib/app-framework"
import type { AppProps } from "@/lib/app-framework"

interface AppWrapperProps {
  appId: string
  children: (props: AppProps) => React.ReactNode
}

export async function AppWrapper({ appId, children }: AppWrapperProps) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/")
    }

    if (user.role === "super_admin") {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Super admins cannot access member apps.</p>
          </div>
        </div>
      )
    }

    if (!user.tenant_id) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Organization</h1>
            <p className="text-gray-600">You must be assigned to an organization to use this app.</p>
          </div>
        </div>
      )
    }

    if (!supabaseAdmin) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
            <p className="text-gray-600">Database connection not available.</p>
          </div>
        </div>
      )
    }

    console.log("Looking for app with name:", appId)

    // Try exact match first
    let app = null
    try {
      // Try exact match first
      const { data: exactApp, error: appError } = await supabaseAdmin
        .from("apps")
        .select("id, name")
        .eq("name", appId)
        .single()

      if (exactApp) {
        app = exactApp
      } else {
        // If exact match fails, try case-insensitive match
        console.log("Exact match failed, trying case-insensitive lookup")
        const { data: allApps, error: allAppsError } = await supabaseAdmin.from("apps").select("id, name")

        if (allAppsError) {
          console.error("Failed to fetch apps:", allAppsError)
          throw new Error("Database query failed")
        }

        if (allApps) {
          app = allApps.find((a) => a.name.toLowerCase() === appId.toLowerCase()) || null
          console.log("Case-insensitive lookup result:", app)
        }
      }
    } catch (dbError) {
      console.error("Database error during app lookup:", dbError)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Error</h1>
            <p className="text-gray-600">Unable to connect to the database. Please try again later.</p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {dbError instanceof Error ? dbError.message : "Unknown error"}
            </p>
          </div>
        </div>
      )
    }

    console.log("Final app lookup result:", { app })

    if (!app) {
      let allApps = null
      try {
        const { data: appsData } = await supabaseAdmin.from("apps").select("id, name")
        allApps = appsData
      } catch (error) {
        console.error("Error fetching available apps:", error)
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">App Not Found</h1>
            <p className="text-gray-600">The requested app "{appId}" could not be found.</p>
            {allApps && allApps.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Available apps: {allApps.map((a) => a.name).join(", ")}</p>
                <p className="mt-2">Note: App names are case-sensitive. Please check the exact spelling.</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    console.log("Checking org app access for tenant:", user.tenant_id, "app:", app.id)

    let orgApp = null
    try {
      const { data: orgAppData, error: orgAppError } = await supabaseAdmin
        .from("org_apps")
        .select("*")
        .eq("tenant_id", user.tenant_id)
        .eq("app_id", app.id)
        .eq("enabled", true)
        .single()

      if (orgAppError && orgAppError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Org app lookup error:", orgAppError)
        throw new Error("Failed to check app access")
      }

      orgApp = orgAppData
    } catch (error) {
      console.error("Error checking organization app access:", error)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Check Failed</h1>
            <p className="text-gray-600">Unable to verify app access permissions.</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later or contact support.</p>
          </div>
        </div>
      )
    }

    console.log("Org app lookup result:", { orgApp })

    if (!orgApp) {
      let allOrgApps = null
      try {
        const { data: orgAppsData } = await supabaseAdmin
          .from("org_apps")
          .select("*, apps(name)")
          .eq("tenant_id", user.tenant_id)
        allOrgApps = orgAppsData
      } catch (error) {
        console.error("Error fetching organization apps:", error)
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">App Not Available</h1>
            <p className="text-gray-600">This app is not enabled for your organization.</p>
            {allOrgApps && allOrgApps.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Your organization has access to: {allOrgApps.filter((oa) => oa.enabled).length} apps</p>
                <p className="mt-1">Contact your administrator to enable access to "{app.name}".</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    let organization = null
    try {
      const { data: orgData, error: orgError } = await supabaseAdmin
        .from("tenants")
        .select("*")
        .eq("id", user.tenant_id)
        .single()

      if (orgError) {
        console.error("Organization lookup failed:", orgError)
        throw new Error("Failed to fetch organization")
      }

      organization = orgData
    } catch (error) {
      console.error("Error fetching organization:", error)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Error</h1>
            <p className="text-gray-600">Unable to load organization information.</p>
            <p className="text-sm text-gray-500 mt-2">Please contact support if this issue persists.</p>
          </div>
        </div>
      )
    }

    if (!organization) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
            <p className="text-gray-600">Your organization could not be found.</p>
            <p className="text-sm text-gray-500 mt-2">Please contact support if this issue persists.</p>
          </div>
        </div>
      )
    }

    const apiKeys: Record<string, string> = {}
    try {
      const { data: apiKeysData, error: apiKeysError } = await supabaseAdmin
        .from("api_keys")
        .select("provider, encrypted_key")
        .eq("tenant_id", user.tenant_id)

      if (apiKeysError) {
        console.error("API keys lookup failed:", apiKeysError)
        // Don't throw here, just log the error and continue with empty apiKeys
      } else if (apiKeysData) {
        for (const keyData of apiKeysData) {
          apiKeys[keyData.provider] = keyData.encrypted_key
        }
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
      // Continue with empty apiKeys rather than crashing
    }

    const onUsageLog = createUsageLogger(user.id, user.tenant_id, app.id)

    const appProps: AppProps = {
      user,
      organization,
      apiKeys,
      onUsageLog,
    }

    return <>{children(appProps)}</>
  } catch (error) {
    console.error("Unhandled error in AppWrapper:", error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h1>
          <p className="text-gray-600">An unexpected error occurred while loading the application.</p>
          <p className="text-sm text-gray-500 mt-2">
            Please refresh the page or contact support if the issue persists.
          </p>
          <div className="mt-4">
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block">
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
