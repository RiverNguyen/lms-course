"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function BannedCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkBanned = async () => {
      try {
        // Skip check for banned page, login, signup, and API routes
        if (
          !pathname ||
          pathname.startsWith("/banned") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/api") ||
          pathname.startsWith("/_next")
        ) {
          return;
        }

        // Check if user is logged in
        const session = await authClient.getSession();

        if (!session?.data?.user?.id) {
          return;
        }

        // Check banned status via API
        const response = await fetch("/api/check-banned", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.banned) {
            router.push("/banned");
          }
        }
      } catch (error) {
        console.error("Error checking banned status:", error);
      }
    };

    checkBanned();
  }, [router, pathname]);

  // Don't render anything, just check in background
  return null;
}
