"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { colors, spacing } from "@/lib/theme"
import { cn } from "@/lib/utils"

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

const categoryValues = CATEGORIES.map((c) => c.value) as [AppCategory, ...AppCategory[]]
const permissionValues = PERMISSIONS.map((p) => p.value) as [Permission, ...Permission[]]

const formSchema = z.object({
  id: z
    .string()
    .min(1, "App ID is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "App name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required").max(2, "Use a single emoji"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Use semantic versioning (x.y.z)"),
  category: z.enum(categoryValues, { required_error: "Category is required" }),
  permissions: z.array(z.enum(permissionValues)).default([]),
  author: z.string().optional(),
  homepage: z.string().url("Invalid URL").optional().or(z.literal("")),
  repository: z.string().url("Invalid URL").optional().or(z.literal("")),
})

export function AddAppForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      icon: "🚀",
      version: "1.0.0",
      category: undefined,
      permissions: [],
      author: "",
      homepage: "",
      repository: "",
    },
  })
  const { register, handleSubmit, watch, setValue, formState } = form
  const { errors } = formState
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const watchedName = watch("name")
  const permissions = watch("permissions")
  const formValues = watch()

  useEffect(() => {
    if (!watchedName) return
    const id = watchedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
    setValue("id", id)
  }, [watchedName, setValue])

  const generateTemplate = () => {
    const { id, name, description } = form.getValues()
    if (!selectedTemplate || !name || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in app name and description before generating template",
        variant: "destructive",
      })
      return
    }

    const template = APP_TEMPLATES.find((t) => t.id === selectedTemplate)
    if (!template) return

    const files = generateAppFromTemplate(template, id, name, description)

    const fileContent = files.map((file) => `// File: ${file.path}\n${file.content}\n\n`).join("---\n\n")

    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${id}-template.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Template Generated",
      description: "App template files have been downloaded. Follow the development guide to implement your app.",
    })
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
    <div className={spacing.lg}>
      {/* Development Guidelines */}
      <Card className={cn(colors.info.border, colors.info.bg)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center", spacing.gapSm, colors.info.heading)}>
            <Lightbulb className="h-5 w-5" />
            App Development Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(spacing.sm, colors.info.body)}>
          <div className={cn("grid md:grid-cols-2", spacing.gapMd)}>
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
          <div className={cn("flex", spacing.gapSm, "pt-2")}>
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
      <form onSubmit={handleSubmit(onSubmit)} className={spacing.md}>
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
            <CardDescription>Basic information about your application</CardDescription>
          </CardHeader>
          <CardContent className={spacing.sm}>
            <div className={cn("grid md:grid-cols-2", spacing.gapMd)}>
              <div>
                <Label htmlFor="name">App Name *</Label>
                <Input id="name" placeholder="My Awesome App" {...register("name")}/>
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="id">App ID *</Label>
                <Input
                  id="id"
                  placeholder="my-awesome-app"
                  pattern="^[a-z0-9-]+$"
                  title="Lowercase letters, numbers, and hyphens only"
                  {...register("id")}
                />
                {errors.id && <p className="text-sm text-destructive mt-1">{errors.id.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Auto-generated from name, or customize</p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="A brief description of what your app does..."
                rows={3}
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div className={cn("grid md:grid-cols-3", spacing.gapMd)}>
              <div>
                <Label htmlFor="icon">Icon *</Label>
                <Input id="icon" placeholder="🚀" maxLength={2} {...register("icon")}/>
                {errors.icon && <p className="text-sm text-destructive mt-1">{errors.icon.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Single emoji</p>
              </div>
              <div>
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="1.0.0"
                  pattern="^\d+\.\d+\.\d+$"
                  title="Semantic versioning (x.y.z)"
                  {...register("version")}
                />
                {errors.version && <p className="text-sm text-destructive mt-1">{errors.version.message}</p>}
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formValues.category}
                  onValueChange={(value) => setValue("category", value as AppCategory)}
                >
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
                {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
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
            <div className={spacing.xs}>
              {PERMISSIONS.map((permission) => (
                <div key={permission.value} className={cn("flex items-start", spacing.gapSm)}>
                  <Checkbox
                    id={permission.value}
                    checked={permissions.includes(permission.value)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...permissions, permission.value]
                        : permissions.filter((p) => p !== permission.value)
                      setValue("permissions", updated)
                    }}
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
          <CardContent className={spacing.sm}>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" placeholder="Your name or organization" {...register("author")}/>
            </div>
            <div className={cn("grid md:grid-cols-2", spacing.gapMd)}>
              <div>
                <Label htmlFor="homepage">Homepage URL</Label>
                <Input
                  id="homepage"
                  type="url"
                  placeholder="https://example.com"
                  {...register("homepage")}
                />
                {errors.homepage && <p className="text-sm text-destructive mt-1">{errors.homepage.message}</p>}
              </div>
              <div>
                <Label htmlFor="repository">Repository URL</Label>
                <Input
                  id="repository"
                  type="url"
                  placeholder="https://github.com/user/repo"
                  {...register("repository")}
                />
                {errors.repository && <p className="text-sm text-destructive mt-1">{errors.repository.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Generator */}
        <Card className={cn(colors.success.border, colors.success.bg)}>
          <CardHeader>
            <CardTitle className={cn("flex items-center", spacing.gapSm, colors.success.heading)}>
              <Zap className="h-5 w-5" />
              Quick Start Template
            </CardTitle>
            <CardDescription className={colors.success.body}>
              Generate boilerplate code to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent className={spacing.sm}>
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
                <div className="text-2xl">{formValues.icon}</div>
                <div>
                  <h3 className="font-semibold">{formValues.name || "App Name"}</h3>
                  <p className="text-sm text-muted-foreground">{formValues.description || "App description"}</p>
                  <div className={cn("flex", spacing.gapSm, "mt-2")}>
                    {formValues.category && <Badge variant="secondary">{formValues.category}</Badge>}
                    <Badge variant="outline">v{formValues.version}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className={cn("flex", spacing.gapMd)}>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Registering..." : "Register App"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
      </form>

      {/* Process Information */}
      <Card className={cn(colors.warning.border, colors.warning.bg)}>
        <CardHeader>
          <CardTitle className={cn("flex items-center", spacing.gapSm, colors.warning.heading)}>
            <AlertCircle className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className={colors.warning.body}>
          <ol className={cn(spacing.xs, "text-sm")}>
            <li className={cn("flex items-center", spacing.gapSm)}>
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Your app will be submitted for review
            </li>
            <li className={cn("flex items-center", spacing.gapSm)}>
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Our team will evaluate it against our guidelines
            </li>
            <li className={cn("flex items-center", spacing.gapSm)}>
              <CheckCircle className="h-4 w-4 text-amber-600" />
              You'll receive approval or feedback for improvements
            </li>
            <li className={cn("flex items-center", spacing.gapSm)}>
              <CheckCircle className="h-4 w-4 text-amber-600" />
              Once approved, your app will be available to organizations
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
