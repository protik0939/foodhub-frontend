"use client"
import { Button } from '@/components/ui/button'
import { authClient } from "@/lib/auth-client"

export default function SignInWithGoogleButton({ text }: { text: string }) {

    const handleGoogleLogin = async () => {
        const fallbackUrl =
            process.env.NEXT_PUBLIC_PROD_APP_URL ||
            process.env.APP_URL
        const callbackURL =
            typeof window === "undefined" ? fallbackUrl : window.location.origin;

        const data = authClient.signIn.social({
            provider: "google",
            callbackURL,
        });

        console.log(data);
    };

    return (
        <Button className="cursor-pointer" variant="outline" type="button" onClick={() => handleGoogleLogin()}>
            {text}
        </Button>
    )
}
