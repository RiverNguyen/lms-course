"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, Loader2Icon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "motion/react";

export const RegistrationSection = () => {
  const router = useRouter();
  const [githubPending, startGithubTransition] = useTransition();
  const [googlePending, startGoogleTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");

  const signUpWithGoogle = async () => {
    startGoogleTransition(async () => {
      // better-auth uses signIn.social for both sign-up and sign-in
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully signed up with Google!");
            router.push("/");
          },
          onError: (error: { error: { message: string } }) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  };

  const signUpWithGithub = async () => {
    startGithubTransition(async () => {
      // better-auth uses signIn.social for both sign-up and sign-in
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully signed up with GitHub!");
            router.push("/");
          },
          onError: (error: { error: { message: string } }) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  };

  const signUpWithEmail = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in", // better-auth emailOTP uses "sign-in" for both sign-up and sign-in
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent successfully!");
            router.push(`/verify-request?email=${email}`);
          },
          onError: (error: { error: { message: string } }) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  };

  return (
    <section id="signup" className="py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Start Learning Today</CardTitle>
              <CardDescription>
                Sign up for a free account to access thousands of high-quality courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Sign In */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        signUpWithEmail();
                      }
                    }}
                  />
                  <Button
                    onClick={signUpWithEmail}
                    disabled={emailPending}
                    type="button"
                  >
                    {emailPending ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send an OTP code to your email
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign in with
                  </span>
                </div>
              </div>

              {/* Social Sign Up */}
              <Button
                variant="outline"
                className="w-full"
                onClick={signUpWithGoogle}
                disabled={googlePending}
                type="button"
              >
                {googlePending ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Sign up with Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={signUpWithGithub}
                disabled={githubPending}
                type="button"
              >
                {githubPending ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GithubIcon className="mr-2 h-4 w-4" />
                )}
                Sign up with GitHub
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in now
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
