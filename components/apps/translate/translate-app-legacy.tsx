"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Languages, Copy } from "lucide-react"
import Link from "next/link"
import type { TestUser } from "@/lib/types"

interface TranslateAppProps {
  user: TestUser
}

const languages = [
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
]

export function TranslateApp({ user }: TranslateAppProps) {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("es")
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!sourceText.trim() || loading) return

    setLoading(true)
    try {
      const response = await fetch("/api/apps/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText.trim(),
          sourceLang,
          targetLang,
          organizationId: user.organization_id,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to translate text")
      }

      const data = await response.json()
      setTranslatedText(data.translation)
    } catch (error) {
      console.error("Failed to translate:", error)
      setTranslatedText("Translation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-900">AI Translator</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language Translation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Selection */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" onClick={swapLanguages} className="mt-6 bg-transparent">
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Translation Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Source Text</label>
                  {sourceText && (
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(sourceText)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Translation</label>
                  {translatedText && (
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(translatedText)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={translatedText}
                  readOnly
                  placeholder={loading ? "Translating..." : "Translation will appear here..."}
                  className="min-h-[200px] resize-none bg-gray-50"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleTranslate} disabled={loading || !sourceText.trim()} size="lg">
                {loading ? "Translating..." : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
