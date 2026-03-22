const DEFAULT_PRODUCT_FALLBACK = "https://placehold.co/400x400?text=Bike+Part";

function getApiOrigin(): string {
  const apiUrl = (import.meta.env.VITE_API_URL || "/api").trim();
  if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
    return apiUrl.replace(/\/api\/?$/i, "");
  }
  return "";
}

export function resolveMediaUrl(input?: string | null, fallback = DEFAULT_PRODUCT_FALLBACK): string {
  if (!input) return fallback;

  const raw = input.trim();
  if (!raw) return fallback;

  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  const apiOrigin = getApiOrigin();
  const normalized = raw.replace(/\\/g, "/");

  let withoutApiPrefix = normalized.startsWith("/api/uploads/")
    ? normalized.replace("/api/uploads/", "/uploads/")
    : normalized;

  const uploadPos = withoutApiPrefix.toLowerCase().indexOf("uploads/");
  if (uploadPos > 0) {
    withoutApiPrefix = `/${withoutApiPrefix.slice(uploadPos)}`;
  }

  const absolutePath = withoutApiPrefix.startsWith("/") ? withoutApiPrefix : `/${withoutApiPrefix}`;

  return apiOrigin ? `${apiOrigin}${absolutePath}` : absolutePath;
}

export function resolveProductImage(
  product: { image?: string | null; images?: string[] },
  fallback = DEFAULT_PRODUCT_FALLBACK
): string {
  const img = product.image || product.images?.[0] || null;
  return resolveMediaUrl(img, fallback);
}