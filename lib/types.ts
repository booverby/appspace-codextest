export interface Tenant {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface App {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
}

export interface OrgApp {
  id: string
  tenant_id: string
  app_id: string
  enabled: boolean
  created_at: string
}

export interface ApiKey {
  id: string
  tenant_id: string
  provider: string
  encrypted_key: string
  created_at: string
  updated_at: string
}

export interface TestUser {
  id: string
  email: string
  password: string
  name: string
  role: "super_admin" | "member"
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export type User = TestUser

export interface UsageLog {
  id: string
  user_id: string
  tenant_id: string
  app_id: string
  action: string
  metadata: any
  created_at: string
}

export interface Organization extends Tenant {
  description?: string
  member_count: number
  members?: TestUser[]
}

export interface OrganizationMember {
  id: string
  user_id: string
  organization_id: string
  role: "admin" | "member"
  joined_at: string
}
