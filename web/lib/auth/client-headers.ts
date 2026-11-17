export function clientHeaders(h: Headers) {
  const ip = (h.get('x-vercel-forwarded-for') ?? h.get('x-forwarded-for') ?? '').split(',')[0].trim();
  return { 'x-client-ip': ip, 'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '' };
}