import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Get all courses for dynamic routes
  let courses: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    const allCourses = await prisma.course.findMany({
      where: {
        status: "Published",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });
    courses = allCourses;
  } catch (error) {
    console.error("Error fetching courses for sitemap:", error);
  }

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic course routes
  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
