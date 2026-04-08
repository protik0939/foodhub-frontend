"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meal, Review } from "@/types/meal.type";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Star, Store } from "lucide-react";
import MealCard from "./MealCard";

interface MealDetailsViewProps {
  meal: Meal;
  reviews: Review[];
  relatedMeals: Meal[];
  media: string[];
}

export default function MealDetailsView({
  meal,
  reviews,
  relatedMeals,
  media,
}: Readonly<MealDetailsViewProps>) {
  const [selectedMedia, setSelectedMedia] = useState(0);

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.reviewPoint, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  return (
    <div className="app-shell py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="app-card overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-90 w-full md:h-115">
              <Image
                src={media[selectedMedia] || meal.imageUrl}
                alt={meal.name}
                fill
                className="object-cover"
              />
            </div>
            {media.length > 1 ? (
              <div className="grid grid-cols-4 gap-2 p-3">
                {media.slice(0, 8).map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => setSelectedMedia(index)}
                    className={`relative h-20 overflow-hidden rounded-lg border ${
                      selectedMedia === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <Image src={item} alt={`${meal.name} media ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Badge>{meal.category?.name || "Featured meal"}</Badge>
          <h1 className="text-4xl font-semibold leading-tight">{meal.name}</h1>
          <p className="text-muted-foreground">{meal.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="app-card">
              <CardContent className="space-y-1 p-4 text-sm">
                <p className="text-muted-foreground">Price</p>
                <p className="text-2xl font-semibold text-primary">${meal.price.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardContent className="space-y-1 p-4 text-sm">
                <p className="text-muted-foreground">Average Rating</p>
                <p className="inline-flex items-center gap-1 text-2xl font-semibold">
                  <Star className="size-5 fill-primary text-primary" /> {averageRating || "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Store className="size-4" /> Kitchen: {meal.provider?.providerName || "FoodHub partner"}
            </p>
            <p className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" /> Published: {new Date(meal.createdAt).toLocaleDateString()}
            </p>
            <p className="inline-flex items-center gap-2">
              <Clock3 className="size-4" /> Estimated prep window: 20-35 minutes
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4" /> Delivery based on your saved address
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/meals/${meal.id}/order`}>Order This Meal</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/explore">Back to Explore</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="app-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Description and Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{meal.description}</p>
            <p>
              This meal is prepared by a verified FoodHub kitchen with structured order handling,
              quality checks, and status updates throughout the delivery lifecycle.
            </p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle>Key Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Category: {meal.category?.name || "N/A"}</p>
            <p>Menu quantity label: {meal.quantity}</p>
            <p>Total reviews: {reviews.length}</p>
            <p>Provider contact: {meal.provider?.providerEmail || "Available after checkout"}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="section-heading mb-4">Reviews and Ratings</h2>
        {reviews.length === 0 ? (
          <Card className="app-card">
            <CardContent className="p-8 text-muted-foreground">
              No public reviews yet for this meal.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 6).map((review) => (
              <Card key={review.id} className="app-card">
                <CardContent className="space-y-2 p-5">
                  <p className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="size-4 fill-primary text-primary" /> {review.reviewPoint.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">{review.comment || "Customer rated this meal."}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Related Meals</h2>
          <Button asChild variant="ghost">
            <Link href="/explore">View all</Link>
          </Button>
        </div>

        {relatedMeals.length === 0 ? (
          <Card className="app-card">
            <CardContent className="p-8 text-muted-foreground">No related meals available right now.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {relatedMeals.slice(0, 8).map((item) => (
              <MealCard key={item.id} meal={item} onOrder={() => undefined} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
