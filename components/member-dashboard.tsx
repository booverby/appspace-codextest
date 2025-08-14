"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Globe, ArrowRight } from "lucide-react"
import type { TestUser, App } from "@/lib/types"

interface MemberDashboardProps {
  user: TestUser
}

export function MemberDashboard({ user }: MemberDashboardProps) {
  const [enabledApps, setEnabledApps] = useState<App[]>([])
  const [hasApiKey, setHasApiKey] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnabledApps()
  }, [user.tenant_id])

  const fetchEnabledApps = async () => {
    if (!user.tenant_id) return

    try {
      const response = await fetch(`/api/member/apps?tenantId=${user.tenant_id}`)
      const data = await response.json()
      setEnabledApps(data.apps || [])
      setHasApiKey(data.hasApiKey || false)
    } catch (error) {
      console.error("Failed to fetch enabled apps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppLaunch = (appName: string) => {
    window.location.href = `/apps/${appName.toLowerCase()}`
  }

  const getAppIcon = (appName: string) => {
    switch (appName.toLowerCase()) {
      case "prompt":
        return <MessageSquare className="w-8 h-8 text-white" />
      case "translate":
        return <Globe className="w-8 h-8 text-white" />
      default:
        return <MessageSquare className="w-8 h-8 text-white" />
    }
  }

  const getAppGradient = (appName: string) => {
    switch (appName.toLowerCase()) {
      case "prompt":
        return "bg-gradient-to-br from-slate-600 to-slate-700"
      case "translate":
        return "bg-gradient-to-br from-emerald-600 to-emerald-700"
      default:
        return "bg-gradient-to-br from-slate-600 to-slate-700"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-body">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!hasApiKey) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="text-center py-16 px-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-2xl font-heading font-semibold text-slate-800 mb-4">Welcome to Nordic AI</h3>
            <p className="text-slate-600 font-body leading-relaxed mb-6 max-w-md mx-auto">
              You don't have access to our AI productivity apps yet. Contact your administrator or reach out to us to
              get started.
            </p>
            <Button className="nordic-button-primary">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-heading font-semibold text-slate-800 tracking-tight">Your AI Workspace</h1>
        <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto leading-relaxed">
          Access powerful AI tools designed for productivity and creativity, crafted with Nordic simplicity.
        </p>
      </div>

      {enabledApps.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="text-center py-16 px-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-slate-800 mb-3">No Apps Available</h3>
              <p className="text-slate-600 font-body leading-relaxed">
                No apps are currently enabled for your organization.
              </p>
              <p className="text-sm text-slate-500 mt-2 font-body">Contact your administrator to enable apps.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {enabledApps.map((app) => (
            <Card
              key={app.id}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white border-0 shadow-lg overflow-hidden"
              onClick={() => handleAppLaunch(app.name)}
            >
              <div className={`h-32 ${getAppGradient(app.name)} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    {getAppIcon(app.name)}
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/10 rounded-full"></div>
              </div>

              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl font-heading font-semibold text-slate-800 tracking-wide mb-2">
                  {app.name}
                </CardTitle>
                <CardDescription className="text-slate-600 font-body leading-relaxed text-base">
                  {app.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 pb-6">
                <Button className="w-full nordic-button-primary group-hover:bg-slate-700 transition-colors duration-300 flex items-center justify-center gap-2">
                  Launch App
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
