"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.svg";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import UserDropdown from "@/app/(public)/_components/user-dropdown";

const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-4">
          <Image
            src={Logo}
            alt="TunaLMS"
            width={32}
            height={32}
            className="size-9"
          />
          <span className="font-bold">TunaLMS.</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="md:flex hidden md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium hover:text-primary duration-300 transform-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <AnimatedThemeToggler />
            {isPending ? null : session ? (
              <UserDropdown
                name={session.user.name || ""}
                email={session.user.email || ""}
                image={
                  session.user.image ||
                  `https://avatar.vercel.sh/${session?.user?.email}`
                }
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link href="/login" className={buttonVariants()}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
