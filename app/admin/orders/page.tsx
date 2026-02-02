"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SearchBar } from "@/components/admin/search-bar";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Trash2 } from "lucide-react";

interface Order {
  id: string;
  status: string;
  quantity: number;
  paymentMethod: string;
  user: {
    id: string;
    name: string;
    email: string;
    userProfile: {
      contactNo: string | null;
      address: string | null;
    } | null;
  };
  meal: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    provider: {
      providerName: string | null;
    };
  };
  _count: {
    reviews: number;
  };
}

interface PaginatedResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/orders?${params}`);
      const data: PaginatedResponse = await response.json();
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/orders/${selectedOrder.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOrders();
        setShowDeleteDialog(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PREPARING":
        return "secondary";
      case "READY":
        return "default";
      case "DELIVERED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by customer, meal, or provider..."
          />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
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
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.meal.name}</TableCell>
                      <TableCell>{order.meal.provider.providerName || "N/A"}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${(order.meal.price * order.quantity).toFixed(2)}</TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PREPARING">PREPARING</SelectItem>
                            <SelectItem value="READY">READY</SelectItem>
                            <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              />
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
