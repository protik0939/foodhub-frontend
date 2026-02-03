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
};
