import { requireUser } from "@/app/data/user/require-user";
import { ProfileEditForm } from "./_components/profile-edit-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
  description: "Chỉnh sửa thông tin cá nhân và ảnh đại diện.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  await requireUser();

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và ảnh đại diện của bạn.
        </p>
      </div>

      <div className="mt-6 max-w-xl">
        <ProfileEditForm />
      </div>
    </>
  );
}
