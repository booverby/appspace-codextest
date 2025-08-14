import type React from "react"
import type { User, Organization } from "./types"

// App Framework Types
export interface AppDefinition {
  id: string
  name: string
  description: string
  icon: string
  version: string
  category: AppCategory
  permissions: Permission[]
  settings?: AppSettings
  author?: string
  homepage?: string
  repository?: string
}

export interface AppComponent {
  component: React.ComponentType<AppProps>
  configComponent?: React.ComponentType<AppConfigProps>
}

export interface AppProps {
  user: User
  organization: Organization
  apiKeys: Record<string, string>
  onUsageLog: (action: string, metadata?: any) => void
}

export interface AppConfigProps {
  organization: Organization
  currentConfig?: AppSettings
  onConfigUpdate: (config: AppSettings) => void
}

export type AppCategory = "ai-ml" | "productivity" | "communication" | "analytics" | "integration" | "utility"

export type Permission = "api-access" | "file-upload" | "external-requests" | "user-data" | "organization-data"

export interface AppSettings {
  [key: string]: any
}

// App Registry
export class AppRegistry {
  private static apps = new Map<string, AppDefinition>()
  private static components = new Map<string, AppComponent>()

  static register(definition: AppDefinition, component: AppComponent) {
    this.apps.set(definition.id, definition)
    this.components.set(definition.id, component)
  }

  static getApp(id: string): AppDefinition | undefined {
    return this.apps.get(id)
  }

  static getComponent(id: string): AppComponent | undefined {
    return this.components.get(id)
  }

  static getAllApps(): AppDefinition[] {
    return Array.from(this.apps.values())
  }

  static getAppsByCategory(category: AppCategory): AppDefinition[] {
    return Array.from(this.apps.values()).filter((app) => app.category === category)
  }
}

// App Utilities
export function validateAppPermissions(app: AppDefinition, userPermissions: Permission[]): boolean {
  return app.permissions.every((permission) => userPermissions.includes(permission))
}

export function createUsageLogger(userId: string, organizationId: string, appId: string) {
  return async (action: string, metadata?: any) => {
    try {
      await fetch("/api/usage-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          organization_id: organizationId,
          app_id: appId,
          action,
          metadata,
        }),
      })
    } catch (error) {
      console.error("Failed to log usage:", error)
    }
  }
}

// App Validation
export function validateAppDefinition(definition: AppDefinition): string[] {
  const errors: string[] = []

  if (!definition.id || !/^[a-z0-9-]+$/.test(definition.id)) {
    errors.push("App ID must be lowercase alphanumeric with hyphens only")
  }

  if (!definition.name || definition.name.length < 3) {
    errors.push("App name must be at least 3 characters")
  }

  if (!definition.description || definition.description.length < 10) {
    errors.push("App description must be at least 10 characters")
  }

  if (!definition.version || !/^\d+\.\d+\.\d+$/.test(definition.version)) {
    errors.push("App version must follow semantic versioning (x.y.z)")
  }

  return errors
}
