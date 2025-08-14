import Link from "next/link"
import { getCurrentUser, getAllUsers } from "@/lib/auth"
import { UserSwitcher } from "@/components/user-switcher"

export async function AppHeader() {
  const currentUser = await getCurrentUser()
  const users = await getAllUsers()

  return (
    <header className="bg-white border-b border-neutral px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-xl font-heading font-semibold text-text-main hover:text-primary transition-colors"
        >
          Nordic.
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-text-main hover:text-primary transition-colors font-body">
            Apps
          </Link>
          <Link href="/features" className="text-text-main hover:text-primary transition-colors font-body">
            Features
          </Link>
          <Link href="/about" className="text-text-main hover:text-primary transition-colors font-body">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {currentUser && <UserSwitcher currentUser={currentUser} users={users} />}
        </div>
      </div>
    </header>
  )
}
