import { Order } from "@/types/order.type";

export const orderClientService = {
  getOrdersByUserId: async function (userId: string): Promise<Order[]> {
    const res = await fetch(
      `/orders/customer/${userId}`,
      {
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }

    return res.json();
  },

  cancelOrder: async function (orderId: string): Promise<Order> {
    const res = await fetch(
      `/orders/${orderId}/cancel`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to cancel order");
    }

    return res.json();
  },
};
