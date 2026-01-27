import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface BannedGuardProps {
  children: ReactNode;
}

export async function BannedGuard({ children }: BannedGuardProps) {
  try {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
    
    // Allow access to banned page, login, signup, and API routes
    if (
      pathname.includes("/banned") ||
      pathname.includes("/login") ||
      pathname.includes("/signup") ||
      pathname.includes("/api")
    ) {
      return <>{children}</>;
    }

    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return <>{children}</>;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { banned: true, banExpires: true },
    });

    if (!user) {
      return <>{children}</>;
    }

    // Check if ban has expired
    if (user.banned && user.banExpires && new Date() > user.banExpires) {
      // Ban has expired, unban the user
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          banned: false,
          banReason: null,
          banExpires: null,
        },
      });
      return <>{children}</>;
    }

    // If user is banned, redirect to banned page
    if (user.banned) {
      redirect("/banned");
    }

    return <>{children}</>;
  } catch (error) {
    // If redirect was called, it will throw - that's expected
    if (error && typeof error === "object" && "digest" in error) {
      throw error; // Re-throw Next.js redirect
    }
    console.error("Error in BannedGuard:", error);
    // On error, allow access (fail open)
    return <>{children}</>;
  }
}
