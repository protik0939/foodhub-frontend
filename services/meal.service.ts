import { Category, CreateMealData, CreateReviewData, Meal, Order, Review, ReviewStats } from "@/types/meal.type";

const API_URL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

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
      ? `${API_URL}/categories?search=${encodeURIComponent(searchTerm)}`
      : `${API_URL}/categories`;

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
    const response = await fetch(`${API_URL}/categories`, {
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
    const response = await fetch(`${API_URL}/meals`, {
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
    const response = await fetch(`${API_URL}/meals/provider/${providerId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    return response.json();
  },

  getOrdersByProviderId: async function (providerId: string): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders/provider/${providerId}`, {
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
      ? `${API_URL}/meals?search=${encodeURIComponent(searchTerm)}`
      : `${API_URL}/meals`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    return response.json();
  },

  getMealsByCategory: async function (categoryId: string): Promise<Meal[]> {
    const response = await fetch(`${API_URL}/meals/category/${categoryId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals by category");
    }

    return response.json();
  },

  createOrder: async function (data: object): Promise<Order> {
    const response = await fetch(`${API_URL}/orders`, {
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
    const response = await fetch(`${API_URL}/orders/customer/${userId}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  },

  updateOrderStatus: async function (orderId: string, status: string): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
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
    const response = await fetch(`${API_URL}/reviews`, {
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
    const response = await fetch(`${API_URL}/reviews/meal/${mealId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },

  getReviewStats: async function (mealId: string): Promise<ReviewStats> {
    const response = await fetch(`${API_URL}/reviews/stats/${mealId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch review stats");
    }

    return response.json();
  },

  getReviewsByProviderId: async function (providerId: string): Promise<Review[]> {
    const response = await fetch(`${API_URL}/reviews/provider/${providerId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },

  getAllReviews: async function (): Promise<Review[]> {
    const response = await fetch(`${API_URL}/reviews/all`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return response.json();
  },
};
