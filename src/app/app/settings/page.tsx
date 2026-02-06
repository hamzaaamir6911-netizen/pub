
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/hooks/use-toast"
import { useAuth, useUser } from "@/firebase"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, createUserWithEmailAndPassword } from "firebase/auth"
import { useData } from "@/firebase/data/data-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { UserProfile } from "@/lib/types"

function ChangePasswordCard() {
  const { toast } = useToast()
  const auth = useAuth()
  const { user } = useUser()
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleChangePassword = async () => {
    setIsSaving(true)
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all password fields." })
      setIsSaving(false)
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." })
      setIsSaving(false)
      return
    }
    if (!user || !user.email) {
      toast({ variant: "destructive", title: "Error", description: "Could not find current user." })
      setIsSaving(false)
      return
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      toast({ title: "Success", description: "Your password has been changed successfully." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to change password. Please check your current password." })
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your login password. After saving, you will need to use the
          new password for your next login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isSaving}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSaving}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSaving} />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleChangePassword} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Password"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function UserManagementCard() {
    const { allUsers, createUser } = useData();
    const { toast } = useToast();
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateUser = async () => {
        if (!newEmail || !newPassword) {
            toast({ variant: "destructive", title: "Error", description: "Please provide email and password." });
            return;
        }
        setIsCreating(true);
        try {
            await createUser(newEmail, newPassword);
            toast({ title: "User Created", description: `${newEmail} has been created successfully.` });
            setNewEmail("");
            setNewPassword("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Creation Failed", description: error.message || "Could not create user." });
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Create new users with limited access. New users will have the 'user' role by default.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">Create New User</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="new-email">Email</Label>
                            <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={isCreating} placeholder="user@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-user-password">Password</Label>
                            <Input id="new-user-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isCreating} placeholder="••••••••" />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleCreateUser} disabled={isCreating} className="w-full sm:w-auto">
                                {isCreating ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Existing Users</h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allUsers.map((user: UserProfile) => (
                                    <TableRow key={user.email}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function SettingsPage() {
  const { isAdmin } = useData();
  
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="grid gap-6">
        <ChangePasswordCard />
        {isAdmin && <UserManagementCard />}
      </div>
    </>
  )
}
