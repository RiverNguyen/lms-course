import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftIcon, ShieldXIcon } from "lucide-react";
import Link from "next/link";

const NotAdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto">
            <ShieldXIcon className="size-16 text-destructive" />
          </div>

          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            You are not authorized to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className={buttonVariants({
              className: "w-full",
            })}
          >
            <ArrowLeftIcon className="size-4 mr-1" />
            Go to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotAdminPage;
