"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { updateCouponAction } from "@/app/admin/coupons/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { tryCatch } from "@/hooks/try-catch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { AdminCoupon } from "@/app/data/admin/admin-get-coupons";

interface EditCouponFormProps {
  coupon: AdminCoupon;
}

export default function EditCouponForm({ coupon }: EditCouponFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [minPurchase, setMinPurchase] = useState(
    coupon.minPurchase != null ? String(coupon.minPurchase) : ""
  );
  const [maxUses, setMaxUses] = useState(
    coupon.maxUses != null ? String(coupon.maxUses) : ""
  );
  const [startAt, setStartAt] = useState<Date>(new Date(coupon.startAt));
  const [endAt, setEndAt] = useState<Date>(new Date(coupon.endAt));
  const [active, setActive] = useState(coupon.active);

  const typeLabel = coupon.type === "Percent" ? "Theo phần trăm" : "Số tiền cố định";
  const valueLabel =
    coupon.type === "Percent"
      ? `${coupon.value}%`
      : `${coupon.value.toLocaleString("vi-VN")} VND`;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startAt >= endAt) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
    startTransition(async () => {
      const { data, error } = await tryCatch(
        updateCouponAction(coupon.id, {
          active,
          startAt,
          endAt,
          minPurchase: minPurchase ? parseInt(minPurchase, 10) || null : null,
          maxUses: maxUses ? parseInt(maxUses, 10) || null : null,
        })
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data?.status === "success") {
        toast.success(data.message);
        router.push("/admin/coupons");
        router.refresh();
      } else if (data?.status === "error") {
        toast.error(data.message);
      }
    });
  };

  const today = new Date();

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href="/admin/coupons" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa mã giảm giá</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin mã giảm giá</CardTitle>
          <CardDescription>
            Mã, loại và giá trị không thể thay đổi. Chỉ cập nhật thời gian và trạng thái.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mã</Label>
                <Input value={coupon.code} disabled className="bg-muted font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Loại / Giá trị</Label>
                <Input value={`${typeLabel} - ${valueLabel}`} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Đơn tối thiểu (VND, tùy chọn)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min={0}
                  placeholder="VD: 200000"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Số lượt sử dụng tối đa (để trống = không giới hạn)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min={1}
                  placeholder="VD: 100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Thời gian bắt đầu *</Label>
                <DateTimePicker
                  value={startAt}
                  onChange={setStartAt}
                  placeholder="Chọn ngày và giờ bắt đầu"
                  disabled={isPending}
                  min={today}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian kết thúc *</Label>
                <DateTimePicker
                  value={endAt}
                  onChange={setEndAt}
                  placeholder="Chọn ngày và giờ kết thúc"
                  disabled={isPending}
                  min={startAt ?? today}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="active" checked={active} onCheckedChange={setActive} disabled={isPending} />
              <Label htmlFor="active">Đang kích hoạt</Label>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  Lưu thay đổi <Save className="ml-1 size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
