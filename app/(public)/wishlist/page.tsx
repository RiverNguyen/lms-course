import { requireUser } from "@/app/data/user/require-user";
import { getWishlistCourses } from "@/app/data/wishlist/get-wishlist-courses";
import { WishlistContent } from "./_components/wishlist-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách yêu thích",
  description: "Các khóa học bạn đã lưu vào danh sách yêu thích.",
  openGraph: {
    title: "Danh sách yêu thích - TunaLMS",
    url: "/wishlist",
  },
};

export default async function WishlistPage() {
  await requireUser();
  const courses = await getWishlistCourses();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh sách yêu thích</h1>
        <p className="text-muted-foreground">
          {courses.length}{" "}
          {courses.length === 1 ? "khóa học" : "khóa học"} trong wishlist
        </p>
      </div>
      <WishlistContent initialCourses={courses} />
    </div>
  );
}
