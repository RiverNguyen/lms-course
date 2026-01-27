import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireAdmin = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  // Check if user is banned
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { banned: true, banReason: true, banExpires: true },
  });

  if (user?.banned) {
    // Check if ban has expired
    if (user.banExpires && new Date() > user.banExpires) {
      // Ban has expired, unban the user
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          banned: false,
          banReason: null,
          banExpires: null,
        },
      });
    } else {
      // User is still banned, redirect to banned page
      redirect("/banned");
    }
  }

  if (session.user.role !== "admin") {
    return redirect("/not-admin");
  }

  return session;
});
