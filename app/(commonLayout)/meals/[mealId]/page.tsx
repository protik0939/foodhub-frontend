import MealDetailsView from "@/components/modules/meal/MealDetailsView";
import { mealService } from "@/services/meal.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    mealId: string;
  }>;
};

export default async function Page({ params }: Readonly<PageProps>) {
  const { mealId } = await params;

  const meal = await mealService.getMealById(mealId).catch(() => null);

  if (!meal) {
    notFound();
  }

  const [reviews, relatedMeals] = await Promise.all([
    mealService.getReviewsByMealId(mealId).catch(() => []),
    mealService.getMealsByCategory(meal.categoryId).catch(() => []),
  ]);

  const media = [
    meal.imageUrl,
    ...reviews
      .map((review) => review.imageUrl)
      .filter((item): item is string => Boolean(item && item.length > 0)),
  ].filter((value, index, array) => array.indexOf(value) === index);

  return (
    <MealDetailsView
      meal={meal}
      reviews={reviews}
      relatedMeals={relatedMeals.filter((relatedMeal) => relatedMeal.id !== meal.id)}
      media={media}
    />
  );
}
