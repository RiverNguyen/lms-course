import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

export const RenderEmptyState = ({
  isDragActive,
}: {
  isDragActive: boolean;
}) => {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary"
          )}
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        Kéo thả tệp vào đây hoặc{" "}
        <span className="text-primary font-medium cursor-pointer">
          nhấp để tải lên
        </span>
      </p>
      <Button type="button" className="mt-4">
        Chọn tệp
      </Button>
    </div>
  );
};

export const RenderErrorState = () => {
  return (
    <div className="text-center">
      <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
        <ImageIcon className="size-6 text-destructive" />
      </div>
      <p className="text-base font-semibold">Tải lên thất bại</p>
      <p className="text-xs text-muted-foreground mt-1">
        Đã xảy ra lỗi khi tải lên tệp của bạn. Vui lòng thử lại.
      </p>
      <Button type="button" className="mt-4">
        Chọn lại tệp
      </Button>
    </div>
  );
};

export const RenderSuccessState = ({
  previewUrl,
  isDeleting,
  handleRemoveFile,
  fileType,
}: {
  previewUrl: string;
  isDeleting: boolean;
  handleRemoveFile: () => void;
  fileType: "image" | "video";
}) => {
  return (
    <div className="relative group w-full h-full flex items-center justify-center">
      {fileType === "video" ? (
        <video src={previewUrl} controls className="rounded-md w-full h-full" />
      ) : (
        <Image
          src={previewUrl}
          alt="Tệp đã tải lên"
          fill
          className="object-contain p-2"
        />
      )}
      <Button
        variant="destructive"
        size="icon"
        type="button"
        className={cn("absolute top-4 right-4")}
        onClick={handleRemoveFile}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
      </Button>
    </div>
  );
};
