import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, ShieldCheck, Truck } from "lucide-react";

export default function Page() {
  return (
    <div className="app-shell py-10">
      <Badge className="mb-4">About FoodHub</Badge>
      <h1 className="text-4xl font-semibold">Built for reliable local food commerce</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        FoodHub connects customers, local kitchens, and admins in one dependable platform.
        We focus on transparent ordering, quality verification, and clear communication from
        checkout to delivery.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <ChefHat className="size-5 text-primary" /> Kitchen-first model
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Provider profiles include business information, meal listings, and service performance.
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <Truck className="size-5 text-secondary" /> Operational clarity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Orders move through clear status transitions so customers always understand fulfillment progress.
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-accent" /> Trust and quality
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Review workflows, role-based controls, and account moderation maintain marketplace quality.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
