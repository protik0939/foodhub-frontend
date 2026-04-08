import { NextRequest, NextResponse } from "next/server";
import { NewsletterRecommendation } from "@/types/meal.type";

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

function extractArrayFromText(text: string): unknown[] {
  const codeFenceStripped = text.replaceAll(/```json|```/gi, "").trim();

  try {
    const parsed = JSON.parse(codeFenceStripped);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Continue with fallback parser.
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

function fallbackRecommendations(interests: string[]): NewsletterRecommendation[] {
  const interestLabel = interests.length ? interests.join(", ") : "Trending meals";

  return [
    {
      id: "newsletter-1",
      subject: "Your weekly FoodHub meal picks",
      summary: "Top dishes and provider highlights selected from current activity.",
      focus: interestLabel,
    },
    {
      id: "newsletter-2",
      subject: "New kitchens to watch this week",
      summary: "Fresh provider launches and highly rated menu items.",
      focus: "Top brands",
    },
    {
      id: "newsletter-3",
      subject: "Smart savings and quick-order ideas",
      summary: "Recommended combinations based on your search and order patterns.",
      focus: "Personalized recommendations",
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
    const fallback = fallbackRecommendations(interests);

    if (!OPENROUTER_KEY) {
      return NextResponse.json(fallback);
    }

    const prompt = [
      "Create 3 to 5 FoodHub newsletter recommendation entries.",
      `Interests: ${JSON.stringify(interests)}`,
      `Top categories: ${JSON.stringify(body.topCategories || [])}`,
      `Recent meals: ${JSON.stringify(body.recentMeals || [])}`,
      "Return only a JSON array with keys: id, subject, summary, focus.",
      "Subject max 65 chars, summary max 120 chars.",
    ].join("\n");

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "FoodHub Newsletter Recommendations",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.35,
        max_tokens: 380,
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

    const recommendations = parsed
      .map((item): NewsletterRecommendation | null => {
        const record = item as Record<string, unknown>;
        const subject = typeof record.subject === "string" ? record.subject.trim() : "";
        const summary = typeof record.summary === "string" ? record.summary.trim() : "";
        const focus = typeof record.focus === "string" ? record.focus.trim() : "";

        if (!subject || !summary || !focus) {
          return null;
        }

        return {
          id: typeof record.id === "string" && record.id.trim() ? record.id : `newsletter-${subject}`,
          subject,
          summary,
          focus,
        };
      })
      .filter((item): item is NewsletterRecommendation => Boolean(item))
      .slice(0, 5);

    return NextResponse.json(recommendations.length ? recommendations : fallback);
  } catch {
    return NextResponse.json([]);
  }
}
