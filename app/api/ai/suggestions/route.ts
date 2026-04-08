import { NextRequest, NextResponse } from "next/server";
import { SearchSuggestion } from "@/types/meal.type";

type MealContext = {
  id: string;
  name: string;
  price: number;
  category?: { name?: string };
  provider?: { providerName?: string };
};

type OpenRouterChoice = {
  message?: {
    content?: string;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const backendUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:5000";

async function fetchMeals(): Promise<MealContext[]> {
  try {
    const response = await fetch(`${backendUrl}/meals`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as MealContext[];
  } catch {
    return [];
  }
}

function heuristicSuggestions(query: string, meals: MealContext[]): SearchSuggestion[] {
  const term = query.toLowerCase();

  return meals
    .filter(
      (meal) =>
        meal.name.toLowerCase().includes(term) ||
        meal.category?.name?.toLowerCase().includes(term) ||
        meal.provider?.providerName?.toLowerCase().includes(term),
    )
    .slice(0, 6)
    .map((meal) => ({
      id: meal.id,
      label: meal.name,
      category: meal.category?.name || "General",
      provider: meal.provider?.providerName || null,
      confidence: 0.65,
    }));
}

function extractArrayFromText(text: string): unknown[] {
  const codeFenceStripped = text.replaceAll(/```json|```/gi, "").trim();

  try {
    const parsed = JSON.parse(codeFenceStripped);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Continue to regex parse fallback.
  }

  const match = /\[[\s\S]*\]/.exec(codeFenceStripped);
  if (!match) {
    return [];
  }

  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const meals = await fetchMeals();
  if (!meals.length) {
    return NextResponse.json([]);
  }

  const fallback = heuristicSuggestions(query, meals);

  if (!OPENROUTER_KEY) {
    return NextResponse.json(fallback);
  }

  const compactMeals = meals.slice(0, 80).map((meal) => ({
    id: meal.id,
    name: meal.name,
    category: meal.category?.name || "General",
    provider: meal.provider?.providerName || "FoodHub Partner",
    price: meal.price,
  }));

  const prompt = [
    "Create up to 6 FoodHub search suggestions for this user query.",
    `Query: ${query}`,
    "Use only the meal list provided.",
    "Return strictly a JSON array of objects with keys: id, label, category, provider, confidence.",
    "Confidence must be from 0.50 to 0.99 as a number.",
    `Meal list: ${JSON.stringify(compactMeals)}`,
  ].join("\n");

  try {
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "FoodHub AI Suggestions",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON generator for search suggestions. Return only valid JSON arrays.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!openRouterResponse.ok) {
      return NextResponse.json(fallback);
    }

    const data = (await openRouterResponse.json()) as OpenRouterResponse;
    const raw = data.choices?.[0]?.message?.content || "[]";
    const parsed = extractArrayFromText(raw);

    const suggestions = parsed
      .map((item): SearchSuggestion | null => {
        const record = item as Record<string, unknown>;
        const id = typeof record.id === "string" ? record.id : "";
        const label = typeof record.label === "string" ? record.label : "";

        if (!id || !label) {
          return null;
        }

        return {
          id,
          label,
          category:
            typeof record.category === "string" && record.category.length > 0
              ? record.category
              : "General",
          provider: typeof record.provider === "string" ? record.provider : null,
          confidence:
            typeof record.confidence === "number"
              ? Math.min(0.99, Math.max(0.5, record.confidence))
              : 0.65,
        };
      })
      .filter((item): item is SearchSuggestion => Boolean(item))
      .slice(0, 6);

    return NextResponse.json(suggestions.length ? suggestions : fallback);
  } catch {
    return NextResponse.json(fallback);
  }
}
