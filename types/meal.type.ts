export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: string;
  imageUrl: string;
  categoryId: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  provider?: {
    providerName: string;
    providerEmail: string;
  };
}

export interface CreateMealData {
  name: string;
  description: string;
  price: number;
  quantity: string;
  imageUrl: string;
  categoryId: string;
  providerId: string;
}

export interface Order {
  id: string;
  status: "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  quantity: number;
  paymentMethod: "CASHONDELIVERY" | "OTHERS";
  userId: string;
  mealId: string;
  user?: {
    name: string;
    email: string;
    userProfile?: {
      contactNo: string;
      address: string;
    };
  };
  meal?: {
    name: string;
    price: number;
    imageUrl: string;
    provider?: {
      user: {
        name: string;
        image: string;
      };
    };
  };
}
