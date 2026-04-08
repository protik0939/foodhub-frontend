import {
  AIContentSuggestion,
  Category,
  CreateMealData,
  CreateReviewData,
  Meal,
  NewsletterRecommendation,
  Order,
  PaginatedMealsResponse,
  Review,
  ReviewStats,
  SearchSuggestion,
} from "@/types/meal.type";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "http://localhost:3000";

export const mealService = {
  uploadToImgbb: async function (imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    const data = await response.json();
    return data.data.url;
  },

  getAllCategories: async function (searchTerm?: string): Promise<Category[]> {
    const url = searchTerm
      ? `${appUrl}/api/categories?search=${encodeURIComponent(searchTerm)}`
      : `${appUrl}/api/categories`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    return response.json();
  },

  createCategory: async function (
    name: string,
    description?: string,
  ): Promise<Category> {
    const response = await fetch(`${appUrl}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error("Failed to create category");
    }

    return response.json();
  },

  createMeal: async function (data: CreateMealData): Promise<Meal> {
    const response = await fetch(`${appUrl}/api/meals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create meal");
    }

    return response.json();
  },

  getMealsByProviderId: async function (providerId: string): Promise<Meal[]> {
    const response = await fetch(`${appUrl}/api/meals/provider/${providerId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    return response.json();
  },

  getMealById: async function (mealId: string): Promise<Meal> {
    const response = await fetch(`${appUrl}/api/meals/${mealId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meal");
    }

    return response.json();
  },

  getOrdersByProviderId: async function (providerId: string): Promise<Order[]> {
    const response = await fetch(`${appUrl}/orders/provider/${providerId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return response.json();
  },

  getAllMeals: async function (searchTerm?: string): Promise<Meal[]> {
    const url = searchTerm
      ? `${appUrl}/api/meals?search=${encodeURIComponent(searchTerm)}`
      : `${appUrl}/api/meals`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    return response.json();
  },

  getMealsPaginated: async function (params: {
    page: number;
    limit: number;
    searchTerm?: string;
    categoryId?: string;
  }): Promise<PaginatedMealsResponse> {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    if (params.searchTerm?.trim()) {
      query.set("search", params.searchTerm.trim());
    }

    if (params.categoryId) {
      query.set("categoryId", params.categoryId);
    }

    const response = await fetch(`${appUrl}/api/meals?${query.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch paginated meals");
    }

    return response.json();
  },

  getMealsByCategory: async function (categoryId: string): Promise<Meal[]> {
    const response = await fetch(`${appUrl}/api/meals/category/${categoryId}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch meals by category");
    }

    return response.json();
  },

  getSearchSuggestions: async function (query: string): Promise<SearchSuggestion[]> {
    const response = await fetch(
      `${appUrl}/api/ai/suggestions?q=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search suggestions");
    }

    return response.json();
  },

  getTrendingMeals: async function (): Promise<Meal[]> {
    const response = await fetch(`${appUrl}/api/meals/ai/trending`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch trending meals");
    }

    return response.json();
  },

  getPersonalizedRecommendations: async function (userId: string): Promise<Meal[]> {
    const response = await fetch(`${appUrl}/api/meals/ai/recommendations/${userId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    return response.json();
  },

  getAIContentSuggestions: async function (payload: {
    interests?: string[];
    topCategories?: string[];
    recentMeals?: string[];
  }): Promise<AIContentSuggestion[]> {
    const response = await fetch(`${appUrl}/api/ai/content-suggestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI content suggestions");
    }

    return response.json();
  },

  getNewsletterRecommendations: async function (payload: {
    interests?: string[];
    topCategories?: string[];
    recentMeals?: string[];
  }): Promise<NewsletterRecommendation[]> {
    const response = await fetch(`${appUrl}/api/ai/newsletter-recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch newsletter recommendations");
    }

    return response.json();
  },

  createOrder: async function (data: object): Promise<Order> {
    const response = await fetch(`${appUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify( data ),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create order");
    }

    return response.json();
  },

  getOrdersByUserId: async function (userId: string): Promise<Order[]> {
    const response = await fetch(`${appUrl}/orders/customer/${userId}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  },

  updateOrderStatus: async function (orderId: string, status: string): Promise<Order> {
    const response = await fetch(`${appUrl}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order status");
    }

    return response.json();
  },

  createReview: async function (data: CreateReviewData): Promise<Review> {
    const response = await fetch(`${appUrl}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details?.message || "Failed to create review");
    }

    return response.json();
  },

  getReviewsByMealId: async function (mealId: string): Promise<Review[]> {
    const response = await fetch(`${appUrl}/reviews/meal/${mealId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },

  getReviewStats: async function (mealId: string): Promise<ReviewStats> {
    const response = await fetch(`/reviews/stats/${mealId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch review stats");
    }

    return response.json();
  },

  getReviewsByProviderId: async function (providerId: string): Promise<Review[]> {
    const response = await fetch(`/reviews/provider/${providerId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },

  getAllReviews: async function (): Promise<Review[]> {
    const response = await fetch(`/reviews/all`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },
};
