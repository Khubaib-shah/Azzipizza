import React from "react";

/**
 * Premium skeleton loading placeholder for the standard ProductCard.
 * Adheres to the exact layout structure and style rules of the real ProductCard.
 */
const ProductCardSkeleton = () => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden animate-pulse">
      {/* Image Skeleton placeholder */}
      <div className="relative aspect-[4/3] bg-gray-200 shimmer overflow-hidden"></div>

      {/* Content Skeleton placeholders */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          {/* Title bar */}
          <div className="h-4 bg-gray-200 rounded-md w-3/4 shimmer"></div>
          {/* Rating bar */}
          <div className="h-4 bg-gray-200 rounded-md w-8 shimmer"></div>
        </div>

        {/* Description bars */}
        <div className="space-y-1.5 flex-grow mb-4">
          <div className="h-3 bg-gray-200 rounded-md w-full shimmer"></div>
          <div className="h-3 bg-gray-200 rounded-md w-5/6 shimmer"></div>
        </div>

        {/* Footer actions bar */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex flex-col gap-1">
            <div className="h-3 bg-gray-200 rounded-md w-8 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded-md w-12 shimmer"></div>
          </div>
          {/* Add-to-cart button placeholder */}
          <div className="w-8 h-8 rounded-full bg-gray-200 shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
