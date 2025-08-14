import { AppWrapper } from "@/lib/app-wrapper"
import { PromptApp } from "@/components/apps/prompt/prompt-app"
import { AppHeader } from "@/components/app-header"

export default function PromptPage() {
  return (
    <div className="min-h-screen bg-neutral-light">
      <AppHeader />
      <AppWrapper appId="prompt">{(props) => <PromptApp {...props} />}</AppWrapper>
    </div>
  )
}
