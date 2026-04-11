import React from "react";

export const SkeletonStreamCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-video rounded-lg bg-muted mb-2" />
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="h-2.5 bg-muted rounded w-2/5" />
        <div className="flex gap-1 mt-1">
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-4 w-10 bg-muted rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonCategoryCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] rounded-lg bg-muted mb-2" />
    <div className="h-3.5 bg-muted rounded w-3/4 mb-1" />
    <div className="h-3 bg-muted rounded w-1/2" />
  </div>
);
