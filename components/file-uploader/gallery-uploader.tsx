"use client";

import {
  RenderEmptyState,
  RenderErrorState,
  RenderSuccessState,
} from "@/components/file-uploader/render-state";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface GalleryItemState {
  id: string;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl: string;
  fileType: "image" | "video";
}

interface GalleryUploaderProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  fileTypeAccepted?: "image" | "video";
  maxFiles?: number;
}

interface SortableGalleryItemProps {
  item: GalleryItemState;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const SortableGalleryItem = ({
  item,
  index,
  onRemove,
  disabled,
}: SortableGalleryItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group border rounded-lg overflow-hidden bg-card transition-all duration-200 w-full",
        isDragging && "z-50 scale-95 shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="absolute top-2 left-2 z-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled || item.uploading || item.isDeleting}
          className={cn(
            "p-1 rounded bg-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing",
            "hover:bg-background transition-colors",
            (disabled || item.uploading || item.isDeleting) &&
            "cursor-not-allowed opacity-50"
          )}
        >
          <GripVerticalIcon className="size-4 text-muted-foreground" />
        </button>
      </div>

      {item.uploading ? (
        <div className="aspect-video flex items-center justify-center bg-muted">
          <AnimatedCircularProgressBar
            value={item.progress}
            gaugePrimaryColor="var(--primary)"
            gaugeSecondaryColor="var(--primary/20)"
          />
        </div>
      ) : item.error ? (
        <div className="aspect-video flex items-center justify-center bg-destructive/10">
          <RenderErrorState />
        </div>
      ) : item.objectUrl ? (
        <div className="relative aspect-video">
          <RenderSuccessState
            previewUrl={item.objectUrl}
            isDeleting={item.isDeleting}
            handleRemoveFile={() => onRemove(item.id)}
            fileType={item.fileType}
          />
        </div>
      ) : null}
    </div>
  );
};

