"use client";

import { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealUploadForm from "./MealUploadForm";
import ProviderMealsList from "./ProviderMealsList";
import ProviderOrdersView from "./ProviderOrdersView";
import ProviderReviewsView from "./ProviderReviewsView";

interface ProviderPageProps {
  providerId: string;
}

export default function ProviderPage({ providerId }: ProviderPageProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMealCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Provider Dashboard</h1>
            <MealUploadForm
              providerId={providerId}
              onSuccess={handleMealCreated}
            />
          </div>

          <Tabs defaultValue="meals" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="meals">My Meals</TabsTrigger>
              <TabsTrigger value="orders">Customer Orders</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
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

