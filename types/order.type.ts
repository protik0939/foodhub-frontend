export type OrderStatus = "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CASHONDELIVERY" | "OTHERS";

export interface Order {
  id: string;
  status: OrderStatus;
  quantity: number;
  paymentMethod: PaymentMethod;
  userId: string;
  mealId: string;
  meal: {
    name: string;
    price: number;
    imageUrl: string;
    provider: {
      user: {
        name: string;
        image: string | null;
      };
    };
  };
  reviews: Review[];
}

export interface Review {
  id: string;
  reviewPoint: number;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}
