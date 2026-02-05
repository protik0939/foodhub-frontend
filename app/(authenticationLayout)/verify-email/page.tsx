"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const timer = 5;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const callbackURL = searchParams.get("callbackURL") || "/";

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(timer);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Email verification failed.");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");
      } catch (err: unknown) {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Something went wrong during verification."
        );
      }
    };

    verifyEmail();
  }, [token, callbackURL]);

  useEffect(() => {
    if (status === "loading") return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (countdown <= 0 && status !== "loading") {
      router.replace("/");
    }
  }, [countdown, status, router]);


  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 text-center shadow-sm">
        {status === "loading" && (
          <>
            <div className="mb-4 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h1 className="text-xl font-semibold">
              Verifying your email
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we confirm your email address…
            </p>
          </>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h1 className="text-xl font-semibold">
              Email verified Successfully
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {message}
            </p>
            <p className="mt-3 text-sm">
              Redirecting to homepage in{" "}
              <span className="font-semibold">
                {countdown}
              </span>{" "}
              seconds…
            </p>

            <Button
              className="mt-4 w-full"
              onClick={() => router.replace("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage now
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <h1 className="text-xl font-semibold">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {message}
            </p>
            <p className="mt-3 text-sm">
              Redirecting to homepage in{" "}
              <span className="font-semibold">
                {countdown}
              </span>{" "}
              seconds…
            </p>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.replace("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Homepage
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-6 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Loading...</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait...
            </p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
