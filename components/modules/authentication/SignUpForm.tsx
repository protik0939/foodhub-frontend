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
import { Eye, EyeOff, Home, Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email(),
    password: z.string().min(8, "Minimum length is 8"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export function SignUpForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Creating account...");

      try {
        const { error } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        });

        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        toast.success("Account created successfully!", { id: toastId });
        router.push("/login");
      } catch {
        toast.error("Something went wrong.", { id: toastId });
      }
    },
  });

  const isLoading = form.state.isSubmitting;

  return (
    <Card {...props}>
      <CardHeader>
        <div className="flex justify-center py-4">
          <NavLogo />
        </div>
        <CardTitle className="text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your details below
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="signup-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {(["name", "email"] as const).map((name) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field>
                    <FieldLabel>{name === "name" ? "Name" : "Email"}</FieldLabel>
                    <Input
                      type={name === "email" ? "email" : "text"}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            ))}

            {(["password", "confirmPassword"] as const).map((name) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field>
                    <FieldLabel>
                      {name === "password" ? "Password" : "Confirm Password"}
                    </FieldLabel>
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
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            ))}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          form="signup-form"
          type="submit"
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>

        <SignInWithGoogleButton
          text="Sign Up With Google"
        />

        <FieldDescription className="text-center">
          Already have an account? <Link href="/login">Log in</Link>
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
