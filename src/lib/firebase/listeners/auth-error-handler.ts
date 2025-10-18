
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
    case 'auth/email-already-in-use':
        toast({
            variant: 'destructive',
            title: 'Email Sudah Digunakan',
            description: 'Email ini sudah terdaftar. Silakan gunakan email lain.',
        });
        break;
     case 'auth/weak-password':
        toast({
            variant: 'destructive',
            title: 'Kata Sandi Lemah',
            description: 'Kata sandi harus terdiri dari setidaknya 6 karakter.',
        });
        break;
    default:
      toast({
        variant: 'destructive',
        title: 'Kesalahan Autentikasi ⚠️',
        description: error.message || 'Terjadi kesalahan saat proses autentikasi.',
      });
  }
}

    