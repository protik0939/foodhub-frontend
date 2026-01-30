"use client";

import NavLogo from "@/components/NavLogo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import * as z from "zod";
import SignInWithGoogleButton from "./components/SignInWithGoogleButton";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Home } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Minimum length is 8"),
});

export function LoginForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Logging in...");

      try {
        const { error } = await authClient.signIn.email(value);

        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        toast.success("Logged in successfully!", { id: toastId });
        router.push("/");
      } catch {
        toast.error("Something went wrong.", { id: toastId });
      }
    },
  });

  const isLoading = form.state.isSubmitting;

  return (
    <Card {...props}>
      <CardHeader>
        <div className="flex justify-center pb-4">
          <NavLogo />
        </div>
        <CardTitle className="text-center">Login to your account</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password below
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-2.5 text-muted-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          form="login-form"
          type="submit"
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>

        <SignInWithGoogleButton
          text="Log In With Google"
        />

        <FieldDescription className="text-center">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </FieldDescription>
      </CardFooter>

      <div className="flex justify-center mt-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <Home size={16} />
            Go to Homepage
          </Button>
        </Link>
      </div>
    </Card>
  );
}
