"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mealClientService } from "@/services/meal.client.service";
import { Review, ReviewStats } from "@/types/meal.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import ReviewList from "@/components/modules/review/ReviewList";

export default function MealReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const mealId = params.mealId as string;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [mealId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        mealClientService.getReviewsByMealId(mealId),
        mealClientService.getReviewStats(mealId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-orange-500" />
            Customer Reviews
          </h1>

          {stats && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-500 mb-2">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(stats.averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
