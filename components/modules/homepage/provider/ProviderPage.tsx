"use client";

import { useEffect, useMemo, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealUploadForm from "./MealUploadForm";
import ProviderMealsList from "./ProviderMealsList";
import ProviderOrdersView from "./ProviderOrdersView";
import ProviderReviewsView from "./ProviderReviewsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mealClientService } from "@/services/meal.client.service";
import { CalendarClock, ClipboardList, Star, UtensilsCrossed } from "lucide-react";

interface ProviderPageProps {
  providerId: string;
}

interface ProviderSummary {
  mealCount: number;
  orderCount: number;
  activeOrderCount: number;
  reviewCount: number;
  averageRating: number;
}

export default function ProviderPage({ providerId }: ProviderPageProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("meals");
  const [summary, setSummary] = useState<ProviderSummary>({
    mealCount: 0,
    orderCount: 0,
    activeOrderCount: 0,
    reviewCount: 0,
    averageRating: 0,
  });

  const handleMealCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [meals, orders, reviews] = await Promise.all([
          mealClientService.getMealsByProviderId(providerId),
          mealClientService.getOrdersByProviderId(providerId),
          mealClientService.getReviewsByProviderId(providerId),
        ]);

        const activeOrderCount = orders.filter(
          (order) => order.status === "PREPARING" || order.status === "READY",
        ).length;
        const reviewCount = reviews.length;
        const ratingTotal = reviews.reduce((sum, review) => sum + review.reviewPoint, 0);

        setSummary({
          mealCount: meals.length,
          orderCount: orders.length,
          activeOrderCount,
          reviewCount,
          averageRating: reviewCount ? ratingTotal / reviewCount : 0,
        });
      } catch {
        // The tab sections still load independently even if summary fetch fails.
      }
    };

    loadSummary();
  }, [providerId, refreshTrigger]);

  const statCards = useMemo(
    () => [
      {
        label: "Live Meals",
        value: summary.mealCount,
        icon: UtensilsCrossed,
        accent: "text-emerald-600",
      },
      {
        label: "Total Orders",
        value: summary.orderCount,
        icon: ClipboardList,
        accent: "text-sky-600",
      },
      {
        label: "In Progress",
        value: summary.activeOrderCount,
        icon: CalendarClock,
        accent: "text-amber-600",
      },
      {
        label: "Avg Rating",
        value: summary.reviewCount ? summary.averageRating.toFixed(1) : "0.0",
        icon: Star,
        accent: "text-rose-600",
      },
    ],
    [summary],
  );

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <Card className="overflow-hidden border-none bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-100 shadow-xl">
            <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit border border-white/30 bg-white/10 text-slate-100 hover:bg-white/10">
                    Provider Workspace
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tight">Welcome back to your kitchen control hub</h1>
                  <p className="max-w-2xl text-sm text-slate-300">
                    Manage your menu, process orders faster, and keep customer satisfaction high from one place.
                  </p>
                </div>
                <MealUploadForm providerId={providerId} onSuccess={handleMealCreated} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.label} className="app-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.accent}`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-3">
              <TabsTrigger
                value="meals"
                className="h-auto justify-start rounded-xl border border-border/70 bg-card px-4 py-3 text-left data-[state=active]:border-emerald-300 data-[state=active]:bg-emerald-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">My Meals</span>
                  <span className="text-xs text-muted-foreground">Create and manage your menu</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="h-auto justify-start rounded-xl border border-border/70 bg-card px-4 py-3 text-left data-[state=active]:border-sky-300 data-[state=active]:bg-sky-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Customer Orders</span>
                  <span className="text-xs text-muted-foreground">Track incoming and active orders</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="h-auto justify-start rounded-xl border border-border/70 bg-card px-4 py-3 text-left data-[state=active]:border-rose-300 data-[state=active]:bg-rose-50"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Reviews</span>
                  <span className="text-xs text-muted-foreground">Read customer feedback and ratings</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meals" className="mt-6">
              <ProviderMealsList
                providerId={providerId}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <ProviderOrdersView providerId={providerId} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ProviderReviewsView providerId={providerId} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

