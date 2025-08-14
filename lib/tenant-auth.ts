import { getCurrentUser } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase/server"
import type { TestUser, Tenant, App } from "@/lib/types"

export interface AuthError {
  code:
    | "UNAUTHENTICATED"
    | "SUPER_ADMIN"
    | "NO_TENANT"
    | "CONFIG_ERROR"
    | "DB_ERROR"
    | "APP_NOT_FOUND"
    | "APP_NOT_ENABLED"
    | "ORG_NOT_FOUND"
  message: string
  status: number
}

export interface AuthSuccess {
  user: TestUser
  tenant: Tenant
  app?: Pick<App, "id" | "name">
}

export type AuthResult =
  | { success: true; data: AuthSuccess }
  | { success: false; error: AuthError }

interface AuthOptions {
  getUser?: () => Promise<TestUser | null>
  db?: any
}

export async function tenantAuth(
  appName?: string,
  options: AuthOptions = {},
): Promise<AuthResult> {
  const getUserFn = options.getUser || getCurrentUser
  const db = options.db || supabaseAdmin

  if (!db) {
    return {
      success: false,
      error: {
        code: "CONFIG_ERROR",
        message: "Database connection not available",
        status: 500,
      },
    }
  }

  const user = await getUserFn()
  if (!user) {
    return {
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "User is not authenticated",
        status: 401,
      },
    }
  }

  if (user.role === "super_admin") {
    return {
      success: false,
      error: {
        code: "SUPER_ADMIN",
        message: "Super admins cannot access member apps",
        status: 403,
      },
    }
  }

  if (!user.tenant_id) {
    return {
      success: false,
      error: {
        code: "NO_TENANT",
        message: "User is not assigned to an organization",
        status: 403,
      },
    }
  }

  // Fetch tenant
  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .select("*")
    .eq("id", user.tenant_id)
    .single()

  if (tenantError || !tenant) {
    return {
      success: false,
      error: {
        code: "ORG_NOT_FOUND",
        message: "Organization not found",
        status: 404,
      },
    }
  }

  let app: Pick<App, "id" | "name"> | undefined

  if (appName) {
    // Try exact match
    const { data: appData, error: appError } = await db
      .from("apps")
      .select("id, name")
      .eq("name", appName)
      .single()

    if (appError && appError.code !== "PGRST116") {
      return {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Failed to query application",
          status: 500,
        },
      }
    }

    app = appData as any

    if (!app) {
      const { data: allApps } = await db.from("apps").select("id, name")
      if (allApps) {
        app = allApps.find((a: App) => a.name.toLowerCase() === appName.toLowerCase())
      }
    }

    if (!app) {
      return {
        success: false,
        error: {
          code: "APP_NOT_FOUND",
          message: `App '${appName}' not found`,
          status: 404,
        },
      }
    }

    const { data: orgApp, error: orgAppError } = await db
      .from("org_apps")
      .select("*")
      .eq("tenant_id", user.tenant_id)
      .eq("app_id", app.id)
      .eq("enabled", true)
      .single()

    if (orgAppError && orgAppError.code !== "PGRST116") {
      return {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Failed to verify app access",
          status: 500,
        },
      }
    }

    if (!orgApp) {
      return {
        success: false,
        error: {
          code: "APP_NOT_ENABLED",
          message: "App not enabled for your organization",
          status: 403,
        },
      }
    }
  }

  return { success: true, data: { user, tenant, app } }
}
