import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <div className="app-shell py-10">
      <Badge className="mb-4">Privacy</Badge>
      <h1 className="text-4xl font-semibold">Privacy and data handling</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        FoodHub stores account, order, and profile data required for platform operations. We do not sell personal
        data, and we use role-based access controls to protect sensitive workflows.
      </p>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle>What we collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Account identity details such as name and email.</p>
            <p>Order history, payment method selection, and delivery profile information.</p>
            <p>Provider and meal data required for marketplace operations.</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle>How we protect data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Session-based authentication and role-specific route protection.</p>
            <p>Server-managed business logic for orders, reviews, and moderation.</p>
            <p>Operational logging and account status controls for abuse prevention.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
