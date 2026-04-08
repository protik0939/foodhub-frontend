"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, ShoppingCart, Store, Users, UtensilsCrossed } from "lucide-react";

interface RecentOrder {
  id: string | number;
  meal: {
    name: string;
    price: number;
  };
  user: {
    name: string;
  };
  status: string;
}

interface DashboardStats {
  stats: {
    totalCustomers: number;
    totalProviders: number;
    totalOrders: number;
    totalMeals: number;
    totalCategories: number;
  };
  recentOrders: RecentOrder[];
  ordersByStatus: Array<{ status: string; count: number }>;
}

const RECENT_ORDERS_PER_PAGE = 5;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentQuery, setRecentQuery] = useState("");
  const [recentPage, setRecentPage] = useState(1);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard/stats`, {
          credentials: "include",
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const filteredRecentOrders = useMemo(() => {
    const rows = stats?.recentOrders || [];
    const query = recentQuery.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter(
      (order) =>
        String(order.id).toLowerCase().includes(query) ||
        order.meal.name.toLowerCase().includes(query) ||
        order.user.name.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query),
    );
  }, [recentQuery, stats?.recentOrders]);

  const recentTotalPages = Math.max(
    1,
    Math.ceil(filteredRecentOrders.length / RECENT_ORDERS_PER_PAGE),
  );

  const paginatedRecentOrders = filteredRecentOrders.slice(
    (recentPage - 1) * RECENT_ORDERS_PER_PAGE,
    recentPage * RECENT_ORDERS_PER_PAGE,
  );

  const chartMax = Math.max(
    1,
    ...(stats?.ordersByStatus.map((entry) => entry.count) || [1]),
  );

  const recentPageNumbers = useMemo(() => {
    const maxVisible = 5;

    if (recentTotalPages <= maxVisible) {
      return Array.from({ length: recentTotalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, recentPage - half);
    let end = Math.min(recentTotalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
      end = Math.min(recentTotalPages, start + maxVisible - 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [recentPage, recentTotalPages]);

  const statusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "DELIVERED") {
      return "default";
    }

    if (status === "CANCELLED") {
      return "destructive";
    }

    if (status === "READY") {
      return "secondary";
    }

    return "outline";
  };

  if (loading) {
    return <div className="p-2 text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of FoodHub platform activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.totalCustomers || 0}</div>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.totalProviders || 0}</div>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.totalMeals || 0}</div>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats.totalCategories || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle>Dynamic Status Chart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats?.ordersByStatus || []).map((item) => (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.status}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(8, Math.round((item.count / chartMax) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.ordersByStatus || []).map((item) => (
              <div
                key={`badge-${item.status}`}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                <span className="text-sm font-semibold">{item.count} orders</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="app-card">
        <CardHeader>
          <CardTitle>Recent Orders Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Filter by order id, customer, meal, or status"
            value={recentQuery}
            onChange={(event) => {
              setRecentQuery(event.target.value);
              setRecentPage(1);
            }}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{String(order.id).slice(0, 8)}...</TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>{order.meal.name}</TableCell>
                  <TableCell>${order.meal.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              Page {recentPage} of {recentTotalPages} ({filteredRecentOrders.length} records)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={recentPage === 1}
                onClick={() => setRecentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              {recentPageNumbers.map((pageNumber) => (
                <Button
                  key={`recent-order-page-${pageNumber}`}
                  variant={pageNumber === recentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={recentPage === recentTotalPages}
                onClick={() => setRecentPage((prev) => Math.min(recentTotalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
