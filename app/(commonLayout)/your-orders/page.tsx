"use client";

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { orderClientService } from '@/services/order.client.service';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Order } from '@/types/order.type';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, X } from 'lucide-react';
import ReviewModal from '@/components/modules/review/ReviewModal';

export default function YourOrdersPage() {
  const { data: session, isPending } = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      redirect('/login');
    }
  }, [session, isPending]);

  const fetchOrders = async (userId: string) => {
    try {
      setLoading(true);
      const ordersData = await orderClientService.getOrdersByUserId(userId);
      setOrders(ordersData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders(session.user.id);
    }
  }, [session]);

  const handleReviewClick = (order: Order) => {
    setSelectedOrderForReview(order);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = async () => {
    if (session?.user?.id) {
      await fetchOrders(session.user.id);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrderId(orderId);
      await orderClientService.cancelOrder(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'CANCELLED' }
            : order
        )
      );

      toast.success('Order cancelled successfully');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PREPARING':
        return 'bg-yellow-500';
      case 'READY':
        return 'bg-blue-500';
      case 'DELIVERED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isPending || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">You haven&apos;t placed any orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.meal.name}</CardTitle>
                    <CardDescription>
                      Provider: {order.meal.provider.user.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={order.meal.imageUrl}
                      alt={order.meal.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-medium">{order.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price per item:</span>
                        <span className="text-sm font-medium">${order.meal.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <span className="text-sm font-bold">${(order.meal.price * order.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment:</span>
                        <span className="text-sm">{order.paymentMethod === 'CASHONDELIVERY' ? 'Cash on Delivery' : order.paymentMethod}</span>
                      </div>
                    </div>

                    {order.status === 'PREPARING' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3 w-full sm:w-auto cursor-pointer"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </Button>
                    )}

                    {(order.status === 'READY' || order.status === 'DELIVERED') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full sm:w-auto opacity-50 cursor-not-allowed cursor-pointer"
                              disabled
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel Order
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You can&apos;t cancel the order now, contact the meal provider for help</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {order.status === 'DELIVERED' && (!order.reviews || order.reviews.length === 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full sm:w-auto cursor-pointer"
                        onClick={() => handleReviewClick(order)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Write Review
                      </Button>
                    )}

                    {order.reviews && order.reviews.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium">Your Review:</p>
                        <p className="text-sm text-muted-foreground">Rating: {order.reviews[0].reviewPoint}/5</p>
                        {order.reviews[0].comment && (
                          <p className="text-sm mt-1">{order.reviews[0].comment}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrderForReview && (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          orderId={selectedOrderForReview.id}
          mealName={selectedOrderForReview.meal?.name || ""}
          mealImage={selectedOrderForReview.meal?.imageUrl || ""}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
