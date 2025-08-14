"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Code, FileText, Lightbulb, Zap } from "lucide-react"
import type { AppCategory, Permission } from "@/lib/app-framework"
import { APP_TEMPLATES, generateAppFromTemplate } from "@/lib/app-template"

const CATEGORIES: { value: AppCategory; label: string; description: string }[] = [
  { value: "ai-ml", label: "AI & ML", description: "AI-powered applications and machine learning tools" },
  { value: "productivity", label: "Productivity", description: "Workflow and productivity enhancement tools" },
  { value: "communication", label: "Communication", description: "Messaging and collaboration applications" },
  { value: "analytics", label: "Analytics", description: "Data analysis and reporting tools" },
  { value: "integration", label: "Integration", description: "Third-party service integrations" },
  { value: "utility", label: "Utility", description: "General purpose utilities and tools" },
]

const PERMISSIONS: { value: Permission; label: string; description: string }[] = [
  { value: "api-access", label: "API Access", description: "Access to external APIs using organization keys" },
  { value: "file-upload", label: "File Upload", description: "Allow users to upload files" },
  { value: "external-requests", label: "External Requests", description: "Make requests to external services" },
  { value: "user-data", label: "User Data", description: "Access to user profile information" },
  { value: "organization-data", label: "Organization Data", description: "Access to organization information" },
]

interface AppFormData {
  id: string
  name: string
  description: string
  icon: string
  version: string
  category: AppCategory | ""
  permissions: Permission[]
  author: string
  homepage: string
  repository: string
}

export function AddAppForm() {
  const [formData, setFormData] = useState<AppFormData>({
    id: "",
    name: "",
    description: "",
    icon: "🚀",
    version: "1.0.0",
    category: "",
    permissions: [],
    author: "",
    homepage: "",
    repository: "",
  })
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (field: keyof AppFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-generate ID from name
    if (field === "name" && typeof value === "string") {
      const id = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setFormData((prev) => ({ ...prev, id }))
    }
  }

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter((p) => p !== permission),
    }))
  }

  const generateTemplate = () => {
    if (!selectedTemplate || !formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in app name and description before generating template",
        variant: "destructive",
      })
      return
    }

    const template = APP_TEMPLATES.find((t) => t.id === selectedTemplate)
    if (!template) return

    const files = generateAppFromTemplate(template, formData.id, formData.name, formData.description)

    // Create downloadable zip file content
    const fileContent = files.map((file) => `// File: ${file.path}\n${file.content}\n\n`).join("---\n\n")

    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.id}-template.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Template Generated",
      description: "App template files have been downloaded. Follow the development guide to implement your app.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category) {
      toast({
        title: "Missing Category",
        description: "Please select a category for your app",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details?.join(", ") || error.error || "Failed to register app")
      }

      toast({
        title: "Success",
        description: "App registered successfully! It will be reviewed before approval.",
      })

      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register app",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Development Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Lightbulb className="h-5 w-5" />
            App Development Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-blue-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Requirements</h4>
              <ul className="space-y-1 text-sm">
                <li>• Follow the app framework interface</li>
                <li>• Implement proper authentication checks</li>
                <li>• Use organization API keys securely</li>
                <li>• Log all significant user actions</li>
                <li>• Handle errors gracefully</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="space-y-1 text-sm">
                <li>• Use the platform's design system</li>
                <li>• Implement responsive design</li>
                <li>• Provide clear user feedback</li>
                <li>• Optimize for performance</li>
                <li>• Include comprehensive error handling</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" asChild>
              <a href="/docs/app-development-guide.md" target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4 mr-1" />
                Full Guide
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="https://github.com/nordic-ai/app-examples" target="_blank" rel="noreferrer">
                <Code className="h-4 w-4 mr-1" />
                Examples
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
            <CardDescription>Basic information about your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">App Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="My Awesome App"
                  required
                />
              </div>
              <div>
                <Label htmlFor="id">App ID *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => handleInputChange("id", e.target.value)}
                  placeholder="my-awesome-app"
                  pattern="^[a-z0-9-]+$"
                  title="Lowercase letters, numbers, and hyphens only"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-generated from name, or customize</p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="A brief description of what your app does..."
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="icon">Icon *</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  placeholder="🚀"
                  maxLength={2}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Single emoji</p>
              </div>
              <div>
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
                  placeholder="1.0.0"
                  pattern="^\d+\.\d+\.\d+$"
                  title="Semantic versioning (x.y.z)"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Select the permissions your app requires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PERMISSIONS.map((permission) => (
                <div key={permission.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.value}
                    checked={formData.permissions.includes(permission.value)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.value, checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={permission.value} className="font-medium">
                      {permission.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional metadata about your app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
                placeholder="Your name or organization"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homepage">Homepage URL</Label>
                <Input
                  id="homepage"
                  type="url"
                  value={formData.homepage}
                  onChange={(e) => handleInputChange("homepage", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="repository">Repository URL</Label>
                <Input
                  id="repository"
                  type="url"
                  value={formData.repository}
                  onChange={(e) => handleInputChange("repository", e.target.value)}
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Generator */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5" />
              Quick Start Template
            </CardTitle>
            <CardDescription className="text-green-700">
              Generate boilerplate code to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Choose Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {APP_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={generateTemplate}
              disabled={!selectedTemplate}
              className="bg-green-600 hover:bg-green-700"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate Template Files
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="text-2xl">{formData.icon}</div>
                <div>
                  <h3 className="font-semibold">{formData.name || "App Name"}</h3>
                  <p className="text-sm text-muted-foreground">{formData.description || "App description"}</p>
                  <div className="flex gap-2 mt-2">
                    {formData.category && <Badge variant="secondary">{formData.category}</Badge>}
                    <Badge variant="outline">v{formData.version}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Registering..." : "Register App"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
      </form>

      {/* Process Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700">
          <ol className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Your app will be submitted for review
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Our team will evaluate it against our guidelines
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              You'll receive approval or feedback for improvements
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Once approved, your app will be available to organizations
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
