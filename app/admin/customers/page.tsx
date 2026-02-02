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
import { Ban, CheckCircle } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  accountStatus: string;
  createdAt: string;
  userProfile: {
    firstName: string | null;
    lastName: string | null;
    contactNo: string | null;
    address: string | null;
  } | null;
  _count: {
    orders: number;
  };
}

interface PaginatedResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/customers?${params}`);
      const data: PaginatedResponse = await response.json();
      setCustomers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "SUSPENDED") => {
    if (!selectedCustomer) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/admin/users/${selectedCustomer.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchCustomers();
        setShowStatusDialog(false);
        setSelectedCustomer(null);
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
          <CardTitle>Customers Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
          />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.userProfile?.firstName && customer.userProfile?.lastName
                          ? `${customer.userProfile.firstName} ${customer.userProfile.lastName}`
                          : customer.name}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.userProfile?.contactNo || "N/A"}</TableCell>
                      <TableCell>{customer._count.orders}</TableCell>
                      <TableCell>
                        <Badge variant={customer.accountStatus === "ACTIVE" ? "default" : "destructive"}>
                          {customer.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Ban className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={customer.accountStatus === "ACTIVE" ? "destructive" : "default"}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowStatusDialog(true);
                          }}
                        >
                          {customer.accountStatus === "ACTIVE" ? "Suspend" : "Activate"}
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
              {selectedCustomer?.accountStatus === "ACTIVE" ? "Suspend" : "Activate"} Customer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedCustomer?.accountStatus === "ACTIVE" ? "suspend" : "activate"}{" "}
              {selectedCustomer?.name}? 
              {selectedCustomer?.accountStatus === "ACTIVE" && " They will not be able to access their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleStatusChange(selectedCustomer?.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE")
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
