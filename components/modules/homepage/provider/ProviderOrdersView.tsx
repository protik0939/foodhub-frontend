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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, MapPin, Phone, Mail, User, Package, DollarSign, CreditCard, Wallet } from "lucide-react";

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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [providerId]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await mealService.getOrdersByProviderId(providerId);
      setOrders(data);
      console.log(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await mealService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated!!");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
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
    <>
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
                  <TableHead>Price</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell className="font-medium">
                      ${order.meal?.price}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {order.paymentMethod === "CASHONDELIVERY" ? (
                          <>
                            <Wallet className="w-3 h-3" />
                            COD
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3 h-3" />
                            Online
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={statusColors[order.status]}
                        variant="secondary"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          size="sm"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-32.5 cursor-pointer">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem className="cursor-pointer" value="PREPARING">Preparing</SelectItem>
                            <SelectItem className="cursor-pointer" value="READY">Ready</SelectItem>
                            <SelectItem className="cursor-pointer" value="DELIVERED">Delivered</SelectItem>
                            <SelectItem className="cursor-pointer" value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-137.5">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Order ID</div>
                  <div className="font-mono text-sm font-medium">{selectedOrder.id}</div>
                </div>
                <Badge className={statusColors[selectedOrder.status]} variant="secondary">
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Meal Information</Label>
                  <div className="flex gap-3 p-3 border rounded-lg">
                    {selectedOrder.meal?.imageUrl && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={selectedOrder.meal.imageUrl}
                          alt={selectedOrder.meal.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{selectedOrder.meal?.name}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium text-orange-500">${selectedOrder.meal?.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span>Qty: {selectedOrder.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Customer Information</Label>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2">
                      <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div className="font-medium">{selectedOrder.user?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-medium">{selectedOrder.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Contact</div>
                        <div className="font-medium">{selectedOrder.user?.userProfile?.contactNo || "N/A"}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Delivery Address</div>
                        <div className="font-medium">{selectedOrder.user?.userProfile?.address || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Payment Information</Label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {selectedOrder.paymentMethod === "CASHONDELIVERY" ? (
                      <>
                        <Wallet className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-xs text-muted-foreground">Customer will pay upon delivery</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-xs text-muted-foreground">Payment processed online</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-2 border-orange-200 dark:border-orange-900">
                  <div className="font-semibold">Total Amount</div>
                  <div className="text-2xl font-bold text-orange-600">${selectedOrder.meal ? selectedOrder.meal.price * selectedOrder.quantity : 0}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
