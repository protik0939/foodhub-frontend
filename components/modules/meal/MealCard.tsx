"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Store } from "lucide-react";
import Image from "next/image";
import { Meal, ReviewStats } from "@/types/meal.type";
import { mealClientService } from "@/services/meal.client.service";

interface MealCardProps {
    meal: Meal;
    onOrder: (mealId: string) => void;
}

export default function MealCard({ meal, onOrder }: MealCardProps) {
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


    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {meal.category && (
                        <Badge className="absolute top-3 left-3 bg-orange-500">
                            {meal.category.name}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate">{meal.name}</h3>
                <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {meal.description}
                </div>
                {meal.provider && (
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {meal.provider.providerName}
                    </div>
                )}
                {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{reviewStats.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                            ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""})
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-500">
                        ${meal.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">{meal.quantity}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => onOrder(meal.id)}
                >
                    Order Now
                </Button>
            </CardFooter>
        </Card>
    );
}
