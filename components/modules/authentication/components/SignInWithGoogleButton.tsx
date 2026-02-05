"use client"
import { Button } from '@/components/ui/button'
import { authClient } from "@/lib/auth-client"

export default function SignInWithGoogleButton({ text }: { text: string }) {

    const handleGoogleLogin = async () => {
        const data = authClient.signIn.social({
            provider: "google",
            callbackURL: process.env.PROD_APP_URL,
        });

        console.log(data);
    };

    return (
        <Button className="cursor-pointer" variant="outline" type="button" onClick={() => handleGoogleLogin()}>
            {text}
        </Button>
    )
}
