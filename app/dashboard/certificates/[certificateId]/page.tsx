import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import CertificateView from "./_components/certificate-view";

type Params = Promise<{
  certificateId: string;
}>;

export default async function CertificateDetailPage({
  params,
}: {
  params: Params;
}) {
  const user = await requireUser();
  const { certificateId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          level: true,
          duration: true,
          description: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!certificate) {
    return notFound();
  }

  // Verify the certificate belongs to the current user
  if (certificate.userId !== user.id) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/certificates"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Quay lại
      </Link>

      <CertificateView
        userName={certificate.user.name || ""}
        userEmail={certificate.user.email || ""}
        courseTitle={certificate.course.title}
        courseLevel={certificate.course.level}
        issuedAt={certificate.issuedAt}
        certificateNumber={certificate.certificateNumber}
      />
    </div>
  );
}
