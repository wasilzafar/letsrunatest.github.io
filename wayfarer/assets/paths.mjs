export function normalizeBasePath(value = "/") {
  if (typeof value !== "string" || !/^\/(?:[A-Za-z0-9_-]+\/?)*$/.test(value) ||
      value.includes("//")) {
    throw new Error("BASE_PATH must be an absolute path of plain URL segments, such as /wayfarer/");
  }
  return value === "/" ? "/" : `${value.replace(/\/$/, "")}/`;
}

export function sitePath(basePath, path = "/") {
  const base = normalizeBasePath(basePath);
  if (!/^\/[A-Za-z0-9_./-]*$/.test(path) ||
      path.includes("//") || path.split("/").some(segment => segment === "." || segment === "..")) {
    throw new Error("Invalid site route");
  }
  return `${base}${path.slice(1)}`;
}
