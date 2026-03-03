"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProfileEditForm() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setImage(session.user.image ?? null);
    }
  }, [session?.user?.id]);

  const currentImage = image ?? session?.user?.image ?? null;
  const currentName = (name || session?.user?.name) ?? "";

  const uploadAvatar = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Ảnh tối đa 2MB");
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await fetch("/api/s3/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Không thể tải ảnh lên");
        return;
      }

      const { presignedUrl, publicUrl } = await res.json();

      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setImage(publicUrl);
      toast.success("Đã tải ảnh lên. Nhấn Lưu thay đổi để cập nhật.");
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    startTransition(async () => {
      try {
        await authClient.updateUser({
          name: (name.trim() || session.user.name) ?? undefined,
          image: currentImage ?? undefined,
        });
        toast.success("Đã cập nhật thông tin");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Không thể cập nhật. Vui lòng thử lại.");
      }
    });
  };

  if (sessionPending || !session) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Cập nhật thông tin cá nhân</CardTitle>
          <CardDescription>
            Chỉnh sửa tên và ảnh đại diện của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={
                  currentImage ??
                  `https://avatar.vercel.sh/${session.user.email}`
                }
                alt={currentName}
              />
              <AvatarFallback className="text-2xl">
                {currentName?.[0]?.toUpperCase() ??
                  session.user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadAvatar(f);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUploading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  "Chọn ảnh đại diện"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP hoặc GIF. Tối đa 2MB.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ tên"
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session.user.email ?? ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email không thể thay đổi.
            </p>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
