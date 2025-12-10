import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href={"/"}
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href={"/"}
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src="/logo.svg" alt="TunaLMS" width={32} height={32} />
          TunaLMS.
        </Link>
        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href={"/terms"}
            className="underline hover:text-primary duration-300 transform-all"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={"/privacy"}
            className="underline hover:text-primary duration-300 transform-all"
          >
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
