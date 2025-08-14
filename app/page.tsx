import { UserSwitcher } from "@/components/user-switcher"
import { AdminDashboard } from "@/components/admin-dashboard"
import { MemberDashboard } from "@/components/member-dashboard"
import { getCurrentUser, getAllUsers } from "@/lib/auth"
import { LandingPage } from "@/components/landing-page"

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-neutral-light">
      {currentUser && (
        <header className="bg-white border-b border-neutral px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <a
              href="/"
              className="text-xl font-heading font-semibold text-primary hover:text-accent transition-colors tracking-wide"
            >
              Nordic.
            </a>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-text-main hover:text-primary transition-colors font-body">
                  Features
                </a>
                <a href="#pricing" className="text-text-main hover:text-primary transition-colors font-body">
                  Pricing
                </a>
                <a href="#about" className="text-text-main hover:text-primary transition-colors font-body">
                  About
                </a>
              </nav>

              <UserSwitcher currentUser={currentUser} users={users} />
            </div>
          </div>
        </header>
      )}

      <main>
        {currentUser?.role === "super_admin" ? (
          <div className="p-6">
            <AdminDashboard />
          </div>
        ) : currentUser ? (
          <div className="p-6">
            <MemberDashboard user={currentUser} />
          </div>
        ) : (
          <LandingPage />
        )}
      </main>
    </div>
  )
}
