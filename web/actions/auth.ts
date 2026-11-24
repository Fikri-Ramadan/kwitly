'use server';

import { authFetch } from "@/lib/auth/auth-fetch";
import { deleteVerifEmail, setVerifEmail } from "@/lib/auth/verifEmail";
import { forgotPasswordSchema, FormState, resetPasswordSchema, signupFormSchema } from "@/lib/definitions";
import z from "zod";

export type ResendResult = {
  success: boolean;
  message: string;
  seconds?: number;
  alreadyVerified?: boolean;
};

const TOO_MANY = 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');

const safeNext = (v: string) => (v.startsWith('/') && !v.startsWith('//') ? v : '/dashboard');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signUp(formData: FormData): Promise<FormState> {
  const rawData = {
    name: formData.get('name') as string,
    company: formData.get('company') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedFields = signupFormSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  });

  if (!validatedFields.success) {
    return {
      inputs: rawData,
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const res = await authFetch('/auth/register', {
    name: rawData.name,
    company: rawData.company,
    email: rawData.email,
    password: rawData.password,
  });

  if (!res.ok) {
    if (res.status === 409) return { success: false, message: `Email ${rawData.email} sudah terdaftar.` };
    if (res.status === 429) return { success: false, message: TOO_MANY };
    return { success: false, message: res.message };
  }

  await setVerifEmail({ ...rawData });
  return { success: true, message: 'Pendaftaran berhasil.' };
}

export async function forgotPassword(formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;

  const validatedFields = forgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      inputs: { email },
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const res = await authFetch('/auth/forgot-password', {
    email
  });

  if (!res.ok) {
    if (res.status === 429) return { success: false, seconds: res.seconds, message: TOO_MANY };
    return { success: false, message: res.message };
  }

  return { success: true, message: 'Link berhasil terkirim' };
}

export async function resetPassword(formData: FormData, token: string): Promise<FormState> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validatedFields = resetPasswordSchema.safeParse({
    password, confirmPassword
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const res = await authFetch('/auth/reset-password', {
    token, password
  });

  if (!res.ok) {
    if (res.status === 429) return { success: false, seconds: res.seconds, message: TOO_MANY };
    return { success: false, message: res.message };
  }
  return { success: true, message: 'Kata sandi berhasil diubah' };
}

export async function verifyEmail(token: string): Promise<FormState> {
  const res = await authFetch<{ seconds: number; }>('/auth/verify-email', {
    token
  });

  if (!res.ok) {
    if (res.status === 429) return { success: false, seconds: res.seconds, message: TOO_MANY };
    return { success: false, message: res.message };
  }

  return { success: true, message: 'Verifikasi email berhasil' };
}

export async function resendVerificationMail(email: string): Promise<ResendResult> {
  const res = await authFetch<{ seconds: number; alreadyVerified: boolean; }>('/auth/send-mail', {
    type: "EMAIL_VERIFY",
    email
  });

  if (!res.ok) {
    if (res.status === 429) return { success: false, seconds: res.seconds, message: TOO_MANY };
    return { success: false, message: res.message };
  }

  if (res.data?.alreadyVerified) {
    await deleteVerifEmail();
    return { success: true, alreadyVerified: true, message: 'Email sudah terverifikasi' };
  }

  return { success: true, seconds: res.data.seconds, message: 'Link berhasil terkirim. Cek email kamu untuk verifikasi (berlaku 24 jam).' };
}

export async function requestMagicLink(formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;

  const validatedFields = forgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      inputs: { email },
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  const res = await authFetch('/auth/magic-link', {
    email
  });

  if (!res.ok) {
    if (res.status === 429) return { success: false, seconds: res.seconds, message: TOO_MANY };
    return { success: false, message: res.message };
  }

  return { success: true, message: 'Link berhasil terkirim ke email anda' };
}