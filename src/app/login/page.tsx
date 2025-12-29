
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [email, setEmail] = useState("admin@arco.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // Use window location to force a full reload and ensure all contexts are reset
      window.location.href = "/app/dashboard";
    } catch (error: any) {
        // If user not found, and it's the admin email, create the first admin user
        if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && email === 'admin@arco.com') {
            try {
                const adminUserRef = doc(firestore, 'users', 'admin_user_placeholder'); // Check if any user exists
                const userDocs = await getDoc(adminUserRef); // Simplified check
                
                // This logic is simplified: in a real app, you'd check for an `admin` collection or a `users` collection count.
                // For this project, we assume if admin@arco.com fails to log in, it's the first run.
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Create the admin user profile in Firestore
                const userProfileRef = doc(firestore, 'users', user.uid);
                await setDoc(userProfileRef, {
                    id: user.uid,
                    email: user.email,
                    role: 'admin',
                    permissions: { // Admins have all permissions
                        dashboard: true, inventory: true, estimates: true, sales: true,
                        customers: true, vendors: true, labour: true, payroll: true,
                        expenses: true, ledger: true, reports: true, settings: true,
                    },
                    createdAt: serverTimestamp()
                });

                toast({
                    title: "Admin Account Created",
                    description: "Logged in successfully. Redirecting...",
                });
                window.location.href = "/app/dashboard";
            } catch (creationError: any) {
                 toast({
                    variant: "destructive",
                    title: "Setup Failed",
                    description: creationError.message || "An unknown error occurred during admin setup.",
                });
            }
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "Invalid credentials or another error occurred.",
            });
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <div className="mb-4 flex justify-center">
            <Factory className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-headline">ARCO Factory Manager</h1>
          <p className="text-balance text-muted-foreground">
            Enter your credentials to access the application
          </p>
        </div>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@arco.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
