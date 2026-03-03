"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Đăng xuất thành công");
              router.push("/login");
            },
            onError: (error) => {
              toast.error(error.error.message || "Không thể đăng xuất");
            },
          },
        });
      } catch (error) {
        toast.error("Không thể đăng xuất");
      }
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      variant="outline"
      className="w-full"
    >
      {isPending ? (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          Đang đăng xuất...
        </>
      ) : (
        <>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Đăng xuất
        </>
      )}
    </Button>
  );
}
