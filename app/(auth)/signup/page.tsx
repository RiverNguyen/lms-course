import { SignupForm } from "@/app/(auth)/signup/signup-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new TunaLMS account to start your learning journey.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Sign Up - TunaLMS",
    description: "Create a new TunaLMS account to start your learning journey.",
    url: "/signup",
  },
};

const SignupPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/");
  }

  return <SignupForm />;
};

export default SignupPage;
