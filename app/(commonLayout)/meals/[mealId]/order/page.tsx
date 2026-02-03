"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { mealClientService } from "@/services/meal.client.service";
import { Meal } from "@/types/meal.type";
import { UserProfile } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { userProfileService } from "@/services/user.client.service";
import Image from "next/image";
import { MapPin, Phone, Store, Wallet, CreditCard, Minus, Plus, ArrowLeft } from "lucide-react";

export default function OrderMealPage() {
  const params = useParams();
  const router = useRouter();
  const mealId = params.mealId as string;
  const [meal, setMeal] = useState<Meal | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"CASHONDELIVERY" | "OTHERS">("CASHONDELIVERY");
  const [ordering, setOrdering] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [session, mealId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const foundMeal = await mealClientService.getMealById(mealId);
      
      if (!foundMeal) {
        toast.error("Meal not found");
        router.push("/");
        return;
      }
      
      setMeal(foundMeal);

      if (session?.user?.id) {
        const profile = await userProfileService.getUserProfile(session.user.id);
        setUserProfile(profile);

        if (!profile?.address || !profile?.contactNo) {
          toast.error("Please complete your profile first");
          router.push("/profile");
        }
      }
    } catch {
      toast.error("Failed to load meal details");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = () => {
    setOrderQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setOrderQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleConfirmOrder = async () => {
    if (!meal || !session?.user) return;

    setOrdering(true);
    try {
      const orderData = {
        mealId: meal.id,
        userId: session.user.id,
        paymentMethod,
        quantity: orderQuantity
      };
      await mealClientService.createOrder(orderData);
      toast.success("Order placed successfully!");
      router.push("/your-orders");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!meal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold mb-6">Confirm Your Order</h1>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={meal.imageUrl}
                    alt={meal.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{meal.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {meal.description}
                  </p>
                  {meal.provider && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Store className="w-3 h-3" />
                      {meal.provider.providerName}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Order Quantity</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={orderQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="w-16 h-10 flex items-center justify-center border rounded-md">
                      <span className="text-lg font-semibold">{orderQuantity}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price per item</span>
                    <span className="font-medium">${meal.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{orderQuantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-orange-500">
                        ${(meal.price * orderQuantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Delivery Information</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-muted-foreground">{userProfile?.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Contact</div>
                      <div className="text-muted-foreground">{userProfile?.contactNo}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "CASHONDELIVERY" | "OTHERS")}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="CASHONDELIVERY" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 flex-1 cursor-pointer">
                      <Wallet className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
                      </div>
                    </Label>
                  </div>
                  <div className="relative flex items-center space-x-3 p-3 border rounded-lg opacity-50 cursor-not-allowed">
                    <RadioGroupItem value="OTHERS" id="others" disabled />
                    <Label htmlFor="others" className="flex items-center gap-2 flex-1">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-xs text-muted-foreground">Credit/Debit Card, Digital Wallets</div>
                      </div>
                    </Label>
                    <Badge variant="secondary" className="absolute right-3 top-3">Coming Soon</Badge>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={ordering}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  disabled={ordering}
                  className="bg-orange-500 hover:bg-orange-600 flex-1"
                >
                  {ordering ? "Placing Order..." : "Confirm Order"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
