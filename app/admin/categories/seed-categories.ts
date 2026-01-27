"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

const sampleCategories = [
  {
    name: "Information Technology",
    description: "Learn about programming, software development, and IT fundamentals",
  },
  {
    name: "Web Development",
    description: "Master frontend and backend web technologies, frameworks, and best practices",
  },
  {
    name: "Data Science",
    description: "Explore data analysis, machine learning, and artificial intelligence",
  },
  {
    name: "Mobile Development",
    description: "Build iOS and Android applications using modern mobile frameworks",
  },
  {
    name: "Design & UI/UX",
    description: "Create beautiful and user-friendly interfaces and experiences",
  },
  {
    name: "Business & Finance",
    description: "Learn business strategies, finance, marketing, and entrepreneurship",
  },
  {
    name: "Digital Marketing",
    description: "Master SEO, social media marketing, content marketing, and analytics",
  },
  {
    name: "Photography & Video",
    description: "Learn professional photography, videography, and editing techniques",
  },
  {
    name: "Language Learning",
    description: "Improve your language skills with comprehensive courses",
  },
  {
    name: "Personal Development",
    description: "Enhance your skills, productivity, and personal growth",
  },
];

export const SeedCategories = async (): Promise<ApiResponse> => {
  await requireAdmin();

  try {
    const categoriesToCreate = [];

    for (const category of sampleCategories) {
      const slug = slugify(category.name, { lower: true });

      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug },
      });

      if (!existing) {
        categoriesToCreate.push({
          name: category.name,
          slug,
          description: category.description,
        });
      }
    }

    if (categoriesToCreate.length === 0) {
      return {
        status: "success",
        message: "All categories already exist",
      };
    }

    await prisma.category.createMany({
      data: categoriesToCreate,
      skipDuplicates: true,
    });

    revalidatePath("/admin/categories");

    return {
      status: "success",
      message: `Successfully created ${categoriesToCreate.length} categor${categoriesToCreate.length === 1 ? "y" : "ies"}`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
