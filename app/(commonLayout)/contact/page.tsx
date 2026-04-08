"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.subject.trim()) {
      nextErrors.subject = "Subject is required.";
    }
    if (!form.message.trim() || form.message.trim().length < 20) {
      nextErrors.message = "Message must be at least 20 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);

    setForm({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setSuccessMessage(
      "Message sent successfully. Our support team will reach you at your email address.",
    );
  };

  return (
    <div className="app-shell py-10">
      <Badge className="mb-4">Contact</Badge>
      <h1 className="text-4xl font-semibold">Talk to the FoodHub team</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        For account issues, provider onboarding questions, or order support, send us a message and we will respond quickly.
      </p>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle>Reach us directly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Email: support@foodhub.app</p>
            <p>Phone: +1 (800) 555-0147</p>
            <p>Operations: Mon-Sat, 8:00 AM - 10:00 PM</p>
            <p>Address: 17 City Market Street, San Francisco, CA</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit} noValidate>
              <div>
                <Input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
                {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email}</p> : null}
              </div>

              <div>
                <Input
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                />
                {errors.subject ? <p className="mt-1 text-xs text-destructive">{errors.subject}</p> : null}
              </div>

              <div>
                <Textarea
                  rows={5}
                  placeholder="Describe your issue or request"
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                />
                {errors.message ? <p className="mt-1 text-xs text-destructive">{errors.message}</p> : null}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>

              {successMessage ? (
                <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
                  {successMessage}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
