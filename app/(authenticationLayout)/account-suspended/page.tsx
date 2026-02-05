"use client";

import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { logoutEverywhere } from "@/lib/logout-helper";
import { useRouter } from "next/navigation";
import { AlertCircle, LogOut, Mail, Shield } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AccountSuspended() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const { data: session } = authClient.useSession();

    React.useEffect(() => {
        if (!session?.user) {
            router.push("/");
        }
    }, [session, router]);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logoutEverywhere({
                onAfter: () => router.push("/login"),
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!session?.user) {
        return null;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="relative w-48 h-48 md:w-64 md:h-64">
                            <Image
                                src="/images/account-suspended.svg"
                                fill
                                alt="Account Suspended"
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Shield className="w-6 h-6 text-destructive" />
                            <CardTitle className="text-2xl md:text-3xl font-bold text-destructive">
                                Account Suspended
                            </CardTitle>
                        </div>
                        <CardDescription className="text-base md:text-lg">
                            Your account access has been temporarily restricted
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm md:text-base">
                            Your account has been suspended due to a violation of our terms of
                            service or suspicious activity detected on your account.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4 text-sm md:text-base text-muted-foreground">
                        <p>
                            We understand this may be inconvenient. Your account suspension
                            means you currently cannot:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access your profile and account features</li>
                            <li>Place orders or make transactions</li>
                            <li>Interact with the platform</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 md:p-6 rounded-lg space-y-3">
                        <h3 className="font-semibold text-base md:text-lg flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            What can you do?
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Please contact our support team or administrator to resolve this
                            issue and restore your account access. They will review your case
                            and provide further instructions.
                        </p>
                        <div className="pt-2">
                            <p className="text-sm font-medium">
                                Support Email:{" "}
                                <a
                                    href="mailto:support@foodhub.com"
                                    className="text-primary hover:underline"
                                >
                                    support@foodhub.com
                                </a>
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={handleLogout}
                        disabled={isLoading}
                        size="lg"
                        className="w-full sm:w-auto cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isLoading ? "Logging out..." : "Logout"}
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto cursor-pointer"
                    >
                        <a href="mailto:support@foodhub.com">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Support
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
