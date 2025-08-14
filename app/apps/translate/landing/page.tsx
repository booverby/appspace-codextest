import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { MessageSquare, Languages, Globe, Zap, Users } from "lucide-react"

export default async function TranslateLandingPage() {
  const currentUser = await getCurrentUser()

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white border-b border-neutral px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-heading font-semibold text-text-main">
            Nordic.
          </Link>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <Link href="/apps/translate" className="nordic-button-primary">
                Launch App
              </Link>
            ) : (
              <button className="nordic-button-primary">Get Started</button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-orange-50 rounded-sm flex items-center justify-center mx-auto mb-8">
              <Languages className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-6xl font-heading font-semibold text-primary mb-6 tracking-tight">Smart Translation</h1>
            <p className="text-xl text-text-main mb-8 max-w-2xl mx-auto font-body leading-relaxed">
              Break language barriers with intelligent translation that understands context and nuance for perfect
              communication.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link href="/apps/translate" className="nordic-button-primary">
                  Launch Translation
                </Link>
              ) : (
                <button className="nordic-button-primary">Access Product</button>
              )}
              <Link href="/" className="nordic-button-outline">
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-heading font-semibold text-primary mb-4 text-center tracking-wide">
              Advanced Translation Features
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto mb-12"></div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">Context Aware</h3>
                <p className="text-text-main font-body leading-relaxed">
                  Understands cultural nuances and context to provide accurate translations that preserve meaning.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">Lightning Fast</h3>
                <p className="text-text-main font-body leading-relaxed">
                  Instant translations powered by advanced AI models for real-time communication needs.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">Multi-Language</h3>
                <p className="text-text-main font-body leading-relaxed">
                  Support for dozens of languages with professional-grade accuracy for global communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Other Products Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-heading font-semibold text-primary mb-4 text-center tracking-wide">
              Explore Other Products
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto mb-12"></div>

            <div className="max-w-2xl mx-auto">
              <Link href="/apps/prompt/landing" className="group">
                <div className="bg-white p-8 rounded-sm border border-neutral hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-50 rounded-sm flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold text-text-main mb-4 tracking-wide">
                    AI Assistant
                  </h3>
                  <p className="text-text-main font-body leading-relaxed mb-6">
                    Get instant answers, generate content, and solve complex problems with our advanced AI chat
                    interface.
                  </p>
                  <div className="text-primary font-body font-medium group-hover:text-accent transition-colors">
                    Learn more →
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
