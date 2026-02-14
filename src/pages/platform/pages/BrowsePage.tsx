import React from "react";
import { MOCK_CATEGORIES } from "../data/mockData";
import { CategoryCard } from "../components/CategoryCard";

export const BrowsePage: React.FC = () => {
  return (
    <div className="p-6 pb-12">
      <h1 className="text-2xl font-bold text-foreground mb-1">Browse</h1>
      <p className="text-muted-foreground text-sm mb-6">Explore top categories and live channels</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5">
        {MOCK_CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};
