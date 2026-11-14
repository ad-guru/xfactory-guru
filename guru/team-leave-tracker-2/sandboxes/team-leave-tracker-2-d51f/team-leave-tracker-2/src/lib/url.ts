// The proxy mounts the app at …/app/ or …/app/<port>/; "/" when opened directly.
const MOUNT = /^.*?\/(?:sandboxes|deployments|projects)\/[^/]+\/app(?:\/\d+)?(?=\/|$)/;

export function appRoot(): string {
  const m = window.location.pathname.match(MOUNT);
  return m ? `${m[0]}/` : "/";
}

export function apiUrl(path: string): URL {
  return new URL(path.replace(/^\/+/, ""), window.location.origin + appRoot());
}
