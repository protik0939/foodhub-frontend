import { NextRequest, NextResponse } from "next/server";
import { AIContentSuggestion } from "@/types/meal.type";

type MealContext = {
  id: string;
  name: string;
  category?: { name?: string };
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

function extractArrayFromText(text: string): unknown[] {
  const codeFenceStripped = text.replaceAll(/```json|```/gi, "").trim();

  try {
    const parsed = JSON.parse(codeFenceStripped);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Keep fallback parse.
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

async function fetchMeals(): Promise<MealContext[]> {
  try {
    const response = await fetch(`${backendUrl}/meals?page=1&limit=40`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as
      | MealContext[]
      | {
          data?: MealContext[];
        };

    if (Array.isArray(payload)) {
      return payload;
    }

    return Array.isArray(payload.data) ? payload.data : [];
  } catch {
    return [];
  }
}

function buildFallbackSuggestions(
  interests: string[],
  categories: string[],
): AIContentSuggestion[] {
  const joinedInterests = interests.length ? interests.join(", ") : "popular meals";
  const topCategory = categories[0] || "Food Trends";

  return [
    {
      id: "content-1",
      title: `This Week in ${topCategory}`,
      type: "blog",
      reason: `Based on your interests in ${joinedInterests}.`,
      href: "/blog",
    },
    {
      id: "content-2",
      title: "Top Trending Providers Near You",
      type: "insight",
      reason: "Generated from ordering activity and customer ratings.",
      href: "/topbrands",
    },
    {
      id: "content-3",
      title: "Meal Discovery Guide for Busy Days",
      type: "blog",
      reason: "Suggested from quick-order behavior and search patterns.",
      href: "/explore",
    },
    {
      id: "content-4",
      title: "Fresh Picks Newsletter",
      type: "newsletter",
      reason: "Recommended updates tailored to your category preferences.",
      href: "/blog",
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      interests?: string[];
      topCategories?: string[];
      recentMeals?: string[];
    };

    const interests = Array.isArray(body.interests) ? body.interests.slice(0, 8) : [];
    const meals = await fetchMeals();

    const categoryCounts = new Map<string, number>();
    meals.forEach((meal) => {
      const category = meal.category?.name || "General";
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const fallback = buildFallbackSuggestions(interests, topCategories);

    if (!OPENROUTER_KEY) {
      return NextResponse.json(fallback);
    }

    const prompt = [
      "Create 4 to 6 FoodHub AI content suggestions.",
      `User interests: ${JSON.stringify(interests)}`,
      `Top categories: ${JSON.stringify(topCategories)}`,
      `Recent meals: ${JSON.stringify(body.recentMeals || [])}`,
      "Return only a JSON array of objects with keys: id, title, type, reason, href.",
      "Allowed type values: blog, newsletter, insight.",
      "Allowed href values: /blog, /explore, /topbrands, /categories, /help.",
      "Keep reason concise (max 110 characters).",
    ].join("\n");

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "FoodHub AI Content Suggestions",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content: "You are a strict JSON generator. Return only valid JSON arrays.",
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

    const allowedTypes = new Set(["blog", "newsletter", "insight"]);
    const allowedHrefs = new Set(["/blog", "/explore", "/topbrands", "/categories", "/help"]);

    const suggestions = parsed
      .map((item): AIContentSuggestion | null => {
        const record = item as Record<string, unknown>;
        const title = typeof record.title === "string" ? record.title.trim() : "";
        const reason = typeof record.reason === "string" ? record.reason.trim() : "";
        const type = typeof record.type === "string" ? record.type : "insight";
        const href = typeof record.href === "string" ? record.href : "/blog";

        if (!title || !reason || !allowedTypes.has(type) || !allowedHrefs.has(href)) {
          return null;
        }

        return {
          id: typeof record.id === "string" && record.id.trim() ? record.id : `content-${title}`,
          title,
          reason,
          type: type as AIContentSuggestion["type"],
          href,
        };
      })
      .filter((item): item is AIContentSuggestion => Boolean(item))
      .slice(0, 6);

    return NextResponse.json(suggestions.length ? suggestions : fallback);
  } catch {
    return NextResponse.json([]);
  }
}
