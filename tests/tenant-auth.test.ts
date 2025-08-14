import test from "node:test"
import assert from "node:assert/strict"
import { tenantAuth } from "../lib/tenant-auth"
import type { TestUser } from "../lib/types"

class SupabaseStub {
  private tables: Record<string, any[]>
  constructor(tables: Record<string, any[]>) {
    this.tables = tables
  }

  from(table: string) {
    const tableData = this.tables[table] || []
    const builder: any = {
      _filters: [] as [string, any][],
      select: (_cols?: string) => builder,
      eq: (col: string, value: any) => {
        builder._filters.push([col, value])
        return builder
      },
      single: async () => {
        const row = tableData.find((row: any) =>
          builder._filters.every(([c, v]) => row[c] === v),
        )
        if (row) {
          return { data: row, error: null }
        }
        return { data: null, error: { code: "PGRST116", message: "No rows" } }
      },
      then: (resolve: any) => {
        return Promise.resolve({ data: tableData, error: null }).then(resolve)
      },
    }
    return builder
  }
}

test("returns error when user not authenticated", async () => {
  const db = new SupabaseStub({})
  const result = await tenantAuth("Prompt", { getUser: async () => null, db })
  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(result.error.code, "UNAUTHENTICATED")
  }
})

test("denies access when app not enabled", async () => {
  const user: TestUser = {
    id: "u1",
    email: "",
    password: "",
    name: "Test",
    role: "member",
    tenant_id: "t1",
    created_at: "",
    updated_at: "",
  }

  const db = new SupabaseStub({
    tenants: [{ id: "t1", name: "Acme", created_at: "", updated_at: "" }],
    apps: [{ id: "app1", name: "Prompt" }],
    org_apps: [],
  })

  const result = await tenantAuth("Prompt", { getUser: async () => user, db })
  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(result.error.code, "APP_NOT_ENABLED")
  }
})

test("allows access when org and app valid", async () => {
  const user: TestUser = {
    id: "u1",
    email: "",
    password: "",
    name: "Test",
    role: "member",
    tenant_id: "t1",
    created_at: "",
    updated_at: "",
  }

  const db = new SupabaseStub({
    tenants: [{ id: "t1", name: "Acme", created_at: "", updated_at: "" }],
    apps: [{ id: "app1", name: "Prompt" }],
    org_apps: [{ tenant_id: "t1", app_id: "app1", enabled: true }],
  })

  const result = await tenantAuth("Prompt", { getUser: async () => user, db })
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.user.id, "u1")
    assert.equal(result.data.app?.name, "Prompt")
    assert.equal(result.data.tenant.id, "t1")
  }
})
