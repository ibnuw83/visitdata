
'use client';

import { UseToastReturn } from '@/hooks/use-toast';

export function handleFirestoreError(toast: UseToastReturn['toast'], error: { code: string, message: string }) {
    if (error.code === 'permission-denied') {
        toast({
            variant: 'destructive',
            title: 'Akses Firestore Ditolak 🔒',
            description: `Anda tidak memiliki izin untuk melakukan tindakan ini.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Kesalahan Firestore ⚠️',
            description: error.message || 'Terjadi kesalahan pada operasi Firestore.',
        });
    }
}
