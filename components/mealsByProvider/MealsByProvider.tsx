"use client";

import { Meal } from '@/types/meal.type'
import MealCard from '@/components/modules/meal/MealCard';
import { useRouter } from 'next/navigation';

interface TMealsInterface {
    readonly mealsData: Meal[],
    readonly providerName?: string;
}

export default function MealsByProvider({mealsData, providerName} : TMealsInterface) {
  const router = useRouter();

  const handleOrder = (mealId: string) => {
    router.push(`/meals/${mealId}`);
  };

  if (mealsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No meals available from this provider.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">
          {providerName ? `${providerName}'s Meals` : 'Provider Meals'}
        </h2>
        <p className="text-muted-foreground">Browse {mealsData.length} delicious meal{mealsData.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mealsData.map((meal) => (
          <MealCard 
            key={meal.id} 
            meal={meal} 
            onOrder={handleOrder}
          />
        ))}
      </div>
    </div>
  );
}
