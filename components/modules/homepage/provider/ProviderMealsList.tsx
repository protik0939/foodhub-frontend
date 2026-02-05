"use client";

import { useEffect, useState } from "react";
import { mealClientService } from "@/services/meal.client.service";
import { Meal, ReviewStats } from "@/types/meal.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Edit, Trash2, Star } from "lucide-react";
import MealEditDialog from "./MealEditDialog";
import Image from "next/image";

interface ProviderMealsListProps {
  providerId: string;
  refreshTrigger: number;
}

interface MealWithStats extends Meal {
  reviewStats?: ReviewStats;
}

export default function ProviderMealsList({
  providerId,
  refreshTrigger,
}: ProviderMealsListProps) {
  const [meals, setMeals] = useState<MealWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, [providerId, refreshTrigger]);

  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const data = await mealClientService.getMealsByProviderId(providerId);
      const mealsWithStats = await Promise.all(
        data.map(async (meal) => {
          try {
            const stats = await mealClientService.getReviewStats(meal.id);
            return { ...meal, reviewStats: stats };
          } catch {
            return meal;
          }
        })
      );
      setMeals(mealsWithStats);
    } catch (error) {
      toast.error("Failed to fetch meals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    setIsDeleting(true);
    try {
      await mealClientService.deleteMeal(mealId);
      toast.success("Meal deleted successfully");
      setDeletingMealId(null);
      fetchMeals();
    } catch (error) {
      toast.error("Failed to delete meal");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            No meals uploaded yet. Click &quot;Add New Meal&quot; to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <Card key={meal.id} className="overflow-hidden">
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={meal.imageUrl}
                alt={meal.name}
                height={200}
                width={200}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{meal.name}</CardTitle>
                <Badge variant="secondary">${meal.price}</Badge>
              </div>
              {meal.category && (
                <Badge variant="outline" className="w-fit">
                  {meal.category.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {meal.description}
              </p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{meal.quantity}</span>
              </div>
              {meal.reviewStats && meal.reviewStats.totalReviews > 0 ? (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">
                    {meal.reviewStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({meal.reviewStats.totalReviews} review{meal.reviewStats.totalReviews !== 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">No Reviews Yet</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingMeal(meal)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeletingMealId(meal.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingMeal && (
        <MealEditDialog
          meal={editingMeal}
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          onSuccess={fetchMeals}
        />
      )}

      <AlertDialog open={!!deletingMealId} onOpenChange={() => setDeletingMealId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meal from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMealId && handleDelete(deletingMealId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
