"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";
import { authClient } from "@/lib/auth-client";
import { logoutEverywhere } from "@/lib/logout-helper";
import { orderClientService } from "@/services/order.client.service";
import { mealClientService } from "@/services/meal.client.service";
import { Meal, Review } from "@/types/meal.type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChartNoAxesCombined,
  ChefHat,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Settings,
  Star,
  Store,
  Users,
} from "lucide-react";

type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

type DashboardOrder = {
  id: string;
  status: string;
  quantity: number;
  paymentMethod: string;
  meal?: { name?: string };
  user?: { name?: string };
};

type DashboardStats = {
  totalCustomers: number;
  totalProviders: number;
  totalOrders: number;
  totalMeals: number;
  totalCategories: number;
};

interface RoleDashboardProps {
  role: Role;
  userId: string;
  userName: string;
}

interface DashboardData {
  orders: DashboardOrder[];
  meals: Meal[];
  reviews: Review[];
  adminStats: DashboardStats | null;
}

const ITEMS_PER_PAGE = 8;

const MENU = {
  CUSTOMER: [
    { key: "overview", title: "Overview", icon: LayoutDashboard },
    { key: "orders", title: "Orders", icon: ListOrdered },
    { key: "profile", title: "Profile", icon: Settings },
  ],
  PROVIDER: [
    { key: "overview", title: "Overview", icon: LayoutDashboard },
    { key: "orders", title: "Orders", icon: ListOrdered },
    { key: "meals", title: "Meals", icon: ChefHat },
    { key: "reviews", title: "Reviews", icon: Star },
    { key: "profile", title: "Profile", icon: Settings },
  ],
  ADMIN: [
    { key: "overview", title: "Overview", icon: LayoutDashboard },
    { key: "orders", title: "Orders", icon: ListOrdered },
    { key: "users", title: "Users", icon: Users },
    { key: "meals", title: "Meals", icon: ChefHat },
    { key: "providers", title: "Providers", icon: Store },
    { key: "profile", title: "Profile", icon: Settings },
  ],
};

async function fetchDashboardData(role: Role, userId: string): Promise<DashboardData> {
  if (role === "CUSTOMER") {
    const orders = await orderClientService.getOrdersByUserId(userId);
    return { orders, meals: [], reviews: [], adminStats: null };
  }

  if (role === "PROVIDER") {
    const [meals, orders, reviews] = await Promise.all([
      mealClientService.getMealsByProviderId(userId),
      mealClientService.getOrdersByProviderId(userId),
      mealClientService.getReviewsByProviderId(userId),
    ]);

    return { orders, meals, reviews, adminStats: null };
  }

  const [statsResponse, ordersResponse, allMeals] = await Promise.all([
    fetch(`/api/admin/dashboard/stats`, { credentials: "include" }).then((res) => res.json()),
    fetch(`/api/admin/orders?page=1&limit=50`, { credentials: "include" }).then((res) =>
      res.json(),
    ),
    mealClientService.getAllMeals(),
  ]);

  return {
    orders: ordersResponse.data || [],
    meals: allMeals || [],
    reviews: [],
    adminStats: statsResponse.stats || null,
  };
}

