import NavLogo from "@/components/NavLogo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import SignInWithGoogleButton from "./components/SignInWithGoogleButton"

export function SignUpForm({ ...props }: React.ComponentProps<typeof Card>) {


  return (
    <Card {...props}>
      <CardHeader>
        <div className="flex items-center justify-center w-full">
          <div className="py-4">
            <NavLogo />
          </div>
        </div>
        <CardTitle className="text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <SignInWithGoogleButton text={"Sign Up With Google"}/>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Log in</Link>
                </FieldDescription>
                <div className="flex justify-center items-center mt-12">
                  <Link href={"/"}>
                    <Button className="cursor-pointer">Go to Homepage</Button>
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
