"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { mealClientService } from "@/services/meal.client.service";
import { Review } from "@/types/meal.type";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const REVIEWS_PER_PAGE = 8;

type RatingFilter = "all" | "positive" | "neutral" | "critical";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, ratingFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await mealClientService.getAllReviews();
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
      month: "short",
      day: "numeric",
    });
  };

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, positive: 0 };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.reviewPoint, 0);
    const average = sum / total;
    const positive = reviews.filter((review) => review.reviewPoint >= 4).length;

    return {
      average: Math.round(average * 10) / 10,
      total,
      positive,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "positive" && review.reviewPoint >= 4) ||
        (ratingFilter === "neutral" && review.reviewPoint === 3) ||
        (ratingFilter === "critical" && review.reviewPoint <= 2);

      if (!matchesRating) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        review.id,
        review.comment || "",
        review.order?.user?.name || "",
        review.order?.user?.email || "",
        review.order?.meal?.name || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [ratingFilter, reviews, search]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
      end = Math.min(totalPages, start + maxVisible - 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <MessageSquare className="h-8 w-8 text-orange-500" />
          All Reviews
        </h1>
      </div>

      {reviews.length > 0 && (
        <Card className="app-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-orange-500">{stats.average.toFixed(1)}</div>
                <div className="mb-2 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(stats.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>

              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-500">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>

              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-green-500">{stats.positive}</div>
                <div className="text-sm text-muted-foreground">Positive Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="app-card">
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              placeholder="Search by customer, meal, comment, or review ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as RatingFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="positive">Positive (4-5)</SelectItem>
                <SelectItem value="neutral">Neutral (3)</SelectItem>
                <SelectItem value="critical">Critical (1-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="py-14 text-center text-muted-foreground">No reviews matched your filters.</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
                              {review.order?.user?.image ? (
                                <Image
                                  src={review.order.user.image}
                                  alt={review.order.user.name || "Customer"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.order?.user?.name || "Anonymous"}</p>
                              <p className="text-xs text-muted-foreground">{review.order?.user?.email || "N/A"}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {review.order?.meal?.imageUrl ? (
                              <div className="relative h-9 w-9 overflow-hidden rounded-md">
                                <Image
                                  src={review.order.meal.imageUrl}
                                  alt={review.order.meal.name || "Meal"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : null}
                            <span className="text-sm font-medium">{review.order?.meal?.name || "Unknown meal"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < review.reviewPoint
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{review.reviewPoint}.0</span>
                          </div>
                        </TableCell>

                        <TableCell className="max-w-[320px]">
                          <p className="truncate text-sm text-muted-foreground">
                            {review.comment?.trim() || "No comment provided"}
                          </p>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages} ({filteredReviews.length} records)
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  {pageNumbers.map((pageNumber) => (
                    <Button
                      key={`review-page-${pageNumber}`}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
