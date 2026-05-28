/**
 * Simple utility to join class names, filtering out falsy values.
 * Avoids the clsx/tailwind-merge dependency for minimal setup.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
