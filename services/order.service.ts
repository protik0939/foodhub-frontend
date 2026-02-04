import { cookies } from "next/headers";
import { Order } from "@/types/order.type";

export const orderService = {
  getOrdersByUserId: async function (userId: string): Promise<{ data: Order[] | null; error: { message: string } | null }> {
    try {
      const cookieStore = await cookies();
      const res = await fetch(
        `${process.env.BETTER_AUTH_URL}/orders/customer/${userId}`,
        {
          headers: {
            Cookie: cookieStore.toString(),
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        return { data: null, error: { message: "Failed to fetch orders" } };
      }

      const orders = await res.json();
      return { data: orders, error: null };
    } catch (err) {
      console.error(err);
      return { data: null, error: { message: "Something Went Wrong" } };
    }
  },

  cancelOrder: async function (orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(
        `${process.env.BETTER_AUTH_URL}/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || "Failed to cancel order" };
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Something went wrong" };
    }
  },
};
