"use client";

import { CourseFiltersType } from "@/app/data/course/get-course-filters";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface CourseFiltersSidebarProps {
  filters: CourseFiltersType;
  selectedCategories: string[];
  selectedLevels: string[];
  selectedPrice: "all" | "free" | "paid";
  onCategoryChange: (categoryId: string) => void;
  onLevelChange: (level: string) => void;
  onPriceChange: (price: "all" | "free" | "paid") => void;
}

const CourseFiltersSidebar = ({
  filters,
  selectedCategories,
  selectedLevels,
  selectedPrice,
  onCategoryChange,
  onLevelChange,
  onPriceChange,
}: CourseFiltersSidebarProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Course Category */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Course Category</h3>
        <div className="space-y-3">
          {filters.categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onCategoryChange(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>{category.name}</span>
                <span className="text-muted-foreground">
                  {category.count}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Price</h3>
        <RadioGroup
          value={selectedPrice}
          onValueChange={(value) =>
            onPriceChange(value as "all" | "free" | "paid")
          }
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="price-all" />
              <Label
                htmlFor="price-all"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>All</span>
                <span className="text-muted-foreground">
                  {filters.prices.all}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="price-free" />
              <Label
                htmlFor="price-free"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>Free</span>
                <span className="text-muted-foreground">
                  {filters.prices.free}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="price-paid" />
              <Label
                htmlFor="price-paid"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>Paid</span>
                <span className="text-muted-foreground">
                  {filters.prices.paid}
                </span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Level */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Level</h3>
        <RadioGroup
          value={selectedLevels.length === 1 ? selectedLevels[0] : "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onLevelChange("all");
            } else {
              onLevelChange(value);
            }
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="level-all" />
              <Label
                htmlFor="level-all"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>All levels</span>
                <span className="text-muted-foreground">
                  {filters.allLevels}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Beginner" id="level-beginner" />
              <Label
                htmlFor="level-beginner"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>Beginner</span>
                <span className="text-muted-foreground">
                  {filters.levels.Beginner || 0}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Intermediate" id="level-intermediate" />
              <Label
                htmlFor="level-intermediate"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>Intermediate</span>
                <span className="text-muted-foreground">
                  {filters.levels.Intermediate || 0}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Advanced" id="level-advanced" />
              <Label
                htmlFor="level-advanced"
                className="flex-1 cursor-pointer flex items-center justify-between text-sm font-normal"
              >
                <span>Expert</span>
                <span className="text-muted-foreground">
                  {filters.levels.Advanced || 0}
                </span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default CourseFiltersSidebar;
