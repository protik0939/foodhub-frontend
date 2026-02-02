"use client";

import React, { useState, useRef, useEffect } from "react";
import { SessionResponse, ProviderProfile as ProviderProfileType } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Home, Edit, Save, X, Upload, Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface ProviderProfileProps {
    session: SessionResponse;
    profile: ProviderProfileType | null;
}

export default function ProviderProfile({ session, profile }: ProviderProfileProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        providerName: profile?.providerName || "",
        providerEmail: profile?.providerEmail || "",
        providerContact: profile?.providerContact || "",
        providerAddress: profile?.providerAddress || "",
        ownerName: profile?.ownerName || "",
        ownerEmail: profile?.ownerEmail || "",
    });
    const [profileImage, setProfileImage] = useState(session.user.image || "/images/dummy-avatar.jpg");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProviderData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/profile/providers/${session.user.id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    toast.error("Something Went Wrong! Try again Reloading!");
                    return;
                }

                const data = await response.json();

                setFormData({
                    providerName: data.providerName || "",
                    providerEmail: data.providerEmail || "",
                    providerContact: data.providerContact || "",
                    providerAddress: data.providerAddress || "",
                    ownerName: data.ownerName || "",
                    ownerEmail: data.ownerEmail || "",
                });

            } catch (error) {
                console.error("Error fetching provider data:", error);
                toast.error("Error! Please try again.");
            }
            setIsLoading(false);
        };

        fetchProviderData();
    }, [session.user.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/profile/providers/${session.user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(formData),
                }
            );
            if (!updateResponse.ok) {
                console.error("Failed to update Data");
                toast.error("Sommething Went Wrong! Please try again.");
            } else {
                toast.success("Profile updated successfully!");
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed! Please try again.");
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        setFormData({
            providerName: profile?.providerName || "",
            providerEmail: profile?.providerEmail || "",
            providerContact: profile?.providerContact || "",
            providerAddress: profile?.providerAddress || "",
            ownerName: profile?.ownerName || "",
            ownerEmail: profile?.ownerEmail || "",
        });
        setProfileImage(session.user.image || "");
        setIsEditing(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setIsUploading(true);
        const formDataImg = new FormData();
        formDataImg.append("image", file);

        try {
            const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";
            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
                { method: "POST", body: formDataImg }
            );
            const data = await response.json();

            if (data.success) {
                const imageUrl = data.data.url;
                setProfileImage(imageUrl);
                console.log(session.user.id);
                try {
                    const updateResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/profile/providers/${session.user.id}/image`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({ image: imageUrl }),
                        }
                    );

                    if (!updateResponse.ok) {
                        toast.error("Please try again.");
                    } else {
                        toast.success("Profile picture updated successfully!");
                    }
                } catch (error) {
                    console.error("Error updating database:", error);
                    toast.error("Try again Reloading!");
                }
            } else {
                toast.error("Failed!Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error! Please try again.");
        }
        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="flex items-center gap-2 mb-6">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-9 w-9 cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/")}
                    className="h-9 w-9 cursor-pointer"
                >
                    <Home className="h-4 w-4" />
                </Button>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-2xl font-bold">Provider Profile</CardTitle>
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} size="sm" className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={handleSave} size="sm" disabled={isSaving} className=" cursor-pointer">
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                                <Button onClick={handleCancel} size="sm" variant="outline" disabled={isSaving} className=" cursor-pointer">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-3 text-muted-foreground">Loading profile data...</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center gap-4 pb-6 border-b">
                                    <div className="relative">
                                        <Image src={profileImage} alt={session.user.name} height={100} width={100} objectFit="contain" className="rounded-full w-20 h-20" />
                                        {isEditing && (
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute bottom-0 right-0 h-10 w-10 rounded-full"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Camera className="h-5 w-5" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {isEditing && (
                                        <div className="flex gap-2 flex-wrap justify-center">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="cursor-pointer"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {isUploading ? "Uploading..." : "Upload Photo"}
                                            </Button>
                                            {profileImage && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setProfileImage("")}
                                                    disabled={isUploading}
                                                    className="cursor-pointer"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Account Name</Label>
                                            <Input value={session.user.name} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account Email</Label>
                                            <Input value={session.user.email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Input value={session.user.role} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account Status</Label>
                                            <Input value={session.user.accountStatus} disabled />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="providerName">Provider/Business Name</Label>
                                            <Input
                                                id="providerName"
                                                name="providerName"
                                                value={formData.providerName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter business name"
                                                type="text"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="providerEmail">Business Email</Label>
                                            <Input
                                                id="providerEmail"
                                                name="providerEmail"
                                                value={formData.providerEmail}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter business email"
                                                type="email"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="providerContact">Business Contact</Label>
                                            <Input
                                                id="providerContact"
                                                name="providerContact"
                                                value={formData.providerContact}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter business contact"
                                                type="number"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="providerAddress">Business Address</Label>
                                            <Input
                                                id="providerAddress"
                                                name="providerAddress"
                                                value={formData.providerAddress}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter business address"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ownerName">Owner Name</Label>
                                            <Input
                                                id="ownerName"
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter owner name"
                                                type="text"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ownerEmail">Owner Email</Label>
                                            <Input
                                                id="ownerEmail"
                                                name="ownerEmail"
                                                value={formData.ownerEmail}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Enter owner email"
                                                type="email"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
