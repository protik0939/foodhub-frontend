"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mealClientService } from "@/services/meal.client.service";
import { Category, Meal } from "@/types/meal.type";
import { toast } from "sonner";
import { Loader2, Plus, Search } from "lucide-react";
import Image from "next/image";

interface MealEditDialogProps {
  meal: Meal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MealEditDialog({
  meal,
  isOpen,
  onClose,
  onSuccess,
}: MealEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [formData, setFormData] = useState({
    name: meal.name,
    description: meal.description,
    price: meal.price.toString(),
    quantity: meal.quantity,
    imageUrl: meal.imageUrl,
    categoryId: meal.categoryId,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(meal.imageUrl);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setFormData({
        name: meal.name,
        description: meal.description,
        price: meal.price.toString(),
        quantity: meal.quantity,
        imageUrl: meal.imageUrl,
        categoryId: meal.categoryId,
      });
      setImagePreview(meal.imageUrl);
      setImageFile(null);
    }
  }, [isOpen, meal]);

  const fetchCategories = async (search?: string) => {
    try {
      const data = await mealClientService.getAllCategories(search);
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleSearchCategory = (value: string) => {
    setCategorySearch(value);
    fetchCategories(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const newCategory = await mealClientService.createCategory(
        newCategoryName,
        newCategoryDescription
      );
      toast.success("Category created successfully");
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, categoryId: newCategory.id });
      setShowNewCategoryDialog(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        setIsUploadingImage(true);
        imageUrl = await mealClientService.uploadToImgbb(imageFile);
        setIsUploadingImage(false);
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: formData.quantity,
        imageUrl,
        categoryId: formData.categoryId,
      };

      await mealClientService.updateMeal(meal.id, updateData);
      toast.success("Meal updated successfully");
      onClose();
      onSuccess();
    } catch (error) {
      toast.error("Failed to update meal");
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
            <DialogDescription>
              Update your food item details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="e.g., 1 plate, 500g"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Dialog
                  open={showNewCategoryDialog}
                  onOpenChange={setShowNewCategoryDialog}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newCategoryName">Category Name</Label>
                        <Input
                          id="newCategoryName"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newCategoryDescription">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="newCategoryDescription"
                          value={newCategoryDescription}
                          onChange={(e) =>
                            setNewCategoryDescription(e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleCreateCategory}
                        className="w-full"
                      >
                        Create Category
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => handleSearchCategory(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Meal Image (Optional - leave empty to keep current)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                    height={192}
                    width={384}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImage ? "Uploading Image..." : "Updating..."}
                  </>
                ) : (
                  "Update Meal"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
