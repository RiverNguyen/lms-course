import { SignupForm } from "@/app/(auth)/signup/signup-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản TunaLMS mới để bắt đầu hành trình học tập của bạn.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Đăng ký - TunaLMS",
    description: "Tạo tài khoản TunaLMS mới để bắt đầu hành trình học tập của bạn.",
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
