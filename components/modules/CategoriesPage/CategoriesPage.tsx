import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Category } from '@/types/meal.type'
import Link from 'next/link';
import React from 'react'

interface TCategoriesPageProps {
    categories: Category[];
}

export default function CategoriesPage({ categories }: TCategoriesPageProps) {


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Meal Categories</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Link href={`/categories/${category.id}`} key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group:">
                        <Card>
                            <CardContent className="p-4">
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <CardTitle className="text-xl mb-2 group-hover:text-amber-500">{category.name}</CardTitle>
                                        <CardDescription className="line-clamp-3">
                                            {category.description}
                                        </CardDescription>
                                    </div>
                                    <Button className='cursor-pointer'>See More</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
