"use client";

import { useEffect, useMemo, useState } from "react";
import { mealClientService } from "@/services/meal.client.service";
import { Category, Meal, SearchSuggestion } from "@/types/meal.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import MealCard from "@/components/modules/meal/MealCard";

const PAGE_SIZE = 8;

export default function ExploreMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [maxPrice, setMaxPrice] = useState("200");
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allMeals, allCategories] = await Promise.all([
          mealClientService.getAllMeals(),
          mealClientService.getAllCategories(),
        ]);

        setMeals(allMeals);
        setCategories(allCategories);

        const ratingEntries = await Promise.all(
          allMeals.map(async (meal) => {
            try {
              const stats = await mealClientService.getReviewStats(meal.id);
              return [meal.id, stats.averageRating] as const;
            } catch {
              return [meal.id, 0] as const;
            }
          }),
        );

        setRatings(Object.fromEntries(ratingEntries));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await mealClientService.getSearchSuggestions(query);
        setSuggestions(response);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [query, categoryId, maxPrice, minRating, sortBy]);

  const filteredMeals = useMemo(() => {
    const maxPriceValue = Number(maxPrice);
    const minRatingValue = Number(minRating);
    const lowerQuery = query.trim().toLowerCase();

    let list = [...meals];

    if (lowerQuery) {
      list = list.filter(
        (meal) =>
          meal.name.toLowerCase().includes(lowerQuery) ||
          meal.description.toLowerCase().includes(lowerQuery) ||
          meal.category?.name.toLowerCase().includes(lowerQuery) ||
          meal.provider?.providerName?.toLowerCase().includes(lowerQuery),
      );
    }

    if (categoryId !== "all") {
      list = list.filter((meal) => meal.categoryId === categoryId);
    }

    list = list.filter((meal) => meal.price <= maxPriceValue);
    list = list.filter((meal) => (ratings[meal.id] || 0) >= minRatingValue);

    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-high") {
      list.sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0));
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return list;
  }, [categoryId, maxPrice, meals, minRating, query, ratings, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMeals.length / PAGE_SIZE));
  const paginatedMeals = filteredMeals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const content = (() => {
    if (loading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={`explore-skeleton-${index}`} className="h-105 rounded-2xl" />
          ))}
        </div>
      );
    }

    if (paginatedMeals.length === 0) {
      return (
        <Card className="app-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            No meals found for this filter combination.
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {paginatedMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onOrder={() => undefined} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {filteredMeals.length} results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
              Previous
            </Button>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
              Next
            </Button>
          </div>
        </div>
      </>
    );
  })();

  return (
    <div className="app-shell py-10">
      <div className="mb-6 flex flex-col gap-3">
        <Badge className="w-max">Explore</Badge>
        <h1 className="text-4xl font-semibold">Find meals with smart filters</h1>
        <p className="text-muted-foreground">
          Search by meal name, category, provider, price, and rating. Suggestions update as you type.
        </p>
      </div>

      <Card className="app-card mb-6">
        <CardHeader>
          <CardTitle>Search, Filter, and Sort</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSuggestionOpen(true);
              }}
              onFocus={() => setSuggestionOpen(true)}
              onBlur={() => setTimeout(() => setSuggestionOpen(false), 120)}
              className="pl-9"
              placeholder="Search meals, cuisines, or kitchens"
            />
            {suggestionOpen && suggestions.length > 0 ? (
              <div className="absolute z-20 mt-2 w-full rounded-xl border bg-background p-2 shadow-xl">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="flex w-full justify-between rounded-lg px-3 py-2 text-left hover:bg-muted"
                    onMouseDown={() => {
                      setQuery(suggestion.label);
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

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={maxPrice} onValueChange={setMaxPrice}>
            <SelectTrigger>
              <SelectValue placeholder="Max price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">Up to $15</SelectItem>
              <SelectItem value="30">Up to $30</SelectItem>
              <SelectItem value="50">Up to $50</SelectItem>
              <SelectItem value="100">Up to $100</SelectItem>
              <SelectItem value="200">Any price</SelectItem>
            </SelectContent>
          </Select>

          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder="Min rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="2">2+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to high</SelectItem>
              <SelectItem value="price-high">Price: High to low</SelectItem>
              <SelectItem value="rating-high">Rating: High to low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {content}
    </div>
  );
}
