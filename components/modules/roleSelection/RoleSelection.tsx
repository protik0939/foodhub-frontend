"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { logoutEverywhere } from "@/lib/logout-helper";
import { User, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TUser } from "@/types/user.type";

export default function IdentitySelector({ userData }: {userData : TUser}) {
  const [selected, setSelected] = useState<"CUSTOMER" | "PROVIDER" | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const router = useRouter();

  const handleContinue = () => {
    if (selected) {
      setOpenDialog(true);
    } else {
      alert("Please select an option first.");
    }
  };

  const handleLogout = async () => {
    await logoutEverywhere({
      onAfter: () => router.push("/login"),
    });
  }

  const handleConfirm = async () => {
    if (!selected) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/select-role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          role: selected,
        }),
      });

      if (!res.ok) throw new Error("Failed to update role");
      toast.success(`Role Selected Successfully!`);
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };


  if (!userData) {
    router.push("/login");
    return null;
  }

  if(userData && userData.role != "NONE"){
    router.push("/");
    return null;
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="p-8 w-full max-w-md text-center shadow-lg">
        <CardContent>
          <h3>Welcome to FoodHub {userData.name}</h3>
          <h1 className="text-2xl font-semibold mb-6">What defines you more?</h1>

          <div className="flex gap-4 mb-6 justify-center">
            <Button
              className="cursor-pointer"
              variant={selected === "CUSTOMER" ? "default" : "outline"}
              onClick={() => setSelected("CUSTOMER")}
            >
              <User /> Customer
            </Button>
            <Button
              className="cursor-pointer"
              variant={selected === "PROVIDER" ? "default" : "outline"}
              onClick={() => setSelected("PROVIDER")}
            >
              <Utensils /> Provider
            </Button>
          </div>
          <div className="flex flex-col space-y-2 items-center justify-center">
            <Button className="w-full cursor-pointer" onClick={handleContinue}>Continue</Button>
            <Button variant="destructive" className="w-full cursor-pointer" onClick={handleLogout}>LogOut</Button>
          </div>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-100">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <p className="mb-4 text-sm text-muted-foreground">
                You can&apos;t change it later
              </p>
              <DialogFooter className="flex justify-end gap-2">
                <Button className="cursor-pointer" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button className="cursor-pointer" onClick={handleConfirm}>Yes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
