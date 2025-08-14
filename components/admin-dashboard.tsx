"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Zap, Activity, Trash2, Plus } from "lucide-react"
import { UserManagementDialog } from "@/components/user-management-dialog"
import { ApiKeyManagement } from "@/components/api-key-management"
import { UsageAnalytics } from "@/components/usage-analytics"
import { OrganizationManagement } from "@/components/organization-management"
import type { Organization, TestUser, App, UsageLog } from "@/lib/types"
import Link from "next/link"

export function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<TestUser[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [organizationsRes, usersRes, appsRes, logsRes] = await Promise.all([
        fetch("/api/admin/organizations"),
        fetch("/api/admin/users"),
        fetch("/api/admin/apps"),
        fetch("/api/admin/usage-logs"),
      ])

      const [organizationsData, usersData, appsData, logsData] = await Promise.all([
        organizationsRes.json(),
        usersRes.json(),
        appsRes.json(),
        logsRes.json(),
      ])

      setOrganizations(organizationsData)
      setUsers(usersData)
      setApps(appsData)
      setUsageLogs(logsData)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete user")

      fetchData() // Refresh data
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>
  }

  const totalMembers = organizations.reduce((sum, organization) => sum + (organization.member_count || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
            <p className="text-xs text-muted-foreground">{totalMembers} total members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apps</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="usage">Usage Logs</TabsTrigger>
          <TabsTrigger value="test">System Test</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </div>
              <UserManagementDialog onUserSaved={fetchData} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.organization_id && (
                        <p className="text-xs text-gray-400">
                          Org: {organizations.find((t) => t.id === user.organization_id)?.name || "Unknown"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>{user.role}</Badge>
                      <UserManagementDialog user={user} onUserSaved={fetchData} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Manage available apps</CardDescription>
              </div>
              <Link href="/admin/add-app">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New App
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{app.icon}</div>
                      <div>
                        <h3 className="font-medium">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <ApiKeyManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <UsageAnalytics />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Logs</CardTitle>
              <CardDescription>Recent activity across all organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{log.action}</h3>
                      <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">{log.metadata?.app_name || "Unknown App"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Testing</CardTitle>
              <CardDescription>Test API keys, database connections, and system functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Access comprehensive system testing tools including API key validation, database connectivity tests,
                  and custom endpoint testing.
                </p>
                <Link href="/admin/test">
                  <Button className="nordic-button-primary">Open System Test Page</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
