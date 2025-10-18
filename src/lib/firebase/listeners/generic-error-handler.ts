'use client';

import { NetworkError } from '../errors';
import { UseToastReturn } from '@/hooks/use-toast';

export function handleGenericError(toast: UseToastReturn['toast'], error: Error) {
  if (error instanceof NetworkError) {
    toast({
      variant: 'destructive',
      title: 'Koneksi Jaringan Hilang 🌐',
      description: 'Periksa koneksi internet Anda.',
    });
  } else {
    toast({
      variant: 'destructive',
      title: 'Kesalahan Tidak Dikenal ❗',
      description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
    });
  }
}
