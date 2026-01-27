"use client";

import { Award, Calendar, Download, FileImage, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface CertificateViewProps {
  userName: string;
  userEmail: string;
  courseTitle: string;
  courseLevel: string;
  issuedAt: Date;
  certificateNumber: string;
}

export default function CertificateView({
  userName,
  userEmail,
  courseTitle,
  courseLevel,
  issuedAt,
  certificateNumber,
}: CertificateViewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    if (!certificateRef.current) return;

    setIsExporting(true);
    try {
      // Wait a bit to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Dynamic import html-to-image
      const { toPng } = await import("html-to-image");
      
      const dataUrl = await toPng(certificateRef.current, {
        backgroundColor: "#1e3a8a",
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `certificate-${certificateNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Certificate exported as image!");
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error(`Failed to export image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!certificateRef.current) return;

    setIsExporting(true);
    try {
      // Wait a bit to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Dynamic import html-to-image and jspdf
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const imgData = await toPng(certificateRef.current, {
        backgroundColor: "#1e3a8a",
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true,
      });

      // Create a temporary image to get dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgData;
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`certificate-${certificateNumber}.pdf`);

      toast.success("Certificate exported as PDF!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error(`Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={exportAsImage}
          disabled={isExporting}
          className="gap-2"
        >
          <FileImage className="size-4" />
          Export Image
        </Button>
        <Button
          variant="outline"
          onClick={exportAsPDF}
          disabled={isExporting}
          className="gap-2"
        >
          <FileText className="size-4" />
          Export PDF
        </Button>
      </div>

      {/* Certificate */}
      <div
        ref={certificateRef}
        data-certificate-export
        className="w-full aspect-[16/10] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg overflow-hidden relative shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)",
          minHeight: "600px",
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-4 border-2 border-yellow-400/30 rounded-lg pointer-events-none" />
        <div className="absolute inset-6 border border-yellow-400/20 rounded-lg pointer-events-none" />
        
        {/* Decorative corner elements */}
        <div className="absolute top-6 left-6 size-12 border-l-2 border-t-2 border-yellow-400/40 rounded-tl-lg" />
        <div className="absolute top-6 right-6 size-12 border-r-2 border-t-2 border-yellow-400/40 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 size-12 border-l-2 border-b-2 border-yellow-400/40 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 size-12 border-r-2 border-b-2 border-yellow-400/40 rounded-br-lg" />

        {/* Content */}
        <div className="relative h-full flex flex-col p-12 text-white">
          {/* Main Content - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Award Icon */}
            <div className="mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative size-28 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-4 border-yellow-300 flex items-center justify-center shadow-2xl">
                  <Award className="size-14 text-yellow-50" fill="currentColor" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-6xl font-bold mb-4 text-center tracking-wide drop-shadow-lg">
              Certificate of Completion
            </h1>
            <p className="text-xl text-blue-100 mb-14 text-center font-light">
              This certifies that the following course has been completed
            </p>

            {/* Recipient Info */}
            <div className="text-center mb-10">
              <p className="text-5xl font-bold mb-3 drop-shadow-md">{userName}</p>
              <p className="text-xl text-blue-200 font-light">{userEmail}</p>
            </div>

            {/* Course Info */}
            <div className="text-center mb-12 max-w-4xl">
              <p className="text-xl text-blue-100 mb-4 font-light">has successfully completed the course</p>
              <h2 className="text-4xl font-bold text-blue-200 mb-5 leading-tight drop-shadow-md">
                {courseTitle}
              </h2>
              <Badge
                variant="secondary"
                className="bg-blue-700/60 text-blue-50 border-blue-400/50 px-5 py-2 text-base font-medium shadow-lg"
              >
                {courseLevel}
              </Badge>
            </div>
          </div>

          {/* Footer Section - Date and Certificate Number */}
          <div className="flex flex-col items-center gap-6 pt-8 border-t border-yellow-400/20">
            {/* Date Section */}
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-yellow-400/20">
                <Calendar className="size-6 text-yellow-400" />
              </div>
              <div className="text-left">
                <p className="text-sm text-blue-200 mb-1 font-light">Date Issued</p>
                <p className="text-xl font-bold">
                  {format(new Date(issuedAt), "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="text-center">
              <p className="text-xs text-blue-300/70 mb-1 font-light">Certificate Number</p>
              <p className="text-base font-mono font-bold tracking-wider">{certificateNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
