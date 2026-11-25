export { cn } from "cn"

export const safeNext = (v?: string | null, fallback = '/dashboard'): string => {
  if (!v) return fallback;
  return v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\')
    ? v
    : fallback;
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));