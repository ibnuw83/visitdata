'use client';

import { FirestorePermissionError, FirestoreGenericError } from '../errors';
import { UseToastReturn } from '@/hooks/use-toast';

export function handleFirestoreError(toast: UseToastReturn['toast'], error: Error) {
  if (error instanceof FirestorePermissionError) {
    const { path, operation } = error.context || {};
    const readableOp =
      operation === 'list'
        ? 'membaca data'
        : operation === 'write'
        ? 'menulis data'
        : operation === 'create'
        ? 'membuat data'
        : operation === 'update'
        ? 'memperbarui data'
        : operation === 'delete'
        ? 'menghapus data'
        : 'mengakses Firestore';

    toast({
      variant: 'destructive',
      title: 'Akses Firestore Ditolak 🔒',
      description: `Tidak memiliki izin untuk ${readableOp} pada path: ${path || '(tidak diketahui)'}.`,
    });
  } else if (error instanceof FirestoreGenericError) {
    toast({
      variant: 'destructive',
      title: 'Kesalahan Firestore ⚠️',
      description: error.message || 'Terjadi kesalahan pada operasi Firestore.',
    });
  }
}
