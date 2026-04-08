import { NextRequest, NextResponse } from "next/server";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
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

async function fetchMealContext(): Promise<string> {
  try {
    const response = await fetch(`${backendUrl}/meals`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    const meals = (await response.json()) as Array<{
      name: string;
      price: number;
      category?: { name?: string };
      provider?: { providerName?: string };
    }>;

    return meals
      .slice(0, 50)
      .map(
        (meal) =>
          `${meal.name} | $${meal.price.toFixed(2)} | ${meal.category?.name || "General"} | ${meal.provider?.providerName || "FoodHub Partner"}`,
      )
      .join("\n");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      prompt?: string;
    };

    const incomingPrompt = (body.prompt || "").trim();
    const history = Array.isArray(body.messages) ? body.messages : [];

    if (!incomingPrompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const context = await fetchMealContext();

    if (!OPENROUTER_KEY) {
      return NextResponse.json({
        reply:
          "OpenRouter API key is not configured yet. Add OPENROUTER_API_KEY in your frontend environment, restart the app, and I can answer with live AI guidance.\n\nQuick fallback: try searching by category, price range, or top brands.",
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are FoodHub Assistant. Help users discover meals, compare options, and explain ordering steps clearly and briefly. Use only FoodHub context; if unsure, say what information is missing. Keep answers under 120 words.",
      },
      {
        role: "system",
        content: `Available FoodHub meals snapshot:\n${context || "No meal context available right now."}`,
      },
      ...history.slice(-8).map((item) => ({
        role: item.role,
        content: item.content.slice(0, 1000),
      })),
      {
        role: "user",
        content: incomingPrompt.slice(0, 1500),
      },
    ];

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "FoodHub Assistant",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return NextResponse.json(
        {
          error: "OpenRouter request failed.",
          details: errorText,
        },
        { status: 502 },
      );
    }

    const data = (await openRouterResponse.json()) as OpenRouterResponse;
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "I could not generate an answer right now. Please try another question.";

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process chat request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
