"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Key, Trash2, Eye, EyeOff, TestTube, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { Tenant } from "@/lib/types"

interface ApiKey {
  id: string
  tenant_id: string
  provider: string
  has_key: boolean
  created_at: string
  tenant?: { name: string }
}

export function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set())
  // Enhanced test results to include detailed error information
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string; details: any; status: number }>
  >({})
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    tenant_id: "",
    provider: "openai",
    api_key: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [keysRes, tenantsRes] = await Promise.all([fetch("/api/admin/api-keys"), fetch("/api/admin/tenants")])

      if (!keysRes.ok) {
        const errorText = await keysRes.text()
        console.error("API Keys fetch failed:", keysRes.status, errorText)
        throw new Error(`Failed to fetch API keys: ${keysRes.status}`)
      }

      if (!tenantsRes.ok) {
        const errorText = await tenantsRes.text()
        console.error("Tenants fetch failed:", tenantsRes.status, errorText)
        throw new Error(`Failed to fetch tenants: ${tenantsRes.status}`)
      }

      const [keysData, tenantsData] = await Promise.all([
        keysRes.json().catch((err) => {
          console.error("Failed to parse keys JSON:", err)
          return []
        }),
        tenantsRes.json().catch((err) => {
          console.error("Failed to parse tenants JSON:", err)
          return []
        }),
      ])

      setApiKeys(keysData)
      setTenants(tenantsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setApiKeys([])
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save API key")

      setDialogOpen(false)
      setFormData({ tenant_id: "", provider: "openai", api_key: "" })
      fetchData()
    } catch (error) {
      console.error("Failed to save API key:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete API key")

      fetchData()
    } catch (error) {
      console.error("Failed to delete API key:", error)
    }
  }

  // Enhanced testApiKey function with detailed error logging and auto-expand
  const testApiKey = async (keyId: string, tenantId: string, provider: string) => {
    setTestingKeys((prev) => new Set(prev).add(keyId))
    setTestResults((prev) => {
      const newResults = { ...prev }
      delete newResults[keyId]
      return newResults
    })

    try {
      const response = await fetch("/api/admin/test-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, provider }),
      })

      const result = await response.json()

      console.log("API Key Test Response:", {
        status: response.status,
        ok: response.ok,
        result,
      })

      setTestResults((prev) => ({
        ...prev,
        [keyId]: {
          success: response.ok && result.success,
          message: result.message || (response.ok ? "API key is working!" : "Test failed"),
          details: result.details || null,
          status: response.status,
        },
      }))

      if (!response.ok || !result.success) {
        setExpandedErrors((prev) => new Set(prev).add(keyId))
      }
    } catch (error) {
      console.error("Network error during API key test:", error)
      setTestResults((prev) => ({
        ...prev,
        [keyId]: {
          success: false,
          message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: null,
          status: 0,
        },
      }))
      setExpandedErrors((prev) => new Set(prev).add(keyId))
    } finally {
      setTestingKeys((prev) => {
        const newSet = new Set(prev)
        newSet.delete(keyId)
        return newSet
      })
    }
  }

  // Added function to toggle error details display
  const toggleErrorDetails = (keyId: string) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  if (loading) {
    return <div className="text-center py-12">Loading API keys...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>Manage encrypted API keys for organizations</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
              <DialogDescription>Add an encrypted API key for an organization</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Organization</Label>
                <Select
                  value={formData.tenant_id}
                  onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api_key"
                    type={showKey ? "text" : "password"}
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="Enter API key..."
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Key"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No API keys configured</p>
            </div>
          ) : (
            apiKeys.map((key) => (
              // Wrapped each key in a container to show error details below
              <div key={key.id} className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{key.tenant?.name || "Unknown Org"}</h3>
                      <p className="text-sm text-gray-500">
                        Provider: <Badge variant="outline">{key.provider}</Badge>
                      </p>
                      <p className="text-xs text-gray-400">Added {new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.has_key ? "default" : "secondary"}>
                      {key.has_key ? "Configured" : "Missing"}
                    </Badge>
                    {testResults[key.id] && (
                      // Made failed badge clickable to show error details
                      <Badge
                        variant={testResults[key.id].success ? "default" : "destructive"}
                        className="cursor-pointer"
                        onClick={() => !testResults[key.id].success && toggleErrorDetails(key.id)}
                      >
                        {testResults[key.id].success ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {testResults[key.id].success ? "Working" : "Failed"}
                        {!testResults[key.id].success && <AlertCircle className="h-3 w-3 ml-1" />}
                      </Badge>
                    )}
                    {key.has_key && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiKey(key.id, key.tenant_id, key.provider)}
                        disabled={testingKeys.has(key.id)}
                      >
                        <TestTube className="h-4 w-4" />
                        {testingKeys.has(key.id) ? "Testing..." : "Test"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(key.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Added detailed error display section */}
                {testResults[key.id] && !testResults[key.id].success && expandedErrors.has(key.id) && (
                  <Alert variant="destructive" className="ml-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="space-y-2">
                      <div className="font-medium">API Key Test Failed</div>
                      <div className="text-sm">{testResults[key.id].message}</div>
                      {testResults[key.id].details && (
                        <div className="text-xs font-mono bg-red-50 p-2 rounded border">
                          <div>Status: {testResults[key.id].status}</div>
                          {testResults[key.id].details.code && <div>Code: {testResults[key.id].details.code}</div>}
                          {testResults[key.id].details.type && <div>Type: {testResults[key.id].details.type}</div>}
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => toggleErrorDetails(key.id)} className="text-xs">
                        Hide Details
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
