"use client";

import {
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconListDetails,
  IconMessageStar,
  IconReceipt,
  IconSettings,
  IconTag,
  IconUsers
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

import Logo from "@/public/logo.svg";

const data = {
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Khóa học",
      url: "/admin/courses",
      icon: IconListDetails,
    },
    {
      title: "Danh mục",
      url: "/admin/categories",
      icon: IconFolder,
    },
    {
      title: "Người dùng",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Đơn hàng",
      url: "/admin/orders",
      icon: IconReceipt,
    },
    {
      title: "Đánh giá",
      url: "/admin/reviews",
      icon: IconMessageStar,
    },
    {
      title: "Mã giảm giá",
      url: "/admin/coupons",
      icon: IconTag,
    }
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Đề xuất đang hoạt động",
          url: "#",
        },
        {
          title: "Đã lưu trữ",
          url: "#",
        },
      ],
    },
    {
      title: "Đề xuất",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Đề xuất đang hoạt động",
          url: "#",
        },
        {
          title: "Đã lưu trữ",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Đề xuất đang hoạt động",
          url: "#",
        },
        {
          title: "Đã lưu trữ",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Image
                  src={Logo}
                  alt="logo"
                  width={100}
                  height={100}
                  className="size-5"
                />
                <span className="text-base font-semibold">TunaLMS.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
