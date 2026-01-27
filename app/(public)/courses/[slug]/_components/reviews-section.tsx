"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  getUserReviewForCourse,
} from "../actions";
import { CourseReviewsType } from "@/app/data/course/get-course-reviews";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewsSectionProps {
  courseId: string;
  reviewsData: CourseReviewsType;
  userReview: Awaited<ReturnType<typeof getUserReviewForCourse>> | null;
  isEnrolled: boolean;
}

const StarRating = ({
  rating,
  onRatingChange,
  interactive = false,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRatingChange?.(star)}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            } ${interactive ? "hover:fill-yellow-300 hover:text-yellow-300" : ""}`}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewsSection = ({
  courseId,
  reviewsData,
  userReview: initialUserReview,
  isEnrolled,
}: ReviewsSectionProps) => {
  const [rating, setRating] = useState(initialUserReview?.rating || 0);
  const [comment, setComment] = useState(initialUserReview?.comment || "");
  const [isEditing, setIsEditing] = useState(!!initialUserReview);
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviews, setReviews] = useState(reviewsData.reviews);
  const [userReview, setUserReview] = useState(initialUserReview);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    startTransition(async () => {
      if (userReview) {
        // Update existing review
        const { data: response, error } = await tryCatch(
          updateReviewAction(userReview.id, rating, comment)
        );

        if (error) {
          toast.error(error.message);
          return;
        }

        if (response?.status === "success") {
          toast.success(response.message);
          setIsEditing(false);
          // Update local state
          const updatedReview = {
            ...userReview,
            rating,
            comment: comment || null,
            updatedAt: new Date(),
            createdAt: userReview.createdAt,
            user: reviews.find((r) => r.id === userReview.id)?.user || {
              id: "",
              name: "",
              image: null,
            },
          };
          setUserReview(updatedReview);
          setReviews(
            reviews.map((r) => (r.id === userReview.id ? updatedReview : r))
          );
        }
      } else {
        // Create new review
        const { data: response, error } = await tryCatch(
          createReviewAction(courseId, rating, comment)
        );

        if (error) {
          toast.error(error.message);
          return;
        }

        if (response?.status === "success") {
          toast.success(response.message);
          setIsEditing(false);
          // Reload page to show new review with updated stats
          window.location.reload();
        }
      }
    });
  };

  const handleDelete = () => {
    if (!userReview) return;

    startTransition(async () => {
      const { data: response, error } = await tryCatch(
        deleteReviewAction(userReview.id)
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      if (response?.status === "success") {
        toast.success(response.message);
        setUserReview(null);
        setReviews(reviews.filter((r) => r.id !== userReview.id));
        setRating(0);
        setComment("");
        setIsEditing(false);
        setShowDeleteDialog(false);
      }
    });
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight">
          Reviews & Ratings
        </h2>

        {/* Rating Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{reviewsData.averageRating.toFixed(1)}</div>
                <StarRating rating={Math.round(reviewsData.averageRating)} />
                <p className="text-sm text-muted-foreground mt-2">
                  {reviewsData.totalReviews} review
                  {reviewsData.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewsData.ratingCounts[star as keyof typeof reviewsData.ratingCounts];
                  const percentage =
                    reviewsData.totalReviews > 0
                      ? (count / reviewsData.totalReviews) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm">{star}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Review Form */}
        {isEnrolled && (
          <Card>
            <CardHeader>
              <CardTitle>
                {userReview ? "Edit Your Review" : "Write a Review"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rating *
                </label>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  interactive
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Comment
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this course..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || rating === 0}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {userReview ? "Updating..." : "Submitting..."}
                    </>
                  ) : userReview ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </Button>
                {userReview && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setRating(userReview.rating);
                        setComment(userReview.comment || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews yet. Be the first to review this course!
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src={review.user.image || undefined}
                        alt={review.user.name}
                      />
                      <AvatarFallback>
                        {review.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{review.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                            })}
                            {review.updatedAt &&
                              review.updatedAt !== review.createdAt &&
                              " (edited)"}
                          </p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
