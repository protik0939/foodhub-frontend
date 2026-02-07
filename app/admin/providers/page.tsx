"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface Provider {
  id: string;
  name: string;
  email: string;
  accountStatus: string;
  createdAt: string;
  providerProfile: {
    id: string;
    providerName: string | null;
    providerEmail: string | null;
    providerContact: string | null;
    providerAddress: string | null;
    ownerName: string | null;
    _count: {
      meals: number;
    };
  } | null;
}

interface PaginatedResponse {
  data: Provider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [pagination.page, search]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/providers?${params}`, {
        credentials: "include",
      });
      const data: PaginatedResponse = await response.json();
      setProviders(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "SUSPENDED") => {
    if (!selectedProvider) return;

    try {
      const response = await fetch(
        `/api/admin/users/${selectedProvider.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchProviders();
        setShowStatusDialog(false);
        setSelectedProvider(null);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
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
          <CardTitle>Providers Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or provider name..."
          />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Meals</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">
                        {provider.providerProfile?.providerName || "N/A"}
                      </TableCell>
                      <TableCell>{provider.providerProfile?.ownerName || provider.name}</TableCell>
                      <TableCell>
                        {provider.providerProfile?.providerEmail || provider.email}
                      </TableCell>
                      <TableCell>{provider.providerProfile?.providerContact || "N/A"}</TableCell>
                      <TableCell>{provider.providerProfile?._count.meals || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={provider.accountStatus === "ACTIVE" ? "default" : "destructive"}
                        >
                          {provider.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={provider.accountStatus === "ACTIVE" ? "destructive" : "default"}
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowStatusDialog(true);
                          }}
                        >
                          {provider.accountStatus === "ACTIVE" ? "Suspend" : "Activate"}
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

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProvider?.accountStatus === "ACTIVE" ? "Suspend" : "Activate"} Provider
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {selectedProvider?.accountStatus === "ACTIVE" ? "suspend" : "activate"}{" "}
              {selectedProvider?.providerProfile?.providerName || selectedProvider?.name}?
              {selectedProvider?.accountStatus === "ACTIVE" &&
                " They will not be able to access their account or manage their meals."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleStatusChange(
                  selectedProvider?.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
                )
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
