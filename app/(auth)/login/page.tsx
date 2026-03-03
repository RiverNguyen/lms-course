import { LoginForm } from "@/app/(auth)/login/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản TunaLMS của bạn để truy cập các khóa học và tiếp tục hành trình học tập.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Đăng nhập - TunaLMS",
    description: "Đăng nhập vào tài khoản TunaLMS của bạn để truy cập các khóa học.",
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
