"use client";

import {
  RenderEmptyState,
  RenderErrorState,
  RenderSuccessState,
} from "@/components/file-uploader/render-state";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl: string;
  fileType: "image" | "video";
}

const Uploader = () => {
  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: null,
    uploading: false,
    progress: 0,
    key: undefined,
    isDeleting: false,
    error: false,
    objectUrl: "",
    fileType: "image",
  });

  const uploadFile = async (file: File) => {
    setFileState((prev) => ({
      ...prev,
      uploading: true,
      progress: 0,
    }));

    try {
      const presignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });

      if (!presignedResponse.ok) {
        toast.error("Failed to get presigned URL");
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));

        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;

            setFileState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              uploading: false,
              progress: 100,
              key,
            }));
            toast.success("File uploaded successfully");
            resolve();
          } else {
            reject(new Error("Failed to upload file"));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Failed to upload file"));
          toast.error("Failed to upload file");
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
      setFileState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: true,
      }));
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }

        setFileState({
          file,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          id: uuidv4(),
          isDeleting: false,
          fileType: file.type.includes("image") ? "image" : "video",
        });

        uploadFile(file);
      }
    },
    [fileState.objectUrl]
  );

  const handleRemoveFile = async () => {
    if (fileState.isDeleting || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const res = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: fileState.key }),
      });

      if (!res.ok) {
        toast.error("Failed to delete file");
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));
        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      setFileState(() => ({
        file: null,
        uploading: false,
        progress: 0,
        objectUrl: "",
        error: false,
        fileType: "image",
        id: null,
        isDeleting: false,
      }));

      toast.success("File deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete file");
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  };

  const rejectedFiles = (fileRejections: FileRejection[]) => {
    if (fileRejections.length) {
      const tooManyFiles = fileRejections.find(
        (rejection) => rejection.errors[0].code === "too_many_files"
      );

      const fileTooLarge = fileRejections.find(
        (rejection) => rejection.errors[0].code === "file_too_large"
      );

      const isImage = fileRejections.find(
        (rejection) => rejection.errors[0].code === "file-invalid-type"
      );

      if (isImage) {
        toast.error("Only images are allowed");
      }

      if (fileTooLarge) {
        toast.error("File is too large, max size is 5MB");
      }

      if (tooManyFiles) {
        toast.error("You can only upload one file at a time");
      }
    }
  };

  const renderContent = () => {
    if (fileState.uploading) {
      return (
        <AnimatedCircularProgressBar
          value={fileState.progress}
          gaugePrimaryColor="var(--primary)"
          gaugeSecondaryColor="var(--primary/20)"
        />
      );
    }

    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.objectUrl) {
      return (
        <RenderSuccessState
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleting}
          handleRemoveFile={handleRemoveFile}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  };

  useEffect(() => {
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 1024 * 1024 * 5, // 5MB
    onDropRejected: rejectedFiles,
    disabled: fileState.uploading || !!fileState.objectUrl,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-300 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default Uploader;
