"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, Crown } from "lucide-react"
import type { TestUser } from "@/lib/types"

interface MemberRoleManagementProps {
  member: TestUser
  organizationId: string
  onRoleUpdated: () => void
}

export function MemberRoleManagement({ member, organizationId, onRoleUpdated }: MemberRoleManagementProps) {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(member.role === "org_admin" ? "admin" : "member")
  const [loading, setLoading] = useState(false)

  const handleUpdateRole = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members/${member.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) throw new Error("Failed to update role")

      setOpen(false)
      onRoleUpdated()
    } catch (error) {
      console.error("Failed to update member role:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentRole = member.role === "org_admin" ? "admin" : "member"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <Badge variant={currentRole === "admin" ? "default" : "secondary"} className="cursor-pointer">
            {currentRole === "admin" ? <Crown className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
            {currentRole === "admin" ? "Admin" : "Member"}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Member Role</DialogTitle>
          <DialogDescription>Change the role for {member.name} in this organization</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Member - Basic access
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 mr-2" />
                    Admin - Can manage organization
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Member:</strong> Can use organization apps and view basic information
            </p>
            <p>
              <strong>Admin:</strong> Can manage organization settings, members, and API keys
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} disabled={loading || selectedRole === currentRole}>
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
