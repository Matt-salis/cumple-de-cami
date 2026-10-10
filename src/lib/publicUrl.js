export function publicUrl(path) {
  const base = import.meta.env.BASE_URL || "/";
  const clean = String(path || "").replace(/^\//, "");
  return `${base.endsWith("/") ? base : `${base}/`}${clean}`;
}
