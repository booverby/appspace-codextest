"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, UserMinus, Search } from "lucide-react"
import { MemberRoleManagement } from "@/components/member-role-management"
import type { TestUser } from "@/lib/types"

interface OrganizationMembersDialogProps {
  organizationId: string
  organizationName: string
}

export function OrganizationMembersDialog({ organizationId, organizationName }: OrganizationMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<TestUser[]>([])
  const [availableUsers, setAvailableUsers] = useState<TestUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, organizationId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [membersRes, usersRes] = await Promise.all([
        fetch(`/api/admin/organizations/${organizationId}/members`),
        fetch("/api/admin/users"),
      ])

      const [membersData, usersData] = await Promise.all([membersRes.json(), usersRes.json()])

      setMembers(membersData)

      // Filter out users who are already members and super admins
      const memberIds = new Set(membersData.map((m: TestUser) => m.id))
      const available = usersData.filter(
        (user: TestUser) => !memberIds.has(user.id) && user.role !== "super_admin" && !user.tenant_id,
      )
      setAvailableUsers(available)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: selectedUsers }),
      })

      if (!response.ok) throw new Error("Failed to add members")

      setSelectedUsers([])
      fetchData()
    } catch (error) {
      console.error("Failed to add members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove member")

      fetchData()
    } catch (error) {
      console.error("Failed to remove member:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredMembers = members.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Members - {organizationName}</DialogTitle>
          <DialogDescription>Add or remove members from this organization</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Current Members ({members.length})</TabsTrigger>
              <TabsTrigger value="add">Add Members ({availableUsers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>{searchTerm ? "No members found" : "No members in this organization"}</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MemberRoleManagement
                            member={member}
                            organizationId={organizationId}
                            onRoleUpdated={fetchData}
                          />
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.name} from {organizationName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredAvailableUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>{searchTerm ? "No users found" : "No available users to add"}</p>
                  </div>
                ) : (
                  filteredAvailableUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">{selectedUsers.length} users selected</span>
                  <Button onClick={handleAddMembers} disabled={loading} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loading ? "Adding..." : "Add Selected"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