const GalleryUploader = ({
  value = [],
  onChange,
  disabled,
  fileTypeAccepted = "image",
  maxFiles = 10,
}: GalleryUploaderProps) => {
  const [items, setItems] = useState<GalleryItemState[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to construct URL from key
  const getFileUrl = (key: string) => {
    if (!key) return "";
    return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGE}.t3.storage.dev/${key}`;
  };

  // Initialize items from value prop (only once on mount)
  useEffect(() => {
    if (!isInitialized && value && value.length > 0) {
      const initialItems: GalleryItemState[] = value.map((key) => {
        const url = getFileUrl(key);
        return {
          id: uuidv4(),
          file: null,
          uploading: false,
          progress: 0,
          key,
          isDeleting: false,
          error: false,
          objectUrl: url,
          fileType: fileTypeAccepted,
        };
      });
      setItems(initialItems);
      setIsInitialized(true);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized, value, fileTypeAccepted]);

  // Update onChange when items change
  useEffect(() => {
    const keys = items
      .filter((item) => item.key && !item.uploading && !item.error)
      .map((item) => item.key!)
      .filter(Boolean);

    if (JSON.stringify(keys) !== JSON.stringify(value)) {
      onChange?.(keys);
    }
  }, [items, onChange, value]);

  const uploadFile = useCallback(
    async (file: File, itemId: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, uploading: true, progress: 0 } : item
        )
      );

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
            isImage: fileTypeAccepted === "image",
          }),
        });

        if (!presignedResponse.ok) {
          toast.error("Failed to get presigned URL");
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, uploading: false, progress: 0, error: true }
                : item
            )
          );
          return;
        }

        const { presignedUrl, key } = await presignedResponse.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageCompleted = (event.loaded / event.total) * 100;
              setItems((prev) =>
                prev.map((item) =>
                  item.id === itemId
                    ? { ...item, progress: Math.round(percentageCompleted) }
                    : item
                )
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 204) {
              setItems((prev) =>
                prev.map((item) =>
                  item.id === itemId
                    ? {
                      ...item,
                      uploading: false,
                      progress: 100,
                      key,
                      error: false,
                    }
                    : item
                )
              );
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
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, uploading: false, progress: 0, error: true }
              : item
          )
        );
      }
    },
    [fileTypeAccepted]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const remainingSlots = maxFiles - items.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      if (filesToAdd.length < acceptedFiles.length) {
        toast.warning(
          `Only ${remainingSlots} file(s) can be added. Maximum ${maxFiles} files allowed.`
        );
      }

      const newItems: GalleryItemState[] = filesToAdd.map((file) => {
        const id = uuidv4();
        const objectUrl = URL.createObjectURL(file);
        return {
          id,
          file,
          uploading: false,
          progress: 0,
          objectUrl,
          error: false,
          isDeleting: false,
          fileType: fileTypeAccepted,
        };
      });

      setItems((prev) => [...prev, ...newItems]);

      // Upload files
      newItems.forEach((item) => {
        if (item.file) {
          uploadFile(item.file, item.id);
        }
      });
    },
    [items.length, maxFiles, uploadFile, fileTypeAccepted]
  );

  const handleRemoveFile = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.isDeleting) return;

    try {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isDeleting: true } : i))
      );

      if (item.key) {
        const res = await fetch("/api/s3/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: item.key }),
        });

        if (!res.ok) {
          toast.error("Failed to delete file");
          setItems((prev) =>
            prev.map((i) =>
              i.id === id ? { ...i, isDeleting: false, error: true } : i
            )
          );
          return;
        }
      }

      // Clean up object URL
      if (item.objectUrl && !item.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(item.objectUrl);
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete file");
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, isDeleting: false, error: true } : i
        )
      );
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

      const invalidType = fileRejections.find(
        (rejection) => rejection.errors[0].code === "file-invalid-type"
      );

      if (invalidType) {
        toast.error(
          `Only ${fileTypeAccepted === "image" ? "images" : "videos"
          } are allowed`
        );
      }

      if (fileTooLarge) {
        toast.error(
          `File is too large, max size is ${fileTypeAccepted === "image" ? "5MB" : "1GB"
          }`
        );
      }

      if (tooManyFiles) {
        toast.error("Too many files selected");
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : null;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      fileTypeAccepted === "image" ? { "image/*": [] } : { "video/*": [] },
    maxFiles: maxFiles - items.length,
    multiple: true,
    maxSize:
      fileTypeAccepted === "image" ? 1024 * 1024 * 5 : 1024 * 1024 * 1000,
    onDropRejected: rejectedFiles,
    disabled: disabled || items.length >= maxFiles,
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.objectUrl && !item.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(item.objectUrl);
        }
      });
    };
  }, []);

  const canAddMore = items.length < maxFiles;

  // If no items, show empty state
  if (items.length === 0) {
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
          <RenderEmptyState isDragActive={isDragActive} />
        </CardContent>
      </Card>
    );
  }

  // If has items, show grid with sortable items and add more button
  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {items.map((item, index) => (
              <SortableGalleryItem
                key={item.id}
                item={item}
                index={index}
                onRemove={handleRemoveFile}
                disabled={disabled}
              />
            ))}

            {canAddMore && (
              <div
                {...getRootProps()}
                className={cn(
                  "relative border-2 border-dashed rounded-lg transition-colors duration-300 ease-in-out aspect-video cursor-pointer w-full bg-card",
                  isDragActive
                    ? "border-primary bg-primary/10 border-solid"
                    : "border-border hover:border-primary"
                )}
              >
                <div className="flex items-center justify-center h-full w-full p-4">
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-muted mb-4">
                      <PlusIcon
                        className={cn(
                          "size-6 text-muted-foreground",
                          isDragActive && "text-primary"
                        )}
                      />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {isDragActive ? "Drop files here" : "Add more"}
                    </p>
                  </div>
                  <input {...getInputProps()} />
                </div>
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="relative border rounded-lg overflow-hidden bg-card shadow-2xl ring-2 ring-primary scale-105 aspect-video w-48 rotate-2">
              <div className="absolute top-2 left-2 z-10">
                <div className="p-1 rounded bg-background/80 backdrop-blur-sm">
                  <GripVerticalIcon className="size-4 text-muted-foreground" />
                </div>
              </div>
              {activeItem.objectUrl && (
                <div className="relative aspect-video">
                  <RenderSuccessState
                    previewUrl={activeItem.objectUrl}
                    isDeleting={false}
                    handleRemoveFile={() => { }}
                    fileType={activeItem.fileType}
                  />
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!canAddMore && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum {maxFiles} files reached
        </p>
      )}
    </div>
  );
};

export default GalleryUploader;


