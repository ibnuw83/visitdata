'use client';

import { AuthError } from '../errors';
import { UseToastReturn } from '@/hooks/use-toast';

export function handleAuthError(toast: UseToastReturn['toast'], error: Error) {
  if (!(error instanceof AuthError)) return;

  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      toast({
        variant: 'destructive',
        title: 'Login Gagal 🚫',
        description: 'Email atau kata sandi salah.',
      });
      break;
    case 'auth/network-request-failed':
      toast({
        variant: 'destructive',
        title: 'Koneksi Terputus 🌐',
        description: 'Periksa jaringan Anda dan coba lagi.',
      });
      break;
    default:
      toast({
        variant: 'destructive',
        title: 'Kesalahan Autentikasi ⚠️',
        description: error.message || 'Terjadi kesalahan saat login.',
      });
  }
}
