"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { mealService } from "@/services/meal.service";
import { Category, Meal, Order } from "@/types/meal.type";
import { UserProfile } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Search, ShoppingCart, Clock, CheckCircle, XCircle, Package, MapPin, Phone, Store, TrendingUp, Sparkles, CreditCard, Wallet, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { userProfileService } from "@/services/user.client.service";

export default function CustomerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [orderingMealId, setOrderingMealId] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASHONDELIVERY" | "OTHERS">("CASHONDELIVERY");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    loadInitialData();
  }, [session]);

  useEffect(() => {
    filterMeals();
  }, [selectedCategory, searchTerm, meals]);


  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, mealsData] = await Promise.all([
        mealService.getAllCategories(),
        mealService.getAllMeals(),
      ]);
      setCategories(categoriesData);
      setMeals(mealsData);
      setFilteredMeals(mealsData);

      if (session?.user?.id) {
        const profile = await userProfileService.getUserProfile(session.user.id);
        setUserProfile(profile);
        loadOrders(session.user.id);
      }
    } catch {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const loadOrders = async (userId: string) => {
    try {
      setOrdersLoading(true);
      const ordersData = await mealService.getOrdersByUserId(userId);
      setOrders(ordersData);
    } catch {
      console.log("No Orders.");
    }
    setOrdersLoading(false);
  };

  const filterMeals = () => {
    let filtered = meals;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((meal) => meal.categoryId === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (meal) =>
          meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMeals(filtered);
  };

  const handleOrder = (mealId: string) => {
    if (!session?.user) {
      toast.error("Please login to order");
      return;
    }

    if (!userProfile?.address || !userProfile?.contactNo) {
      setShowProfileAlert(true);
      return;
    }

    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      setSelectedMeal(meal);
      setOrderQuantity(1);
      setShowOrderModal(true);
    }
  };

  const confirmOrder = async () => {
    if (!selectedMeal || !session?.user) return;

    setOrderingMealId(selectedMeal.id);
    try {
      const orderData = { 
        mealId: selectedMeal.id, 
        userId: session.user.id,
        paymentMethod,
        quantity: orderQuantity
      };
      await mealService.createOrder(orderData);
      toast.success("Order placed successfully!");
      loadOrders(session.user.id);
      setShowOrderModal(false);
      setSelectedMeal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setOrderingMealId(null);
    }
  };

  const incrementQuantity = () => {
    setOrderQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setOrderQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const getRecentMeals = () => {
    return [...meals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  };

  const getProviders = () => {
    const providerMap = new Map();
    meals.forEach((meal) => {
      if (meal.provider && !providerMap.has(meal.providerId)) {
        providerMap.set(meal.providerId, meal.provider);
      }
    });
    return Array.from(providerMap.values()).slice(0, 6);
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "PREPARING":
        return <Clock className="w-4 h-4" />;
      case "READY":
        return <Package className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "bg-yellow-500";
      case "READY":
        return "bg-blue-500";
      case "DELIVERED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentMeals = getRecentMeals();
  const providers = getProviders();

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="relative bg-[#EC8A33] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Delicious Food, Delivered Fast
            </h1>
            <div className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Order from the best local restaurants and get your favorite meals delivered to your doorstep
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white text-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {session?.user && orders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Your Orders</h2>
            </div>
            {ordersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {order.meal?.imageUrl && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={order.meal.imageUrl}
                              alt={order.meal.name || "Meal"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{order.meal?.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            ${order.meal?.price.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${getOrderStatusColor(order.status)} text-white flex items-center gap-1`}>
                              {getOrderStatusIcon(order.status)}
                              <span className="text-xs">{order.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl md:text-3xl font-bold">Browse by Category</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </section>

        {recentMeals.length > 0 && selectedCategory === "all" && !searchTerm && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Recently Added</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMeals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {meal.category && (
                        <Badge className="absolute top-3 left-3 bg-orange-500">
                          {meal.category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 truncate">{meal.name}</h3>
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {meal.description}
                    </div>
                    {meal.provider && (
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {meal.provider.providerName}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-500">
                        ${meal.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">{meal.quantity}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleOrder(meal.id)}
                      disabled={orderingMealId === meal.id}
                    >
                      {orderingMealId === meal.id ? "Ordering..." : "Order Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {providers.length > 0 && selectedCategory === "all" && !searchTerm && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl md:text-3xl font-bold">Popular Restaurants</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold">
                        {provider.providerName?.charAt(0) || "R"}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">{provider.providerName}</div>
                        <div className="text-sm text-muted-foreground">{provider.providerEmail}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl md:text-3xl font-bold">
              {selectedCategory !== "all"
                ? categories.find(c => c.id === selectedCategory)?.name
                : searchTerm
                  ? `Search Results for "${searchTerm}"`
                  : "All Dishes"}
            </h2>
          </div>
          {filteredMeals.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No dishes found</h3>
              <div className="text-muted-foreground">
                Try adjusting your search or filter to find what you&apos;re looking for
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMeals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {meal.category && (
                        <Badge className="absolute top-3 left-3 bg-orange-500">
                          {meal.category.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 truncate">{meal.name}</h3>
                    <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {meal.description}
                    </div>
                    {meal.provider && (
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {meal.provider.providerName}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-500">
                        ${meal.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">{meal.quantity}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleOrder(meal.id)}
                      disabled={orderingMealId === meal.id}
                    >
                      {orderingMealId === meal.id ? "Ordering..." : "Order Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <AlertDialog open={showProfileAlert} onOpenChange={setShowProfileAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Complete Your Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>To place an order, please complete your profile with:</div>
              <div className="list-disc list-inside space-y-1 ml-2">
                {!userProfile?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </div>
                )}
                {!userProfile?.contactNo && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Number
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/profile")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Go to Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Your Order</DialogTitle>
            <DialogDescription>
              Review your order details before confirming
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeal && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={selectedMeal.imageUrl}
                    alt={selectedMeal.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{selectedMeal.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedMeal.description}
                  </p>
                  {selectedMeal.provider && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Store className="w-3 h-3" />
                      {selectedMeal.provider.providerName}
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
                    <span className="font-medium">${selectedMeal.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{orderQuantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-orange-500">
                        ${(selectedMeal.price * orderQuantity).toFixed(2)}
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
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowOrderModal(false)}
              disabled={orderingMealId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmOrder}
              disabled={orderingMealId !== null}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {orderingMealId ? "Placing Order..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
