"use client";

import { Category, CreateMealData, Meal, Order } from "@/types/meal.type";

const API_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export const mealClientService = {
  uploadToImgbb: async function (imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
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
    description?: string
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

  updateMeal: async function (mealId: string, data: Partial<CreateMealData>): Promise<Meal> {
    const response = await fetch(`${API_URL}/meals/${mealId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update meal");
    }

    return response.json();
  },

  deleteMeal: async function (mealId: string): Promise<void> {
    const response = await fetch(`${API_URL}/meals/${mealId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete meal");
    }
  },
};
