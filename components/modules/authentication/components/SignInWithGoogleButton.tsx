"use client"
import { Button } from '@/components/ui/button'
import { authClient } from "@/lib/auth-client"
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type SocialProvider = "google" | "facebook";

export default function SignInWithGoogleButton({
    text,
    provider = "google",
}: Readonly<{
    text: string;
    provider?: SocialProvider;
}>) {
    const [loading, setLoading] = useState(false);

    const handleSocialLogin = async () => {
        if (loading) return;

        setLoading(true);
        const callbackURL = typeof window !== "undefined" ? window.location.origin : "";
        try {
            const { error } = await authClient.signIn.social({
                provider,
                callbackURL,
            });

            if (error) {
                toast.error(error.message || `Unable to continue with ${provider}`);
            }
        } catch {
            toast.error(`Unable to continue with ${provider}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button className="cursor-pointer" variant="outline" type="button" onClick={handleSocialLogin} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {text}
        </Button>
    )
}
