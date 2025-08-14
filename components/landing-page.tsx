import Link from "next/link"
import { MessageSquare, Languages, Zap, Shield, Users } from "lucide-react"
import { UserSwitcher } from "@/components/user-switcher"
import type { TestUser } from "@/lib/types"

interface LandingPageProps {
  currentUser: TestUser | null
}

export function LandingPage({ currentUser }: LandingPageProps) {
  return (
    <div className="bg-neutral-light">
      {/* Header with Nordic branding and user dropdown */}
      <header className="px-6 py-4 bg-white border-b border-neutral">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-heading font-semibold text-primary tracking-wide hover:text-accent transition-colors"
          >
            Nordic.
          </a>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-text-main font-body hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#products" className="text-text-main font-body hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="#about" className="text-text-main font-body hover:text-primary transition-colors">
                About
              </Link>
            </nav>

            <UserSwitcher currentUser={currentUser} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-heading font-semibold text-primary mb-6 tracking-tight">AI, Simplified.</h1>
          <p className="text-xl text-text-main mb-8 max-w-2xl mx-auto font-body leading-relaxed">
            Access powerful AI applications with clean interfaces and intelligent functionality, inspired by Nordic
            minimalism.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="nordic-button-primary">Access Nordic AI</button>
            <button className="nordic-button-outline">View Features</button>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="px-6 py-16 bg-white" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-heading font-semibold text-primary mb-4 text-center tracking-wide">
            Why Choose Nordic AI
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-12"></div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">Swift & Seamless</h3>
              <p className="text-text-main font-body leading-relaxed">
                Experience lightning-fast AI responses with intuitive interfaces designed for maximum productivity.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">
                Secure & Reliable
              </h3>
              <p className="text-text-main font-body leading-relaxed">
                Built on a foundation of enterprise-grade security with unwavering stability and data protection.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-sm flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-text-main mb-3 tracking-wide">Pure & Intuitive</h3>
              <p className="text-text-main font-body leading-relaxed">
                A beautifully simple interface that flows naturally, removing complexity while enhancing capability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-6 py-16" id="products">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-heading font-semibold text-primary mb-4 text-center tracking-wide">
            Our AI Applications
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-12"></div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/apps/prompt/landing" className="group">
              <div className="bg-white p-8 rounded-sm border border-neutral hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-50 rounded-sm flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-text-main mb-4 tracking-wide">AI Assistant</h3>
                <p className="text-text-main font-body leading-relaxed mb-6">
                  Get instant answers, generate content, and solve complex problems with our advanced AI chat interface.
                </p>
                <div className="text-primary font-body font-medium group-hover:text-accent transition-colors">
                  Learn more →
                </div>
              </div>
            </Link>

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
    </div>
  )
}
