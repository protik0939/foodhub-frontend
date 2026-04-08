import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mealService } from "@/services/meal.service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const meals = await mealService.getAllMeals().catch(() => []);
  const latest = meals.slice(0, 6);

  return (
    <div className="app-shell py-10">
      <Badge className="mb-4">FoodHub Blog</Badge>
      <h1 className="text-4xl font-semibold">Product and platform updates</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Discover featured meals, provider highlights, and product improvements shipped by the FoodHub team.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {latest.map((meal) => (
          <Card key={meal.id} className="app-card">
            <CardHeader>
              <CardTitle className="line-clamp-2 text-xl">{meal.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="line-clamp-3">{meal.description}</p>
              <p>Category: {meal.category?.name || "General"}</p>
              <p>Published: {new Date(meal.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
