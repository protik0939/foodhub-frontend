import MealsByProvider from '@/components/mealsByProvider/MealsByProvider';
import { mealService } from '@/services/meal.service';

type PageProps = {
  params: Promise<{
    providerId: string
  }>
}

export default async function page({ params }: PageProps) {
    const { providerId } = await params;
    const meals = await mealService.getMealsByProviderId(providerId);

    const providerName = meals.length > 0 && meals[0].provider?.providerName
        ? meals[0].provider.providerName
        : undefined;

    return (
        <MealsByProvider 
            mealsData={meals}
            providerName={providerName}
        />
    )
}
