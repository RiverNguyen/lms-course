"use client";

import { UserCertificate } from "@/app/data/user/get-user-certificates";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { Award, Calendar, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

interface CertificateCardProps {
  certificate: UserCertificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const thumbnailUrl = useConstructUrl(certificate.course.fileKey);

  return (
    <Card className="group relative py-0 gap-0 hover:shadow-lg transition-shadow">
      <Badge className="absolute top-2 right-2 z-[10] bg-gradient-to-r from-yellow-500 to-orange-500">
        <Award className="size-3 mr-1" />
        Certificate
      </Badge>
      <Image
        src={thumbnailUrl}
        alt={certificate.course.title}
        width={600}
        height={400}
        className="w-full rounded-t-xl aspect-video h-[250px] object-cover"
      />

      <CardContent className="p-4">
        <Link
          href={`/courses/${certificate.course.slug}`}
          className="font-medium w-fit text-lg line-clamp-2 group-hover:underline group-hover:text-primary transition-colors duration-300"
        >
          {certificate.course.title}
        </Link>

        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>
            Cấp ngày: {format(new Date(certificate.issuedAt), "dd/MM/yyyy")}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Mã chứng chỉ: <span className="font-mono">{certificate.certificateNumber}</span>
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <Link
            href={`/dashboard/certificates/${certificate.id}`}
            className={buttonVariants({ variant: "default", className: "flex-1" })}
          >
            <ExternalLink className="size-4 mr-2" />
            Xem chi tiết
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
