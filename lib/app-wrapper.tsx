import type React from "react"
import { redirect } from "next/navigation"
import { createUsageLogger } from "@/lib/app-framework"
import type { AppProps } from "@/lib/app-framework"
import { tenantAuth } from "@/lib/tenant-auth"
import { supabaseAdmin } from "@/lib/supabase/server"

interface AppWrapperProps {
  appId: string
  children: (props: AppProps) => React.ReactNode
}

export async function AppWrapper({ appId, children }: AppWrapperProps) {
  try {
    const auth = await tenantAuth(appId)

    if (!auth.success) {
      if (auth.error.code === "UNAUTHENTICATED") {
        redirect("/")
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{auth.error.code}</h1>
            <p className="text-gray-600">{auth.error.message}</p>
          </div>
        </div>
      )
    }

    const { user, tenant, app } = auth.data

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

    const apiKeys: Record<string, string> = {}
    try {
      const { data: apiKeysData, error: apiKeysError } = await supabaseAdmin
        .from("api_keys")
        .select("provider, encrypted_key")
        .eq("tenant_id", tenant.id)

      if (apiKeysError) {
        console.error("API keys lookup failed:", apiKeysError)
      } else if (apiKeysData) {
        for (const keyData of apiKeysData) {
          apiKeys[keyData.provider] = keyData.encrypted_key
        }
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    }

    const onUsageLog = createUsageLogger(user.id, tenant.id, app?.id || "")

    const appProps: AppProps = {
      user,
      organization: tenant,
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
