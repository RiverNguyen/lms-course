"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.svg";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import UserDropdown from "@/app/(public)/_components/user-dropdown";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { CartSheet } from "@/app/(public)/_components/cart-sheet";
import { getCourseImageUrl } from "@/hooks/use-construct-url";

type SearchCourse = {
  id: string;
  title: string;
  slug: string;
  smallDescription: string | null;
  level: string;
  fileKey: string | null;
  category: { name: string };
};

const navItems = [
  {
    name: "Khóa học",
    href: "/courses",
  },
  {
    name: "Giới thiệu",
    href: "/about",
  },
  {
    name: "Liên hệ",
    href: "/contact",
  },
];

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchCourse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Đồng bộ ô tìm kiếm với URL khi đang ở trang /courses (để hiển thị đúng từ khóa)
  useEffect(() => {
    if (pathname === "/courses") {
      setSearchQuery(searchParams.get("search") ?? "");
    }
  }, [pathname, searchParams]);

  // Gợi ý khóa học khi gõ (debounce 300ms)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/courses/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(data.courses ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const url = q ? `/courses?search=${encodeURIComponent(q)}` : "/courses";
    setSearchOpen(false);
    router.push(url);
    router.refresh();
  };

  const showDropdown = searchOpen && searchQuery.trim().length >= 2;

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

        {/* Search Bar + Dropdown gợi ý khóa học */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <Input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setSearchOpen(true)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-background shadow-lg z-50 max-h-[min(400px,70vh)] overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1 p-1">
                {searchLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Đang tìm...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Không tìm thấy khóa học.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {searchResults.map((course) => (
                      <li key={course.id}>
                        <Link
                          href={`/courses/${course.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <div className="relative size-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={getCourseImageUrl(course.fileKey)}
                              alt={course.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium line-clamp-1">{course.title}</span>
                            {(course.smallDescription ?? course.category.name) && (
                              <span className="text-muted-foreground line-clamp-1 block mt-0.5">
                                {course.smallDescription ?? course.category.name}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!searchLoading && searchResults.length > 0 && (
                <Link
                  href={`/courses?search=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => setSearchOpen(false)}
                  className="border-t py-2.5 px-3 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
                >
                  Xem tất cả kết quả
                </Link>
              )}
            </div>
          )}
        </div>

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
              aria-label="Giỏ hàng"
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
            {session && <NotificationBell variant="ghost" size="icon" />}
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
                  Đăng nhập
                </Link>
                <Link href="/login" className={buttonVariants()}>
                  Bắt đầu
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
            aria-label="Giỏ hàng"
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