function OverviewPanel({
  role,
  orders,
  meals,
  reviews,
  adminStats,
}: Readonly<{
  role: Role;
  orders: DashboardOrder[];
  meals: Meal[];
  reviews: Review[];
  adminStats: DashboardStats | null;
}>) {
  const statusRows = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      map.set(order.status, (map.get(order.status) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Orders" value={orders.length} />
        <MetricCard label="Meals" value={role === "CUSTOMER" ? "-" : meals.length} />
        <MetricCard label="Reviews" value={role === "PROVIDER" ? reviews.length : "-"} />
        <MetricCard
          label="Platform Meals"
          value={role === "ADMIN" ? adminStats?.totalMeals || 0 : meals.length || 0}
        />
      </div>

      <Card className="app-card">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ChartNoAxesCombined className="size-5 text-primary" /> Order status chart
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {statusRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No chart data yet.</p>
          ) : (
            statusRows.map(([status, count]) => {
              const width = Math.max(8, Math.round((count / orders.length) * 100));
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersPanel({ orders }: Readonly<{ orders: DashboardOrder[] }>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const nextQuery = query.trim().toLowerCase();
    if (!nextQuery) {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.meal?.name?.toLowerCase().includes(nextQuery) ||
        order.status.toLowerCase().includes(nextQuery) ||
        order.user?.name?.toLowerCase().includes(nextQuery),
    );
  }, [orders, query]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Orders table</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Filter by meal, customer, or status"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />

        <div className="overflow-auto">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Order</th>
                <th className="py-2">Meal</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-2">{order.id.slice(0, 8)}...</td>
                  <td className="py-2">{order.meal?.name || "N/A"}</td>
                  <td className="py-2">{order.quantity}</td>
                  <td className="py-2">
                    <Badge variant="outline">{order.status}</Badge>
                  </td>
                  <td className="py-2">{order.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
              Previous
            </Button>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersPanel({ adminStats }: Readonly<{ adminStats: DashboardStats | null }>) {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Users summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <MetricBlock label="Customers" value={adminStats?.totalCustomers || 0} />
        <MetricBlock label="Providers" value={adminStats?.totalProviders || 0} />
      </CardContent>
    </Card>
  );
}

function MealsPanel({ meals, role }: Readonly<{ meals: Meal[]; role: Role }>) {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>{role === "ADMIN" ? "Platform meals" : "Your meals"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {meals.slice(0, 8).map((meal) => (
          <div key={meal.id} className="flex items-center justify-between border-b py-2">
            <p>{meal.name}</p>
            <p className="font-medium">${meal.price.toFixed(2)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReviewsPanel({ reviews }: Readonly<{ reviews: Review[] }>) {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Latest reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {reviews.slice(0, 8).map((review) => (
          <div key={review.id} className="border-b py-2">
            <p className="font-medium">Rating: {review.reviewPoint.toFixed(1)}</p>
            <p className="text-muted-foreground">{review.comment || "No comment provided."}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProfilePanel() {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Profile management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Profile details are editable from your dedicated profile page, including personal
          information, contact data, and role-specific fields.
        </p>
        <Button asChild>
          <Link href="/profile">Go to editable profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ProvidersPanel() {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Provider operations</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Provider management is available in the dedicated admin sections. Use this overview to
        monitor account activity and move to detailed moderation pages when needed.
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <Card className="app-card">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricBlock({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function RoleDashboard({ role, userId, userName }: Readonly<RoleDashboardProps>) {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);

  const menuItems = MENU[role];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardData(role, userId);
        setOrders(data.orders);
        setMeals(data.meals);
        setReviews(data.reviews);
        setAdminStats(data.adminStats);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [role, userId]);

  const handleLogout = async () => {
    await logoutEverywhere({
      onAfter: () => router.push("/login"),
    });
  };

  const panelByTab: Record<string, React.ReactNode> = {
    overview: (
      <OverviewPanel
        role={role}
        orders={orders}
        meals={meals}
        reviews={reviews}
        adminStats={adminStats}
      />
    ),
    orders: <OrdersPanel orders={orders} />,
    users: role === "ADMIN" ? <UsersPanel adminStats={adminStats} /> : null,
    meals: <MealsPanel meals={meals} role={role} />,
    providers: role === "ADMIN" ? <ProvidersPanel /> : null,
    reviews: role === "PROVIDER" ? <ReviewsPanel reviews={reviews} /> : null,
    profile: <ProfilePanel />,
  };

  if (loading) {
    return (
      <div className="app-shell py-10">
        <Card className="app-card">
          <CardContent className="p-10 text-muted-foreground">Loading dashboard...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell py-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="app-card h-max p-3">
          <div className="mb-4 border-b border-border/60 px-2 pb-3">
            <h2 className="text-lg font-semibold">{role.toLowerCase()} dashboard</h2>
            <p className="text-xs text-muted-foreground">FoodHub control center</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant={activeTab === item.key ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon className="size-4" /> {item.title}
              </Button>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <Card className="app-card">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-2xl font-semibold">Welcome, {userName}</h1>
                <p className="text-sm text-muted-foreground">Role: {role}</p>
              </div>

              <div className="flex items-center gap-2">
                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                      <Avatar>
                        <AvatarImage src={session?.user?.image || ""} alt={userName} />
                        <AvatarFallback>
                          {userName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {panelByTab[activeTab]}
        </section>
      </div>
    </div>
  );
}
