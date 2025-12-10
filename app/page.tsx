"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const HomePage = () => {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // console.log(session);
  const router = useRouter();

  const { data: session, isPending, error, refetch } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/login");
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <AnimatedThemeToggler />
      {session?.user ? (
        <div>
          <h1>Welcome {session.user.name}</h1>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      ) : (
        <div>
          <h1>Please login</h1>
          <Button onClick={() => router.push("/login")}>Login</Button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
