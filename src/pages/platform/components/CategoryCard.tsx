import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Category, formatViewerCount } from "../data/mockData";

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/platform/browse/${category.slug}`}
      className="group block"
    >
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-2 relative">
        {!imgError && category.thumbnail ? (
          <img
            src={category.thumbnail}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium text-center px-2">{category.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <p className="text-base text-foreground font-semibold truncate">{category.name}</p>
      <p className="text-[13px] text-muted-foreground">
        {formatViewerCount(category.viewers)} watching
      </p>
      {category.tags.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {category.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[11px] rounded font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
