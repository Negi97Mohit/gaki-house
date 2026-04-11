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
      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-2.5 relative">
        {!imgError && category.thumbnail ? (
          <img
            src={category.thumbnail}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/60 font-medium text-center px-2">{category.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <p className="text-sm text-foreground font-semibold truncate group-hover:text-primary transition-colors duration-200">{category.name}</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">
        {formatViewerCount(category.viewers)} watching
      </p>
      {category.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {category.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-muted/50 text-muted-foreground/70 text-[10px] rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
