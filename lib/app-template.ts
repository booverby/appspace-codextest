// App Template Generator
export interface AppTemplate {
  id: string
  name: string
  description: string
  category: string // Updated to declare AppCategory as a string
  files: TemplateFile[]
}

export interface TemplateFile {
  path: string
  content: string
}

export const APP_TEMPLATES: AppTemplate[] = [
  {
    id: "basic-ai-app",
    name: "Basic AI App",
    description: "Simple AI-powered application template",
    category: "ai-ml",
    files: [
      {
        path: "apps/{{APP_ID}}/page.tsx",
        content: `import { {{APP_NAME}}App } from '@/components/apps/{{APP_ID}}/{{APP_ID}}-app'

export default function {{APP_NAME}}Page() {
  return <{{APP_NAME}}App />
}`,
      },
      {
        path: "components/apps/{{APP_ID}}/{{APP_ID}}-app.tsx",
        content: `'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AppProps } from '@/lib/app-framework'

export function {{APP_NAME}}App({ user, organization, apiKeys, onUsageLog }: AppProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/apps/{{APP_ID}}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, organizationId: organization.id })
      })

      if (!response.ok) throw new Error('Request failed')

      const result = await response.json()
      setOutput(result.output)
      onUsageLog('process', { inputLength: input.length })
      
      toast({
        title: 'Success',
        description: 'Request processed successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process request',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{{APP_DISPLAY_NAME}}</CardTitle>
          <CardDescription>
            {{APP_DESCRIPTION}}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="input" className="block text-sm font-medium mb-2">
                Input
              </label>
              <Textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                rows={4}
              />
            </div>
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Processing...' : 'Process'}
            </Button>
          </form>
          
          {output && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Output
              </label>
              <Textarea
                value={output}
                readOnly
                rows={6}
                className="bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}`,
      },
      {
        path: "app/api/apps/{{APP_ID}}/route.ts",
        content: `import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { input, organizationId } = await request.json()
    
    if (!input || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user belongs to organization
    const supabase = createClient()
    const { data: membership } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get organization's API keys
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('organization_id', organizationId)
      .eq('service', 'openai')
      .single()

    if (!apiKeyData) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 })
    }

    // TODO: Implement your app logic here
    // This is a placeholder that echoes the input
    const output = \`Processed: \${input}\`

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      organization_id: organizationId,
      app_id: '{{APP_ID}}',
      action: 'process',
      metadata: { inputLength: input.length }
    })

    return NextResponse.json({ output })
  } catch (error) {
    console.error('{{APP_ID}} API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}`,
      },
    ],
  },
]

export function generateAppFromTemplate(
  template: AppTemplate,
  appId: string,
  appName: string,
  appDescription: string,
): TemplateFile[] {
  return template.files.map((file) => ({
    path: file.path
      .replace(/\{\{APP_ID\}\}/g, appId)
      .replace(/\{\{APP_NAME\}\}/g, toPascalCase(appName))
      .replace(/\{\{APP_DISPLAY_NAME\}\}/g, appName)
      .replace(/\{\{APP_DESCRIPTION\}\}/g, appDescription),
    content: file.content
      .replace(/\{\{APP_ID\}\}/g, appId)
      .replace(/\{\{APP_NAME\}\}/g, toPascalCase(appName))
      .replace(/\{\{APP_DISPLAY_NAME\}\}/g, appName)
      .replace(/\{\{APP_DESCRIPTION\}\}/g, appDescription),
  }))
}

function toPascalCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, "")
}
