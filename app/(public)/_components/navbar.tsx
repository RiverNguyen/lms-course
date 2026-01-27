"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.svg";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import UserDropdown from "@/app/(public)/_components/user-dropdown";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useCartStore } from "@/store/cart-store";
import { CartSheet } from "@/app/(public)/_components/cart-sheet";

const navItems = [
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8 gap-4">
        <Link href="/" className="flex items-center space-x-2 mr-4 flex-shrink-0">
          <Image
            src={Logo}
            alt="TunaLMS"
            width={32}
            height={32}
            className="size-9"
          />
          <span className="font-bold">TunaLMS.</span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md items-center relative"
        >
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <button
            type="submit"
            className="absolute right-2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Desktop navigation */}
        <nav className="md:flex hidden md:flex-1 md:items-center md:justify-end">
          <div className="flex items-center space-x-4 mr-4">
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
            <button
              onClick={() => setCartOpen(true)}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
            </button>
            <AnimatedThemeToggler />
            {isPending ? null : session ? (
              <UserDropdown
                name={session.user.name || ""}
                email={session.user.email || ""}
                image={
                  session.user.image ||
                  `https://avatar.vercel.sh/${session?.user?.email}`
                }
                role={session.user.role || ""}
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

        {/* Mobile menu button - can be enhanced later */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setCartOpen(true)}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
          </button>
          <AnimatedThemeToggler />
          {!isPending && !session && (
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Search className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};
