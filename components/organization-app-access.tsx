"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Zap } from "lucide-react"

interface AppWithStatus {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
}

interface Organization {
  id: string
  name: string
}

interface OrganizationAppAccessProps {
  organizationId: string
  organizationName: string
}

export function OrganizationAppAccess({ organizationId, organizationName }: OrganizationAppAccessProps) {
  const [apps, setApps] = useState<AppWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchApps = async () => {
    if (!organizationId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/apps`)
      if (!response.ok) throw new Error("Failed to fetch apps")

      const data = await response.json()
      setApps(data)
    } catch (error) {
      console.error("Failed to fetch organization apps:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dialogOpen) {
      fetchApps()
    }
  }, [dialogOpen, organizationId])

  const handleToggleApp = async (appId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, enabled }),
      })

      if (!response.ok) throw new Error("Failed to update app access")

      // Update local state
      setApps((prev) => prev.map((app) => (app.id === appId ? { ...app, enabled } : app)))
    } catch (error) {
      console.error("Failed to toggle app access:", error)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          App Access
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage App Access - {organizationName}</DialogTitle>
          <DialogDescription>Control which applications this organization can access</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Loading apps...</div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No apps available</p>
            </div>
          ) : (
            apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{app.icon}</div>
                  <div>
                    <h3 className="font-medium">{app.name}</h3>
                    <p className="text-sm text-gray-500">{app.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={app.enabled ? "default" : "secondary"}>{app.enabled ? "Enabled" : "Disabled"}</Badge>
                  <Switch checked={app.enabled} onCheckedChange={(enabled) => handleToggleApp(app.id, enabled)} />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
