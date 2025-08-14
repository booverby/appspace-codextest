"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit } from "lucide-react"
import type { TestUser, Organization } from "@/lib/types"

interface UserManagementDialogProps {
  user?: TestUser
  onUserSaved: () => void
}

export function UserManagementDialog({ user, onUserSaved }: UserManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    email: user?.email || "",
    password: "",
    name: user?.name || "",
    role: user?.role || "member",
    organization_id: user?.organization_id || "",
  })

  useEffect(() => {
    if (open) {
      fetchOrganizations()
    }
  }, [open])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations")
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users"
      const method = user ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organization_id: formData.role === "super_admin" ? null : formData.organization_id,
        }),
      })

      if (!response.ok) throw new Error("Failed to save user")

      setOpen(false)
      onUserSaved()

      // Reset form if creating new user
      if (!user) {
        setFormData({
          email: "",
          password: "",
          name: "",
          role: "member",
          organization_id: "",
        })
      }
    } catch (error) {
      console.error("Failed to save user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={user ? "outline" : "default"} size="sm">
          {user ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
          {user ? "" : "Add User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user information and permissions." : "Create a new user account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {user && "(leave blank to keep current)"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "member" && (
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
