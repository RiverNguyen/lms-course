import { BookOpen, Heart, HomeIcon, LayoutDashboard, LogOutIcon, ShieldUser } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/hooks/use-sign-out";
import Link from "next/link";

const listItems = [
  {
    icon: HomeIcon,
    property: "Trang chủ",
    href: "/",
  },
  {
    icon: BookOpen,
    property: "Khóa học",
    href: "/courses",
  },
  {
    icon: Heart,
    property: "Danh sách yêu thích",
    href: "/wishlist",
  },
  {
    icon: LayoutDashboard,
    property: "Bảng điều khiển",
    href: "/dashboard",
  },
];

interface IAppProps {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

const UserDropdown = ({ name, email, image, role }: IAppProps) => {
  const handleSignOut = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image} alt="Ảnh đại diện người dùng" />
            <AvatarFallback>
              {(name?.[0] ?? email?.[0] ?? "?").toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name ?? "Người dùng"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email ?? ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {listItems.map((item, index) => (
            <DropdownMenuItem key={index} asChild>
              <Link href={item.href}>
                <item.icon className="size-4" />
                <span className="text-popover-foreground">{item.property}</span>
              </Link>
            </DropdownMenuItem>
          ))}
          {role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldUser className="size-4" />
                <span className="text-popover-foreground">Quản trị</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOutIcon className="size-4" />
            <span className="text-popover-foreground">Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
