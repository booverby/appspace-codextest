"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Languages, Loader2, Copy, RotateCcw } from "lucide-react"
import type { AppProps } from "@/lib/app-framework"

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
]

export function TranslateApp({ user, organization, apiKeys, onUsageLog }: AppProps) {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("es")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleTranslate = async () => {
    if (!sourceText.trim() || sourceLang === targetLang) return

    setLoading(true)
    try {
      const response = await fetch("/api/apps/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
          organizationId: organization.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Translation failed")
      }

      const data = await response.json()
      setTranslatedText(data.translatedText)

      onUsageLog("translate", {
        sourceLang,
        targetLang,
        textLength: sourceText.length,
      })

      toast({
        title: "Success",
        description: "Text translated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Translation failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language Translator
          </CardTitle>
          <CardDescription>Translate text between different languages using AI-powered translation</CardDescription>
          <div className="flex gap-2">
            <Badge variant="secondary">{organization.name}</Badge>
            <Badge variant="outline">User: {user.email}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">From</label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              className="mt-6 bg-transparent"
              title="Swap languages"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">To</label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translation Interface */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Text */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">
                  Source Text ({LANGUAGES.find((l) => l.code === sourceLang)?.name})
                </label>
                {sourceText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sourceText)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-muted-foreground">{sourceText.length} characters</p>
            </div>

            {/* Translated Text */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">
                  Translation ({LANGUAGES.find((l) => l.code === targetLang)?.name})
                </label>
                {translatedText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="min-h-[200px] resize-none bg-muted"
              />
              <p className="text-xs text-muted-foreground">{translatedText.length} characters</p>
            </div>
          </div>

          {/* Translate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || sourceLang === targetLang || loading}
              size="lg"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
          </div>

          {sourceLang === targetLang && (
            <p className="text-center text-sm text-amber-600">Please select different source and target languages</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
