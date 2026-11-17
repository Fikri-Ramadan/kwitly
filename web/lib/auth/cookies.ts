export const AT = 'at';
export const RT = 'rt';
export const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameStie: 'lax' as const,
  path: '/'
}
export const RT_MAX_AGE = 7 * 24 * 60 * 60;