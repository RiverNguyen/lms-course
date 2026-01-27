import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ banned: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { banned: true, banExpires: true },
    });

    if (!user) {
      return NextResponse.json({ banned: false });
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
      return NextResponse.json({ banned: false });
    }

    return NextResponse.json({ banned: user.banned || false });
  } catch (error) {
    console.error("Error checking banned status:", error);
    return NextResponse.json({ banned: false }, { status: 500 });
  }
}
