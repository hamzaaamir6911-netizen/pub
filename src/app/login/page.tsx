
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useFirebase } from "@/firebase/firebase-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";

function LoginComponent() {
  const router = useRouter();
  const { toast } = useToast();
  // Correctly get auth from the provider context
  const { auth } = useFirebase(); 
  const [email, setEmail] = useState("admin@arco.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firebase is not initialized. Please refresh the page.",
        });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/app/dashboard");
    } catch (error: any) {
       if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          // If the user doesn't exist, create an account with the default credentials
          await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: "Account Created",
            description: "Welcome to ARCO Factory Manager! Your default account has been set up.",
          });
          router.push("/app/dashboard");
        } catch (creationError: any) {
          toast({
            variant: "destructive",
            title: "Account Creation Failed",
            description: creationError.message,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
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


export default function LoginPage() {
  // The FirebaseClientProvider correctly wraps the entire page content.
  return (
    <FirebaseClientProvider>
      <LoginComponent />
      <Toaster />
    </FirebaseClientProvider>
  )
}
