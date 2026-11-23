import 'server-only';
import { cookieBase, decryptCookie, encryptCookie, VE, VE_MAX_AGE } from "./cookies";
import { cookies } from 'next/headers';
import { cache } from 'react';

export type VerifEmail = {
  email: string;
  name: string;
  company?: string;
};

export async function setVerifEmail(payload: Record<string, unknown>) {
  const jar = await cookies();
  const encryptedData = await encryptCookie({ ...payload }, VE_MAX_AGE);
  jar.set(VE, encryptedData, { ...cookieBase, maxAge: VE_MAX_AGE });
}

export async function deleteVerifEmail() {
  const jar = await cookies();
  jar.delete(VE);
}

export const getVerifEmail = cache(async (): Promise<VerifEmail | null> => {
  const emailCookie = (await cookies()).get(VE)?.value;
  const decryptedEmailCookie = await decryptCookie(emailCookie) as VerifEmail;

  if (!decryptedEmailCookie || !decryptedEmailCookie.email || !decryptedEmailCookie.name) {
    return null;
  }

  return {
    email: decryptedEmailCookie.email,
    name: decryptedEmailCookie.name,
    company: decryptedEmailCookie?.company
  };
});