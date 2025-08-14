import { AppWrapper } from "@/lib/app-wrapper"
import { TranslateApp } from "@/components/apps/translate/translate-app"
import { AppHeader } from "@/components/app-header"

export default function TranslatePage() {
  return (
    <div className="min-h-screen bg-neutral-light">
      <AppHeader />
      <AppWrapper appId="translate">{(props) => <TranslateApp {...props} />}</AppWrapper>
    </div>
  )
}
