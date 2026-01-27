import "server-only";
import { requireUser } from "./require-user";
import { prisma } from "@/lib/prisma";

export const getUserCertificates = async () => {
  const user = await requireUser();

  const certificates = await prisma.certificate.findMany({
    where: {
      userId: user.id,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          level: true,
          duration: true,
        },
      },
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  return certificates;
};

export type UserCertificate = Awaited<ReturnType<typeof getUserCertificates>>[number];
