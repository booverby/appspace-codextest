"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User, LogOut } from "lucide-react"
import type { TestUser } from "@/lib/types"

interface UserSwitcherProps {
  currentUser: TestUser | null
}

export function UserSwitcher({ currentUser }: UserSwitcherProps) {
  const [users, setUsers] = useState<TestUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleUserSwitch = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        window.location.href = window.location.pathname
      } else {
        console.error("Failed to switch user: Server error")
      }
    } catch (error) {
      console.error("Failed to switch user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        window.location.href = "/"
      } else {
        console.error("Failed to logout: Server error")
      }
    } catch (error) {
      console.error("Failed to logout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent" disabled={loading}>
          <User className="h-4 w-4" />
          {currentUser ? currentUser.name : "Select User"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleUserSwitch(user.id)}
            className="flex flex-col items-start gap-1"
          >
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">
              {user.email} • {user.role}
            </div>
          </DropdownMenuItem>
        ))}
        {currentUser && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
