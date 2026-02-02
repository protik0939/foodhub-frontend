"use client";

import { useEffect, useState } from "react";
import { mealService } from "@/services/meal.service";
import { Order } from "@/types/meal.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProviderOrdersViewProps {
  providerId: string;
}

const statusColors = {
  PREPARING: "bg-yellow-500",
  READY: "bg-blue-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export default function ProviderOrdersView({
  providerId,
}: ProviderOrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [providerId]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await mealService.getOrdersByProviderId(providerId);
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Orders</CardTitle>
          <CardDescription>View all orders for your meals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No orders received yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Orders</CardTitle>
        <CardDescription>
          Total Orders: {orders.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.meal?.imageUrl && (
                        <img
                          src={order.meal.imageUrl}
                          alt={order.meal.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{order.meal?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.user?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.user?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.user?.userProfile?.contactNo || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {order.user?.userProfile?.address || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${order.meal?.price}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[order.status]}
                      variant="secondary"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
