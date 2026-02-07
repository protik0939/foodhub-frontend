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
import Image from "next/image";

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: string;
  imageUrl: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    providerName: string | null;
    providerEmail: string | null;
  };
  _count: {
    orders: number;
  };
}

interface PaginatedResponse {
  data: Meal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, [pagination.page, search]);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/meals?${params}`, {
        credentials: "include",
      });
      const data: PaginatedResponse = await response.json();
      setMeals(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMeal) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/meals/${selectedMeal.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchMeals();
        setShowDeleteDialog(false);
        setSelectedMeal(null);
      }
    } catch (error) {
      console.error("Failed to delete meal:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meals Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by meal name, category, or provider..."
          />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.map((meal) => (
                    <TableRow key={meal.id}>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={meal.imageUrl}
                            alt={meal.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {meal.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{meal.category.name}</TableCell>
                      <TableCell>{meal.provider.providerName || "N/A"}</TableCell>
                      <TableCell>${meal.price.toFixed(2)}</TableCell>
                      <TableCell>{meal.quantity}</TableCell>
                      <TableCell>{meal._count.orders}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedMeal(meal);
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
            <AlertDialogTitle>Delete Meal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquot;{selectedMeal?.name}&ldquot;? This action cannot be undone
              and will affect existing orders.
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
