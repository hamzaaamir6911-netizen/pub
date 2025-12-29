
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useData } from "@/firebase/data/data-provider"
import type { UserPermissions } from "@/lib/types"

const allPermissions: { id: keyof UserPermissions, label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'estimates', label: 'Estimates' },
    { id: 'sales', label: 'Sales' },
    { id: 'customers', label: 'Customers' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'labour', label: 'Labour' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'reports', label: 'Reports' },
]

function AddEmployeeForm({ onEmployeeAdded }: { onEmployeeAdded: () => void }) {
    const { addEmployee } = useData();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [permissions, setPermissions] = useState<UserPermissions>(() => {
        const initial: Partial<UserPermissions> = {};
        allPermissions.forEach(p => {
            (initial as any)[p.id] = false;
        });
        initial.settings = false; // Employees can never access settings
        return initial as UserPermissions;
    });

    const handlePermissionChange = (id: keyof UserPermissions, checked: boolean) => {
        setPermissions(prev => ({ ...prev, [id]: checked }));
    }

    const handleSubmit = async () => {
        if (!email || !password) {
            toast({ variant: 'destructive', title: "Please fill email and password." });
            return;
        }

        try {
            await addEmployee(email, password, permissions);
            toast({ title: "Employee Added", description: `${email} can now log in with limited access.` });
            onEmployeeAdded();
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    }

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Create a login for an employee with limited access permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@email.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                </div>
                <div>
                    <Label className="font-semibold">Page Access Permissions</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4">
                        {allPermissions.map(p => (
                            <div key={p.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`perm-${p.id}`}
                                    checked={permissions[p.id]}
                                    onCheckedChange={(checked) => handlePermissionChange(p.id, !!checked)}
                                />
                                <Label htmlFor={`perm-${p.id}`} className="font-normal">{p.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Create Employee Account</Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { appUser } = useData();
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);

  const handleChangePassword = () => {
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
    setTimeout(() => {
      if (currentPassword !== "password") {
        toast({ variant: "destructive", title: "Error", description: "Your current password is not correct." })
      } else {
        toast({ title: "Success", description: "Your password has been changed successfully." })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
      setIsSaving(false)
    }, 1000)
  }
  
  // Only admins can see user management
  const isAdmin = appUser?.role === 'admin';

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="grid gap-6">
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

        {isAdmin && (
            <Card>
                <CardHeader>
                    <CardTitle>Manage Employees</CardTitle>
                    <CardDescription>
                        Add or remove employee accounts and manage their access permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Employee list will be shown here in the future */}
                    <p className="text-sm text-muted-foreground">You don&apos;t have any employees yet. Add one to get started.</p>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Dialog open={isEmployeeModalOpen} onOpenChange={setEmployeeModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </DialogTrigger>
                        <AddEmployeeForm onEmployeeAdded={() => setEmployeeModalOpen(false)} />
                    </Dialog>
                </CardFooter>
            </Card>
        )}
      </div>
    </>
  )
}
