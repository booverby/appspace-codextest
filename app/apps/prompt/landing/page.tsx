import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { MessageSquare, Languages, Brain, FileText, Lightbulb } from "lucide-react"

export default async function PromptLandingPage() {
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
              <Link href="/apps/prompt" className="nordic-button-primary">
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
            <div className="w-20 h-20 bg-blue-50 rounded-sm flex items-center justify-center mx-auto mb-8">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-6xl font-heading font-semibold text-primary mb-6 tracking-tight">AI Assistant</h1>
            <p className="text-xl text-text-main mb-8 max-w-2xl mx-auto font-body leading-relaxed">
              Get instant answers, generate content, and solve complex problems with our advanced AI chat interface.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link href="/apps/prompt" className="nordic-button-primary">
                  Launch AI Assistant
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
              Powerful AI Capabilities
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto mb-12"></div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">
                  Intelligent Responses
                </h3>
                <p className="text-text-main font-body leading-relaxed">
                  Advanced AI that understands context and provides accurate, helpful responses to complex queries.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">
                  Content Generation
                </h3>
                <p className="text-text-main font-body leading-relaxed">
                  Create high-quality content, from emails to reports, tailored to your specific needs and style.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">
                  Problem Solving
                </h3>
                <p className="text-text-main font-body leading-relaxed">
                  Break down complex problems and get step-by-step solutions with clear explanations and actionable
                  insights.
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
              <Link href="/apps/translate/landing" className="group">
                <div className="bg-white p-8 rounded-sm border border-neutral hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-orange-50 rounded-sm flex items-center justify-center mb-6">
                    <Languages className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold text-text-main mb-4 tracking-wide">
                    Smart Translation
                  </h3>
                  <p className="text-text-main font-body leading-relaxed mb-6">
                    Break language barriers with intelligent translation that understands context and nuance.
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
