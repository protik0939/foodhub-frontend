"use client";

import { useEffect, useState } from "react";
import { mealClientService } from "@/services/meal.client.service";
import { Review } from "@/types/meal.type";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare, User } from "lucide-react";
import Image from "next/image";

interface ProviderReviewsViewProps {
  providerId: string;
}

export default function ProviderReviewsView({ providerId }: ProviderReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [providerId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await mealClientService.getReviewsByProviderId(providerId);
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateStats = () => {
    if (reviews.length === 0) return { average: 0, total: 0 };
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.reviewPoint, 0);
    const average = sum / total;
    return { average: Math.round(average * 10) / 10, total };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          Customer Reviews
        </h2>
      </div>

      {reviews.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {stats.average.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(stats.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.total} review{stats.total !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">
            Reviews from customers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold shrink-0">
                    {review.order?.user?.image ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={review.order.user.image}
                          alt={review.order.user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {review.order?.user?.name || "Anonymous"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.reviewPoint
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 font-semibold text-sm">
                          {review.reviewPoint}.0
                        </span>
                      </div>
                    </div>

                    {review.order?.meal && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="relative w-10 h-10 rounded overflow-hidden">
                          <Image
                            src={review.order.meal.imageUrl}
                            alt={review.order.meal.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {review.order.meal.name}
                        </span>
                      </div>
                    )}

                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
