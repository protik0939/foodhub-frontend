"use client";

import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Suggest top trending meals under $20",
  "I like spicy food. What should I order?",
  "What can I order for a vegetarian dinner?",
];

export default function FoodHubChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I am your FoodHub AI assistant. Ask me for meal ideas, category picks, or ordering guidance.",
    },
  ]);

  const sendMessage = async (content: string) => {
    const prompt = content.trim();
    if (!prompt || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: prompt } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          messages: messages.slice(-8),
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      const reply = data.reply || data.error || "I could not answer right now. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not connect to the AI service. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="app-card w-[92vw] max-w-sm shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <Bot className="size-4 text-primary" /> FoodHub AI Assistant
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl bg-muted/40 p-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "ml-8 bg-primary text-primary-foreground"
                      : "mr-8 bg-background text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {loading ? (
                <div className="mr-8 rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="inline size-4 animate-spin" /> Thinking...
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about meals, prices, categories..."
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button size="icon-lg" className="rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
          <MessageCircle className="size-5" />
        </Button>
      )}
    </div>
  );
}
