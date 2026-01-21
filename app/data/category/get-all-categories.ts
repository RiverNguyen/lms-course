import { prisma } from "@/lib/prisma";

export const getAllCategories = async () => {
  const data = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return data;
};

export type AllCategoriesType = Awaited<
  ReturnType<typeof getAllCategories>
>[number];
