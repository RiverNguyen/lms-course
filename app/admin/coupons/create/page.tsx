"use client";

import { createCouponAction } from "@/app/admin/coupons/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { tryCatch } from "@/hooks/try-catch";
import { useConfetti } from "@/hooks/use-confetti";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

export default function CreateCouponPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { triggerConfetti } = useConfetti();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"Percent" | "Fixed">("Percent");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startAt, setStartAt] = useState<Date | undefined>(undefined);
  const [endAt, setEndAt] = useState<Date | undefined>(undefined);
  const [active, setActive] = useState(true);

  const today = new Date();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = type === "Percent" ? parseInt(value, 10) : parseInt(value, 10);
    if (isNaN(valueNum) || valueNum < 1) {
      toast.error(type === "Percent" ? "Phần trăm phải từ 1 đến 100" : "Số tiền phải lớn hơn 0");
      return;
    }
    if (type === "Percent" && valueNum > 100) {
      toast.error("Phần trăm không được vượt quá 100");
      return;
    }
    if (!startAt || !endAt) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }
    if (startAt >= endAt) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
    startTransition(async () => {
      const { data, error } = await tryCatch(
        createCouponAction({
          code: code.trim(),
          type,
          value: valueNum,
          minPurchase: minPurchase ? parseInt(minPurchase, 10) || undefined : undefined,
          maxUses: maxUses ? parseInt(maxUses, 10) || undefined : undefined,
          startAt,
          endAt,
          active,
        })
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data?.status === "success") {
        toast.success(data.message);
        triggerConfetti();
        router.push("/admin/coupons");
      } else if (data?.status === "error") {
        toast.error(data.message);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href="/admin/coupons" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold">Tạo mã giảm giá</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin mã giảm giá</CardTitle>
          <CardDescription>
            Mã sẽ được đồng bộ với Stripe để áp dụng khi thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Mã giảm giá *</Label>
                <Input
                  id="code"
                  placeholder="VD: SALE10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Loại *</Label>
                <Select value={type} onValueChange={(v) => setType(v as "Percent" | "Fixed")} disabled={isPending}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percent">Theo phần trăm (%)</SelectItem>
                    <SelectItem value="Fixed">Giảm số tiền cố định (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {type === "Percent" ? "Phần trăm giảm (1-100) *" : "Số tiền giảm (VND) *"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  min={type === "Percent" ? 1 : 1}
                  max={type === "Percent" ? 100 : undefined}
                  placeholder={type === "Percent" ? "10" : "50000"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>
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
              <Label htmlFor="active">Kích hoạt ngay</Label>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  Tạo mã giảm giá <Plus className="ml-1 size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
