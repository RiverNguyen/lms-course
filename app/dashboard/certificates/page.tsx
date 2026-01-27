import { getUserCertificates } from "@/app/data/user/get-user-certificates";
import EmptyState from "@/components/general/empty-state";
import CertificateCard from "../_components/certificate-card";
import type { Metadata } from "next";
import { Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Certificates",
  description: "View your course completion certificates",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CertificatesPage() {
  const certificates = await getUserCertificates();

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 flex items-center justify-center">
            <Award className="size-5 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Chứng chỉ của tôi</h1>
            <p className="text-muted-foreground">
              Bạn có {certificates.length} chứng chỉ hoàn thành khóa học
            </p>
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="Chưa có chứng chỉ"
          description="Hoàn thành các khóa học để nhận chứng chỉ xác nhận"
          buttonText="Xem khóa học"
          href="/dashboard"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </>
  );
}
