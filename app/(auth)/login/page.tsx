import { LoginForm } from "@/app/(auth)/login/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your TunaLMS account to access your courses and continue your learning journey.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Sign In - TunaLMS",
    description: "Sign in to your TunaLMS account to access your courses.",
    url: "/login",
  },
};

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/");
  }

  return <LoginForm />;
};

export default LoginPage;
