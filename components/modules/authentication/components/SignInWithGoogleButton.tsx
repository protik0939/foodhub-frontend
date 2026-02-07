"use client"
import { Button } from '@/components/ui/button'
import { authClient } from "@/lib/auth-client"

export default function SignInWithGoogleButton({ text }: { text: string }) {

    const handleGoogleLogin = async () => {

        const callbackURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

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
