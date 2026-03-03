"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  saveLessonNoteAction,
  addLessonBookmarkAction,
  deleteLessonBookmarkAction,
  searchLessonNotesInCourseAction,
} from "../actions";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BookMarked,
  StickyNote,
  Search,
  Plus,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";
import type { LessonNoteType } from "@/app/data/course/get-lesson-notes";
import type { LessonBookmarkType } from "@/app/data/course/get-lesson-bookmarks";
import type { SearchLessonNoteItem } from "@/app/data/course/search-lesson-notes";
import type { VideoPlayerHandle } from "./video-player";

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface LessonNotesBookmarksProps {
  lessonId: string;
  slug: string;
  courseSlug: string;
  initialNote: LessonNoteType;
  initialBookmarks: LessonBookmarkType[];
  videoRef: React.RefObject<VideoPlayerHandle | null>;
}

export function LessonNotesBookmarks({
  lessonId,
  slug,
  courseSlug,
  initialNote,
  initialBookmarks,
  videoRef,
}: LessonNotesBookmarksProps) {
  const router = useRouter();
  const [noteContent, setNoteContent] = useState(initialNote?.content ?? "");
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [saveNotePending, setSaveNotePending] = useState(false);
  const [addBookmarkPending, setAddBookmarkPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchLessonNoteItem[] | null>(null);
  const [searchPending, setSearchPending] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSaveNote = useCallback(async () => {
    setSaveNotePending(true);
    const { data, error } = await tryCatch(saveLessonNoteAction(lessonId, noteContent, slug));
    setSaveNotePending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.status === "success") {
      toast.success(data.message);
    }
  }, [lessonId, noteContent, slug]);

  const handleAddBookmark = useCallback(async () => {
    const currentTime = videoRef.current?.getCurrentTime?.() ?? 0;
    if (currentTime <= 0) {
      toast.info("Phát video để thêm bookmark tại thời điểm hiện tại.");
      return;
    }
    setAddBookmarkPending(true);
    const { data, error } = await tryCatch(
      addLessonBookmarkAction(lessonId, currentTime, null, slug)
    );
    setAddBookmarkPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.status === "success") {
      toast.success(data.message);
      router.refresh();
    }
  }, [lessonId, slug, videoRef]);

  const handleDeleteBookmark = useCallback(
    async (bookmarkId: string) => {
      const { data, error } = await tryCatch(
        deleteLessonBookmarkAction(bookmarkId, slug, lessonId)
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data?.status === "success") {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
        toast.success(data.message);
        router.refresh();
      }
    },
    [lessonId, slug]
  );

  const handleSeekTo = useCallback(
    (timestamp: number) => {
      videoRef.current?.seek?.(timestamp);
    },
    [videoRef]
  );

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }
      setSearchPending(true);
      const result = await searchLessonNotesInCourseAction(courseSlug, query);
      setSearchPending(false);
      if (result.status === "success") {
        setSearchResults(result.items);
      } else {
        toast.error(result.message);
        setSearchResults(null);
      }
    },
    [courseSlug]
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <Tabs defaultValue="notes" className="w-full">
        <div className="border-b px-3 pt-3">
          <TabsList className="w-full justify-start gap-1">
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="size-4" />
              Ghi chú
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-2">
              <BookMarked className="size-4" />
              Bookmarks
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="notes" className="mt-0 p-3">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm trong ghi chú khóa học..."
                value={searchQuery}
                onChange={onSearchInputChange}
                className="pl-9"
              />
              {searchPending && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchResults !== null && searchQuery.trim() && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border bg-muted/50 p-2">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không tìm thấy ghi chú.</p>
                ) : (
                  searchResults.map((item) => {
                    const courseSlug = item.lesson.chapter.course?.slug;
                    const href = courseSlug
                      ? `/dashboard/${courseSlug}/${item.lesson.id}`
                      : "#";
                    return (
                      <a
                        key={item.id}
                        href={href}
                        className="block rounded p-2 text-left text-sm hover:bg-muted"
                      >
                        <span className="font-medium">{item.lesson.title}</span>
                        <p className="line-clamp-2 text-muted-foreground">
                          {item.content.slice(0, 120)}
                          {item.content.length > 120 ? "…" : ""}
                        </p>
                      </a>
                    );
                  })
                )}
              </div>
            )}
            <Textarea
              placeholder="Ghi chú của bạn cho bài học này..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
              className="resize-y min-h-[120px]"
            />
            <Button
              onClick={handleSaveNote}
              disabled={saveNotePending}
              size="sm"
              className="w-full sm:w-auto"
            >
              {saveNotePending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Lưu ghi chú"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-0 p-3">
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddBookmark}
              disabled={addBookmarkPending}
              className="w-full gap-2"
            >
              {addBookmarkPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Thêm bookmark tại thời điểm hiện tại
            </Button>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có bookmark. Phát video và bấm &quot;Thêm bookmark tại thời điểm hiện tại&quot;.
              </p>
            ) : (
              <ul className="space-y-2">
                {bookmarks.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 p-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleSeekTo(b.timestamp)}
                      className="flex flex-1 items-center gap-2 text-left hover:opacity-80"
                    >
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-mono text-sm">{formatTime(b.timestamp)}</span>
                      {b.label && (
                        <span className="truncate text-sm text-muted-foreground">{b.label}</span>
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteBookmark(b.id)}
                      aria-label="Xóa bookmark"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
