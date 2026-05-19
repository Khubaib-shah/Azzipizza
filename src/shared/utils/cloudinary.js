/**
 * Dynamically optimizes Cloudinary image URLs for high performance.
 * Leverages Cloudinary's dynamic CDN transformations (f_auto, q_auto, w_width)
 * to deliver resized, highly compressed, modern image formats (AVIF/WebP) based on screen/container needs.
 *
 * @param {string} url - The original image URL
 * @param {number} width - The target width for the image
 * @returns {string} The optimized image URL
 */
export const getOptimizedImageUrl = (url, width = 500) => {
  if (!url || typeof url !== "string") return url || "";

  // Only apply transformations to Cloudinary hosted images
  if (!url.includes("cloudinary.com")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const [before, after] = parts;
  const afterParts = after.split("/");

  // Check if the first part is a transformation block (has underscore or comma and isn't a version string like v12345678)
  const firstSegment = afterParts[0];
  const hasTransformations = firstSegment.includes("_") || firstSegment.includes(",");
  const isVersion = /^v\d+$/.test(firstSegment);

  let cleanAfter = after;
  if (hasTransformations && !isVersion) {
    // Remove the old custom transformation segment
    afterParts.shift();
    cleanAfter = afterParts.join("/");
  }

  // Inject highly optimized parameters:
  // f_auto: automatic format (AVIF/WebP/etc)
  // q_auto: automatic compression quality
  // w_width: dynamic resizing
  // c_scale: scale smoothly to fit width
  return `${before}/upload/f_auto,q_auto,w_${width},c_scale/${cleanAfter}`;
};
