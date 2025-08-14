"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit, Check, X, Plus, ExternalLink } from "lucide-react"
import type { AppDefinition } from "@/lib/app-framework"

interface ExtendedAppDefinition extends AppDefinition {
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
}

export function AppRegistryManagement() {
  const [apps, setApps] = useState<ExtendedAppDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<ExtendedAppDefinition | null>(null)
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      const response = await fetch("/api/admin/apps")
      if (!response.ok) throw new Error("Failed to fetch apps")
      const data = await response.json()
      setApps(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch apps",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const approveApp = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/apps/${appId}/approve`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to approve app")

      toast({
        title: "Success",
        description: "App approved successfully",
      })
      fetchApps()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve app",
        variant: "destructive",
      })
    }
  }

  const rejectApp = async (appId: string) => {
    try {
      const response = await fetch(`/api/admin/apps/${appId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      })
      if (!response.ok) throw new Error("Failed to reject app")

      toast({
        title: "Success",
        description: "App rejected successfully",
      })
      setShowRejectDialog(false)
      setRejectionReason("")
      fetchApps()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject app",
        variant: "destructive",
      })
    }
  }

  const deleteApp = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this app? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/apps/${appId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete app")

      toast({
        title: "Success",
        description: "App deleted successfully",
      })
      fetchApps()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete app",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading apps...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">App Registry</h2>
          <p className="text-muted-foreground">Manage registered applications and their approval status</p>
        </div>
        <Button onClick={() => window.open("/admin/add-app", "_blank")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New App
        </Button>
      </div>

      <div className="grid gap-4">
        {apps.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{app.icon}</div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {app.name}
                      {getStatusBadge(app.status)}
                    </CardTitle>
                    <CardDescription>{app.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {app.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => approveApp(app.id)} className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedApp(app)
                          setShowRejectDialog(true)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApp(app)
                      setShowAppDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteApp(app.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span> {app.version}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {app.category}
                </div>
                <div>
                  <span className="font-medium">Author:</span> {app.author || "Unknown"}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>

              {app.permissions.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-sm">Permissions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {app.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {app.status === "rejected" && app.rejection_reason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <span className="font-medium text-sm text-red-800">Rejection Reason:</span>
                  <p className="text-sm text-red-700 mt-1">{app.rejection_reason}</p>
                </div>
              )}

              {(app.homepage || app.repository) && (
                <div className="flex gap-2 mt-3">
                  {app.homepage && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={app.homepage} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Homepage
                      </a>
                    </Button>
                  )}
                  {app.repository && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={app.repository} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Repository
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reject App Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject App</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this app. This will help the developer understand what needs to be
              improved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this app is being rejected..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApp && rejectApp(selectedApp.id)}
              disabled={!rejectionReason.trim()}
            >
              Reject App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
