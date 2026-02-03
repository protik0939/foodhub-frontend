import CategoriesPage from '@/components/modules/CategoriesPage/CategoriesPage'
import { mealService } from '@/services/meal.service';

export default async function page() {

    const categories = await mealService.getAllCategories();
    console.log(categories);

    return (
        <CategoriesPage categories={categories}/>
    )
}
