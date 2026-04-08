import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "How do I update my delivery address?",
    a: "Open your profile page, update address and contact number, then save. Orders use the latest saved profile details.",
  },
  {
    q: "Why was my order cancellation denied?",
    a: "Orders can be canceled while they are in PREPARING status. Once READY or DELIVERED, cancellation is disabled.",
  },
  {
    q: "How do providers manage meals?",
    a: "Provider users can access dashboard controls to add meals, adjust order statuses, and review customer feedback.",
  },
  {
    q: "How do I contact support?",
    a: "Email support@foodhub.app or use the contact page form. Include your order ID for faster issue resolution.",
  },
];

export default function Page() {
  return (
    <div className="app-shell py-10">
      <Badge className="mb-4">Help Center</Badge>
      <h1 className="text-4xl font-semibold">Support resources</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Find quick answers for ordering, account setup, provider operations, and common delivery questions.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.q} className="app-card">
            <CardHeader>
              <CardTitle className="text-lg">{faq.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{faq.a}</CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
