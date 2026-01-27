"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, Loader2Icon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const SignupForm = () => {
  const router = useRouter();

  const [githubPending, startGithubTransition] = useTransition();
  const [googlePending, startGoogleTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");

  const signUpWithGithub = async () => {
    startGithubTransition(async () => {
      // better-auth uses signIn.social for both sign-up and sign-in
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success(
              "Sign up with Github successfully, redirecting to homepage..."
            );
            router.push("/");
          },
          onError: (error: { error: { message: string } }) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  };

  const signUpWithGoogle = async () => {
    startGoogleTransition(async () => {
      // better-auth uses signIn.social for both sign-up and sign-in
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success(
              "Sign up with Google successfully, redirecting to homepage..."
            );
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
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in", // better-auth emailOTP uses "sign-in" for both sign-up and sign-in
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent successfully");
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Sign up with your Google, Github, or Email Account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          className="w-full"
          variant="outline"
          onClick={signUpWithGoogle}
          disabled={googlePending}
        >
          {googlePending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Signing up with Google...</span>
            </>
          ) : (
            <>
              <svg
                className="size-4"
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
              Sign up with Google
            </>
          )}
        </Button>

        <Button
          className="w-full"
          variant="outline"
          onClick={signUpWithGithub}
          disabled={githubPending}
        >
          {githubPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Signing up with Github...</span>
            </>
          ) : (
            <>
              <GithubIcon className="size-4" />
              Sign up with Github
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:justify-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              placeholder="m@example.com"
            />
          </div>

          <Button onClick={signUpWithEmail} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                <span>Sending email...</span>
              </>
            ) : (
              <>
                <SendIcon className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
