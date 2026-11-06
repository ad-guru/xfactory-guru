export function apiUrl(path: string): URL {
  const raw = document.baseURI;
  return new URL(path, raw.endsWith("/") ? raw : `${raw}/`);
}
