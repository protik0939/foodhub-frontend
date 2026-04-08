"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { mealClientService } from "@/services/meal.client.service";
import {
  AIContentSuggestion,
  Category,
  Meal,
  NewsletterRecommendation,
  Order,
  SearchSuggestion,
} from "@/types/meal.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Building2,
  Brain,
  ChartNoAxesCombined,
  ChefHat,
  Clock3,
  CreditCard,
  Handshake,
  MapPin,
  Shield,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import MealCard from "@/components/modules/meal/MealCard";
import ReviewModal from "@/components/modules/review/ReviewModal";

const heroMessages = [
  "Discover city kitchens with real reviews",
  "Order in minutes, track every step live",
  "Get AI-ranked meal picks for your taste",
];

const heroImage = "/images/forHomepage.jpg";
const ALL_MEALS_PAGE_SIZE = 8;

export default function CustomerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [trendingMeals, setTrendingMeals] = useState<Meal[]>([]);
  const [recommendedMeals, setRecommendedMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMealsLoading, setAllMealsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [allMealsPage, setAllMealsPage] = useState(1);
  const [allMealsPageData, setAllMealsPageData] = useState<Meal[]>([]);
  const [allMealsTotal, setAllMealsTotal] = useState(0);
  const [allMealsTotalPages, setAllMealsTotalPages] = useState(1);
  const [hasNextAllMealsPage, setHasNextAllMealsPage] = useState(false);
  const [hasPrevAllMealsPage, setHasPrevAllMealsPage] = useState(false);
  const [contentSuggestions, setContentSuggestions] = useState<AIContentSuggestion[]>([]);
  const [newsletterRecommendations, setNewsletterRecommendations] = useState<NewsletterRecommendation[]>([]);
  const [aiContentLoading, setAiContentLoading] = useState(true);
  const [activeHeroText, setActiveHeroText] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroText((prev) => (prev + 1) % heroMessages.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoryData, mealData, trendingData] = await Promise.all([
          mealClientService.getAllCategories(),
          mealClientService.getAllMeals(),
          mealClientService.getTrendingMeals(),
        ]);

        setCategories(categoryData);
        setMeals(mealData);
        setTrendingMeals(trendingData);

        if (session?.user?.id) {
          const [recommendations, userOrders] = await Promise.all([
            mealClientService.getPersonalizedRecommendations(session.user.id),
            mealClientService.getOrdersByUserId(session.user.id),
          ]);
          setRecommendedMeals(recommendations);
          setOrders(userOrders);
        }
      } catch {
        toast.error("Failed to load homepage data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session?.user?.id]);

  useEffect(() => {
    setAllMealsPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    const loadPaginatedMeals = async () => {
      setAllMealsLoading(true);
      try {
        const response = await mealClientService.getMealsPaginated({
          page: allMealsPage,
          limit: ALL_MEALS_PAGE_SIZE,
          searchTerm: searchTerm.trim() || undefined,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        });

        if (cancelled) {
          return;
        }

        setAllMealsPageData(response.data);
        setAllMealsTotal(response.meta.total);
        setAllMealsTotalPages(response.meta.totalPages);
        setHasNextAllMealsPage(response.meta.hasNextPage);
        setHasPrevAllMealsPage(response.meta.hasPrevPage);
      } catch {
        if (cancelled) {
          return;
        }

        setAllMealsPageData([]);
        setAllMealsTotal(0);
        setAllMealsTotalPages(1);
        setHasNextAllMealsPage(false);
        setHasPrevAllMealsPage(false);
      } finally {
        if (!cancelled) {
          setAllMealsLoading(false);
        }
      }
    };

    loadPaginatedMeals();

    return () => {
      cancelled = true;
    };
  }, [allMealsPage, searchTerm, selectedCategory]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await mealClientService.getSearchSuggestions(searchTerm);
        setSuggestions(response);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const loadAIContent = async () => {
      setAiContentLoading(true);

      const topCategories = categories.slice(0, 5).map((category) => category.name);
      const recentMeals = recommendedMeals.slice(0, 6).map((meal) => meal.name);
      const interests = Array.from(
        new Set(
          [
            ...topCategories.slice(0, 3),
            ...trendingMeals.slice(0, 3).map((meal) => meal.category?.name || meal.name),
            session?.user?.id ? "personalized" : "discovery",
          ].filter(Boolean),
        ),
      );

      try {
        const [content, newsletter] = await Promise.all([
          mealClientService.getAIContentSuggestions({
            interests,
            topCategories,
            recentMeals,
          }),
          mealClientService.getNewsletterRecommendations({
            interests,
            topCategories,
            recentMeals,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setContentSuggestions(content);
        setNewsletterRecommendations(newsletter);
      } catch {
        if (cancelled) {
          return;
        }

        setContentSuggestions([]);
        setNewsletterRecommendations([]);
      } finally {
        if (!cancelled) {
          setAiContentLoading(false);
        }
      }
    };

    if (!categories.length && !trendingMeals.length) {
      return;
    }

    loadAIContent();

    return () => {
      cancelled = true;
    };
  }, [categories, recommendedMeals, session?.user?.id, trendingMeals]);

  const providerCount = useMemo(() => {
    const providerIds = new Set(
      meals
        .map((meal) => meal.provider?.user.id)
        .filter((providerId): providerId is string => Boolean(providerId)),
    );

    return providerIds.size;
  }, [meals]);

  const topProviders = useMemo(() => {
    const map = new Map<string, { id: string; name: string; image?: string; count: number }>();

    meals.forEach((meal) => {
      const providerId = meal.provider?.user?.id;
      const providerName = meal.provider?.providerName || meal.provider?.user?.name;

      if (!providerId || !providerName) {
        return;
      }

      const existing = map.get(providerId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(providerId, {
          id: providerId,
          name: providerName,
          image: meal.provider?.user?.image,
          count: 1,
        });
      }
    });

    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [meals]);

  const stats = useMemo(
    () => [
      {
        title: "Available Meals",
        value: meals.length,
        icon: ChefHat,
      },
      {
        title: "Cuisine Categories",
        value: categories.length,
        icon: Sparkles,
      },
      {
        title: "Partner Kitchens",
        value: providerCount,
        icon: Store,
      },
      {
        title: "Avg Delivery Window",
        value: "32m",
        icon: Truck,
      },
    ],
    [categories.length, meals.length, providerCount],
  );

  const isGuest = session?.user == null;
  const pendingReviewOrders = orders.filter(
    (order) => order.status === "DELIVERED" && (!order.reviews || order.reviews.length === 0),
  );

  const allMealsPageNumbers = useMemo(() => {
    const maxVisible = 7;
    const total = allMealsTotalPages;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, allMealsPage - half);
    const end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [allMealsPage, allMealsTotalPages]);

  const openReviewModal = (order: Order) => {
    setSelectedOrderForReview(order);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = async () => {
    if (!session?.user?.id) {
      return;
    }

    const userOrders = await mealClientService.getOrdersByUserId(session.user.id);
    setOrders(userOrders);
  };

  const allMealsContent = (() => {
    if (allMealsLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: ALL_MEALS_PAGE_SIZE }, (_, index) => (
            <Skeleton key={`all-skeleton-${index}`} className="h-105 rounded-2xl" />
          ))}
        </div>
      );
    }

    if (allMealsPageData.length === 0) {
      return (
        <Card className="app-card">
          <CardContent className="p-10 text-center text-muted-foreground">
            No meals match your current search. Try a different keyword or category.
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {allMealsPageData.map((meal) => (
            <MealCard key={meal.id} meal={meal} onOrder={() => undefined} />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Showing page {allMealsPage} of {allMealsTotalPages} ({allMealsTotal} meals)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={!hasPrevAllMealsPage || allMealsLoading}
              onClick={() => setAllMealsPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            {allMealsPageNumbers.map((pageNumber) => (
              <Button
                key={`all-meals-page-${pageNumber}`}
                variant={pageNumber === allMealsPage ? "default" : "outline"}
                size="sm"
                disabled={allMealsLoading}
                onClick={() => setAllMealsPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={!hasNextAllMealsPage || allMealsLoading}
              onClick={() => setAllMealsPage((prev) => Math.min(allMealsTotalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  })();

  const aiContentSuggestionContent = (() => {
    if (aiContentLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={`ai-content-skeleton-${index}`} className="h-16 rounded-xl" />
          ))}
        </div>
      );
    }

    if (!contentSuggestions.length) {
      return (
        <p className="text-sm text-muted-foreground">
          No AI content suggestions right now. Browse Explore to generate better recommendations.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {contentSuggestions.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="block rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="font-semibold">{item.title}</h3>
              <Badge variant="secondary" className="uppercase">
                {item.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.reason}</p>
          </Link>
        ))}
      </div>
    );
  })();

  const newsletterRecommendationContent = (() => {
    if (aiContentLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={`newsletter-skeleton-${index}`} className="h-20 rounded-xl" />
          ))}
        </div>
      );
    }

    if (!newsletterRecommendations.length) {
      return (
        <p className="text-sm text-muted-foreground">
          Newsletter recommendations are loading as we learn more from user activity.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {newsletterRecommendations.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/60 p-4">
            <h3 className="font-semibold">{item.subject}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">Focus: {item.focus}</p>
          </div>
        ))}
      </div>
    );
  })();

  return (
    <div className="pb-16">
      <section className="relative min-h-[62vh] overflow-hidden border-b border-border/60">
        <Image src={heroImage} alt="Fresh meals prepared by local kitchens" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/55 to-black/35" />

        <div className="app-shell relative z-10 flex min-h-[62vh] flex-col justify-center py-14 text-white">
          <Badge className="mb-6 w-max border-none bg-primary text-primary-foreground">
            Smart Food Discovery Platform
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight md:text-6xl">
            Professional ordering experience for customers and local kitchens
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/90 md:text-xl">
            {heroMessages[activeHeroText]}
          </p>

          <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search meals, cuisines, or kitchen names"
                className="h-11 border-border bg-background/95 pl-9 text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSuggestionOpen(true);
                }}
                onBlur={() => setTimeout(() => setSuggestionOpen(false), 120)}
                onFocus={() => setSuggestionOpen(true)}
              />

              {suggestionOpen && suggestions.length > 0 ? (
                <div className="floating-scrollbar absolute z-50 mt-2 max-h-44 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-background p-2 text-foreground shadow-xl sm:h-28">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted"
                      onMouseDown={() => {
                        setSearchTerm(suggestion.label);
                        setSuggestionOpen(false);
                      }}
                    >
                      <span className="text-sm">{suggestion.label}</span>
                      <span className="text-xs text-muted-foreground">
                        AI {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <Button asChild size="lg" className="h-11">
              <Link href="/explore">Explore Meals</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/85">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4" /> Verified partners
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4" /> Live order statuses
            </span>
            <span className="inline-flex items-center gap-2">
              <Bot className="size-4" /> AI suggestions enabled
            </span>
          </div>
        </div>
      </section>

      <section className="app-shell mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.title} className="app-card border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-3xl font-semibold">{item.value}</p>
              </div>
              <item.icon className="size-8 text-primary" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">AI Overview of FoodHub</h2>
          <Badge className="border border-border bg-card text-foreground">Live AI modules</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="app-card border-primary/30">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <Search className="size-5 text-primary" /> AI Search Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Suggestions are generated as you type with confidence scores to speed up discovery.</p>
              <p className="text-foreground">Live suggestions shown: {suggestions.length}</p>
            </CardContent>
          </Card>

          <Card className="app-card border-secondary/40">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <Brain className="size-5 text-secondary" /> Personalized Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Meal recommendations adjust based on order behavior and category preferences.</p>
              <p className="text-foreground">Meals recommended now: {recommendedMeals.length}</p>
            </CardContent>
          </Card>

          <Card className="app-card border-accent/40">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <Bot className="size-5 text-accent" /> Conversational Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>FoodHub AI chatbot helps users compare meals, budgets, and category options instantly.</p>
              <p className="text-foreground">Trending set tracked: {trendingMeals.length}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="app-shell mt-12 grid gap-4 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <ChartNoAxesCombined className="size-5 text-primary" /> AI Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. You enter a keyword and AI suggestion service matches top meals in real time.</p>
            <p>2. The ranking model highlights trending and high-relevance dishes.</p>
            <p>3. Personalized recommendations are tuned using your order activity.</p>
            <p>4. Chat assistant helps narrow choices by budget, category, or dietary intent.</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <ShieldCheck className="size-5 text-secondary" /> Customer Trust Layer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Verified kitchens and transparent ratings keep meal quality decisions clear.</p>
            <p>Order states are visible from preparing to delivered with consistent updates.</p>
            <p>Review workflow allows quick feedback directly from delivered orders.</p>
            <p>Privacy and support pages are always available for clear policy access.</p>
          </CardContent>
        </Card>
      </section>

      <section className="app-shell mt-12 grid gap-4 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle>AI-Generated Content Suggestions</CardTitle>
          </CardHeader>
          <CardContent>{aiContentSuggestionContent}</CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle>Smart Email / Newsletter Recommendations</CardTitle>
          </CardHeader>
          <CardContent>{newsletterRecommendationContent}</CardContent>
        </Card>
      </section>

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Coverage Across Bangladesh</h2>
          <Badge className="border border-border bg-card text-foreground">Nationwide growing network</Badge>
        </div>
        <Card className="app-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              FoodHub currently prioritizes dense delivery zones and expands based on demand signals.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"].map((city) => (
                <Badge key={city} variant="secondary" className="px-3 py-1">
                  {city}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="app-shell mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Shield className="size-4 text-primary" /> Secure Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Transactions are protected with strict checkout and session safety controls.
          </CardContent>
        </Card>
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-secondary" /> Flexible Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cash on delivery and additional payment methods are available per provider setup.
          </CardContent>
        </Card>
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Handshake className="size-4 text-accent" /> Trusted Provider Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Verified profiles and rating visibility help customers make confident choices.
          </CardContent>
        </Card>
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" /> Local Business Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            FoodHub helps neighborhood kitchens scale orders with predictable demand insights.
          </CardContent>
        </Card>
      </section>

      <section className="app-shell mt-12 grid gap-4 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle>Service Promise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Reliable handoff updates from kitchen acceptance to delivery.</p>
            <p>2. Transparent cancellation and support processes for customers.</p>
            <p>3. Structured review collection to continuously improve meal quality.</p>
            <p>4. AI-assisted discovery to reduce search time and improve satisfaction.</p>
          </CardContent>
        </Card>

        <Card className="app-card bg-secondary/10">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <h2 className="text-2xl font-semibold">Own a kitchen in Bangladesh?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Join FoodHub as a provider to list meals, receive order insights, and reach local customers faster.
              </p>
            </div>
            <div className="mt-5">
              <Button asChild>
                <Link href="/select-role">
                  Join as Provider <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Browse by Category</h2>
          <Button asChild variant="ghost">
            <Link href="/categories">View all categories</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">AI Trending Meals</h2>
          <p className="text-sm text-muted-foreground">Ranked by order activity and freshness</p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={`trending-skeleton-${index}`} className="h-105 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {trendingMeals.slice(0, 8).map((meal) => (
              <MealCard key={meal.id} meal={meal} onOrder={() => undefined} />
            ))}
          </div>
        )}
      </section>

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Personalized for You</h2>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Brain className="size-4" /> Behavior-based recommendations
          </span>
        </div>

        {isGuest ? (
          <Card className="app-card">
            <CardContent className="flex flex-col items-start justify-between gap-3 p-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-semibold">Sign in to unlock personalized meal picks</h3>
                <p className="text-sm text-muted-foreground">
                  We analyze your orders and browsing behavior to surface meals you are likely to love.
                </p>
              </div>
              <Button asChild>
                <Link href="/login">Sign in now</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {recommendedMeals.slice(0, 8).map((meal) => (
              <MealCard key={meal.id} meal={meal} onOrder={() => undefined} />
            ))}
          </div>
        )}
      </section>

      {isGuest ? null : (
        <section className="app-shell mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-heading">Review Your Delivered Orders</h2>
            <Button asChild variant="ghost">
              <Link href="/your-orders">Go to all orders</Link>
            </Button>
          </div>

          {pendingReviewOrders.length === 0 ? (
            <Card className="app-card">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No pending reviews right now. Once an order is delivered, you can submit a rating and feedback here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingReviewOrders.slice(0, 6).map((order) => (
                <Card key={order.id} className="app-card">
                  <CardContent className="space-y-3 p-4">
                    <p className="font-semibold">{order.meal?.name || "Ordered meal"}</p>
                    <p className="text-sm text-muted-foreground">Order ID: {order.id.slice(0, 8)}...</p>
                    <Button variant="outline" onClick={() => openReviewModal(order)}>
                      <Star className="mr-2 size-4" /> Write Review
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">Popular Partner Kitchens</h2>
          <Button asChild variant="ghost">
            <Link href="/topbrands">Explore all partners</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topProviders.map((provider) => (
            <Link key={provider.id} href={`/topbrands/${provider.id}`}>
              <Card className="app-card h-full transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="relative size-14 overflow-hidden rounded-xl bg-muted">
                    {provider.image ? (
                      <Image src={provider.image} alt={provider.name} fill className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {provider.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">{provider.count} listed meals</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="app-shell mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-heading">All Meals</h2>
          <Button asChild variant="outline">
            <Link href="/explore">Advanced filters</Link>
          </Button>
        </div>

        {allMealsContent}
      </section>

      <section className="app-shell mt-12 grid gap-4 lg:grid-cols-3">
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Truck className="size-5 text-primary" /> Delivery Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Browse meals and compare ratings.</p>
            <p>2. Confirm order details and address.</p>
            <p>3. Track status from preparing to delivered.</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <ChartNoAxesCombined className="size-5 text-secondary" /> Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>AI ranks meals using demand and purchase behavior.</p>
            <p>Search suggestions adapt as you type.</p>
            <p>Recommendations update based on your order history.</p>
          </CardContent>
        </Card>

        <Card className="app-card">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Users className="size-5 text-accent" /> Support Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Active support via the Help Center for refunds and issues.</p>
            <p>Verified provider profiles and order-level reviews.</p>
            <p>Consistent communication from checkout to handoff.</p>
          </CardContent>
        </Card>
      </section>

      <section className="app-shell mt-12 grid gap-4 lg:grid-cols-2">
        <Card className="app-card">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">Can I cancel an order after placing it?</h3>
              <p className="text-muted-foreground">
                Yes. Orders in PREPARING state can be canceled from your order history.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do recommendations work?</h3>
              <p className="text-muted-foreground">
                Recommendations are generated from category preferences, order frequency, and trending patterns.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I order from multiple providers?</h3>
              <p className="text-muted-foreground">
                Yes. Meals from any listed provider can be ordered individually through checkout.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="app-card bg-primary/10">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <h2 className="text-2xl font-semibold">Get weekly meal discoveries</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Subscribe to receive top-rated dishes, new kitchens, and seasonal picks every week.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input placeholder="Enter your email" type="email" className="bg-background" />
                <Button>
                  Subscribe <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> Serving customers across major city neighborhoods.
            </div>
          </CardContent>
        </Card>
      </section>

      {selectedOrderForReview ? (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          orderId={selectedOrderForReview.id}
          mealName={selectedOrderForReview.meal?.name || ""}
          mealImage={selectedOrderForReview.meal?.imageUrl || ""}
          onReviewSubmitted={handleReviewSubmitted}
        />
      ) : null}
    </div>
  );
}
