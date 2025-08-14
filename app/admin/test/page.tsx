"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Loader2, TestTube, Database, Key, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TestResult {
  success: boolean
  message: string
  details?: any
}

export default function AdminTestPage() {
  const [apiKeyTest, setApiKeyTest] = useState<{
    tenantId: string
    provider: string
    loading: boolean
    result: TestResult | null
  }>({
    tenantId: "",
    provider: "openai",
    loading: false,
    result: null,
  })

  const [databaseTest, setDatabaseTest] = useState<{
    loading: boolean
    result: TestResult | null
  }>({
    loading: false,
    result: null,
  })

  const [customTest, setCustomTest] = useState<{
    endpoint: string
    method: string
    body: string
    loading: boolean
    result: TestResult | null
  }>({
    endpoint: "",
    method: "GET",
    body: "",
    loading: false,
    result: null,
  })

  const testApiKey = async () => {
    if (!apiKeyTest.tenantId || !apiKeyTest.provider) {
      setApiKeyTest((prev) => ({
        ...prev,
        result: { success: false, message: "Please provide tenant ID and provider" },
      }))
      return
    }

    setApiKeyTest((prev) => ({ ...prev, loading: true, result: null }))

    try {
      const response = await fetch("/api/admin/test-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: apiKeyTest.tenantId,
          provider: apiKeyTest.provider,
        }),
      })

      const result = await response.json()
      setApiKeyTest((prev) => ({ ...prev, result }))
    } catch (error: any) {
      setApiKeyTest((prev) => ({
        ...prev,
        result: { success: false, message: `Test failed: ${error.message}` },
      }))
    } finally {
      setApiKeyTest((prev) => ({ ...prev, loading: false }))
    }
  }

  const testDatabase = async () => {
    setDatabaseTest({ loading: true, result: null })

    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const users = await response.json()
        setDatabaseTest({
          loading: false,
          result: {
            success: true,
            message: `Database connection successful. Found ${users.length} users.`,
            details: { userCount: users.length },
          },
        })
      } else {
        setDatabaseTest({
          loading: false,
          result: { success: false, message: `Database test failed: ${response.statusText}` },
        })
      }
    } catch (error: any) {
      setDatabaseTest({
        loading: false,
        result: { success: false, message: `Database test failed: ${error.message}` },
      })
    }
  }

  const testCustomEndpoint = async () => {
    if (!customTest.endpoint) {
      setCustomTest((prev) => ({
        ...prev,
        result: { success: false, message: "Please provide an endpoint URL" },
      }))
      return
    }

    setCustomTest((prev) => ({ ...prev, loading: true, result: null }))

    try {
      const options: RequestInit = {
        method: customTest.method,
        headers: { "Content-Type": "application/json" },
      }

      if (customTest.method !== "GET" && customTest.body) {
        options.body = customTest.body
      }

      const response = await fetch(customTest.endpoint, options)
      const data = await response.text()

      setCustomTest((prev) => ({
        ...prev,
        result: {
          success: response.ok,
          message: `${response.status} ${response.statusText}`,
          details: { status: response.status, data: data.substring(0, 500) },
        },
      }))
    } catch (error: any) {
      setCustomTest((prev) => ({
        ...prev,
        result: { success: false, message: `Request failed: ${error.message}` },
      }))
    } finally {
      setCustomTest((prev) => ({ ...prev, loading: false }))
    }
  }

  const ResultDisplay = ({ result }: { result: TestResult | null }) => {
    if (!result) return null

    return (
      <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        {result.success ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
          {result.message}
          {result.details && (
            <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto">
              {JSON.stringify(result.details, null, 2)}
            </pre>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TestTube className="h-6 w-6 text-nordic-primary" />
        <h1 className="text-3xl font-bold text-nordic-primary">System Testing</h1>
      </div>

      {/* API Key Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Testing
          </CardTitle>
          <CardDescription>Test API keys for different providers and organizations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenant-id">Tenant ID</Label>
              <Input
                id="tenant-id"
                placeholder="Enter tenant/organization ID"
                value={apiKeyTest.tenantId}
                onChange={(e) => setApiKeyTest((prev) => ({ ...prev, tenantId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={apiKeyTest.provider}
                onValueChange={(value) => setApiKeyTest((prev) => ({ ...prev, provider: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={testApiKey} disabled={apiKeyTest.loading} className="nordic-button-primary">
            {apiKeyTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test API Key
          </Button>
          <ResultDisplay result={apiKeyTest.result} />
        </CardContent>
      </Card>

      {/* Database Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Testing
          </CardTitle>
          <CardDescription>Test database connectivity and basic operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDatabase} disabled={databaseTest.loading} className="nordic-button-primary">
            {databaseTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Database Connection
          </Button>
          <ResultDisplay result={databaseTest.result} />
        </CardContent>
      </Card>

      {/* Custom Endpoint Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Custom Endpoint Testing
          </CardTitle>
          <CardDescription>Test any API endpoint with custom parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                placeholder="/api/admin/users or https://api.example.com/test"
                value={customTest.endpoint}
                onChange={(e) => setCustomTest((prev) => ({ ...prev, endpoint: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Select
                value={customTest.method}
                onValueChange={(value) => setCustomTest((prev) => ({ ...prev, method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {customTest.method !== "GET" && (
            <div>
              <Label htmlFor="request-body">Request Body (JSON)</Label>
              <Textarea
                id="request-body"
                placeholder='{"key": "value"}'
                value={customTest.body}
                onChange={(e) => setCustomTest((prev) => ({ ...prev, body: e.target.value }))}
                rows={4}
              />
            </div>
          )}
          <Button onClick={testCustomEndpoint} disabled={customTest.loading} className="nordic-button-primary">
            {customTest.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Endpoint
          </Button>
          <ResultDisplay result={customTest.result} />
        </CardContent>
      </Card>
    </div>
  )
}
