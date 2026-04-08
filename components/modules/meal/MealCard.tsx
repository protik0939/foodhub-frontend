"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Star, Store } from "lucide-react";
import Image from "next/image";
import { Meal, ReviewStats } from "@/types/meal.type";
import { mealClientService } from "@/services/meal.client.service";
import Link from "next/link";

interface MealCardProps {
    meal: Meal;
    onOrder: (mealId: string) => void;
}

export default function MealCard({ meal }: MealCardProps) {
    const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
    useEffect(() => {
        const loadReviewStats = async () => {
            try {
                const stats = await mealClientService.getReviewStats(meal.id);
                setReviewStats(stats);
            } catch (error) {
                console.error("Failed to load review stats:", error);
            }
        };
        loadReviewStats();
    }, [meal.id]);


    const publishedDate = new Date(meal.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <Card className="app-card group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative h-44 w-full overflow-hidden">
                    <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {meal.category && (
                        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                            {meal.category.name}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex min-h-58 flex-col p-4">
                <h3 className="mb-2 min-h-12 line-clamp-2 text-lg font-bold leading-snug">{meal.name}</h3>
                <div className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {meal.description}
                </div>

                <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        <span>{publishedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        <span className="line-clamp-1">{meal.provider?.providerName || "FoodHub Partner Kitchen"}</span>
                    </div>
                </div>

                {meal.provider && (
                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Store className="w-3 h-3" />
                        {meal.provider.providerName}
                    </div>
                )}
                {reviewStats && reviewStats.totalReviews > 0 ? (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{reviewStats.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                            ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""})
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground mb-2">No reviews yet</div>
                )}

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                        ${meal.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">{meal.quantity}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/meals/${meal.id}`} className="w-full">
                    <Button className="w-full">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
