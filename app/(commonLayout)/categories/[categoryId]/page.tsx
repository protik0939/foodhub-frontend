import { mealService } from '@/services/meal.service';
import React from 'react';
import MealByCategory from '@/components/mealsByCategory/MealByCategory';

type PageProps = {
    params: Promise<{
        categoryId: string
    }>
}


export default async function page({ params }: PageProps) {

    const { categoryId } = await params;
    const meals = await mealService.getMealsByCategory(categoryId);

    const categoryName = meals.length > 0 && meals[0].category?.name
        ? meals[0].category.name
        : undefined;

    return (
        <MealByCategory
            mealsData={meals}
            categoryName={categoryName}
        />
    )
}
