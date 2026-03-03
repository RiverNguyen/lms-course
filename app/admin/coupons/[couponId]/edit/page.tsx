import EditCouponForm from "@/app/admin/coupons/[couponId]/edit/_components/edit-coupon-form";
import { adminGetCoupon } from "@/app/data/admin/admin-get-coupons";

type Params = Promise<{ couponId: string }>;

export default async function EditCouponPage({ params }: { params: Params }) {
  const { couponId } = await params;
  const coupon = await adminGetCoupon(couponId);

  return <EditCouponForm coupon={coupon} />;
}
