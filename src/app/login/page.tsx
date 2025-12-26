"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


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
      router.push("/app/dashboard");
    } catch (error: any) {
        // If user not found, create a new user with these credentials
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Grant admin role to the new user by creating a document in roles_admin
                if (user && firestore) {
                  const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
                  // Ensure you set some data in the document for the 'exists' check to work reliably
                  await setDoc(adminRoleRef, { role: 'admin' });
                }

                toast({
                    title: "Admin Account Created",
                    description: "Logged in successfully and granted admin privileges. Redirecting...",
                });
                // Perform a hard reload to ensure Firebase auth state and custom claims are refreshed
                window.location.href = "/app/dashboard";
            } catch (creationError: any) {
                 toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: creationError.message || "An unknown error occurred during signup.",
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
            Enter your credentials to access the admin panel
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
