import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Account Banned",
  description: "Your account has been banned from TunaLMS.",
  robots: {
    index: false,
    follow: false,
  },
};

const BannedPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  // Get ban details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { banned: true, banReason: true, banExpires: true },
  });

  // If user is not banned, redirect to home
  if (!user?.banned) {
    return redirect("/");
  }

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
    return redirect("/");
  }

  const banExpiresDate = user.banExpires
    ? new Date(user.banExpires).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircleIcon className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Banned</CardTitle>
          <CardDescription>
            Your account has been suspended from TunaLMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.banReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive mb-2">
                Reason for ban:
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {user.banReason}
              </p>
            </div>
          )}

          {banExpiresDate ? (
            <p className="text-sm text-muted-foreground text-center">
              This ban will expire on <strong>{banExpiresDate}</strong>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              This is a permanent ban.
            </p>
          )}

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>What this means:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>You cannot access your account</li>
              <li>You cannot access your enrolled courses</li>
              <li>All access privileges have been revoked</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              If you believe this is a mistake or would like to appeal this
              decision, please contact us:
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MailIcon className="h-4 w-4" />
              <a
                href="mailto:contact@tunalms.com"
                className="text-primary hover:underline font-medium"
              >
                contact@tunalms.com
              </a>
            </div>
          </div>

          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default BannedPage;
