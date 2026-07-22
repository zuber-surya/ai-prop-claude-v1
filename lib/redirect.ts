/**
 * Only allow same-origin relative paths for post-login redirects (the
 * `next` param proxy.ts sets when bouncing an unauthenticated visitor to
 * /login). Without this guard, `?next=https://evil.example` would be an
 * open redirect after a successful login.
 */
export function getSafeRedirect(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/"; // protocol-relative URL, e.g. //evil.example
  return next;
}
