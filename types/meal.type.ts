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
    user: {
      name: string;
      image: string;
      id: string;
    };
  };
  trendScore?: number;
  recommendationScore?: number;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  category: string;
  provider?: string | null;
  confidence: number;
}

export interface PaginatedMealsResponse {
  data: Meal[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AIContentSuggestion {
  id: string;
  title: string;
  type: "blog" | "newsletter" | "insight";
  reason: string;
  href: string;
}

export interface NewsletterRecommendation {
  id: string;
  subject: string;
  summary: string;
  focus: string;
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
