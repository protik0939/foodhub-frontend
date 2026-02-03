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

export interface Review {
  id: string;
  reviewPoint: number;
  comment?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  orderId: string;
  order?: {
    user: {
      name: string;
      email: string;
      image?: string;
    };
    meal?: {
      name: string;
      imageUrl: string;
    };
  };
}

export interface CreateReviewData {
  reviewPoint: number;
  comment?: string;
  imageUrl?: string;
  orderId: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

export interface Order {
  id: string;
  status: "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  quantity: number;
  paymentMethod: "CASHONDELIVERY" | "OTHERS";
  userId: string;
  mealId: string;
  reviews?: Review[];
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
