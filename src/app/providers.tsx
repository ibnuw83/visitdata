
'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/context/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseClientProvider>
        {children}
        <Toaster />
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}

// Re-export hooks for convenience
export { useFirebaseApp, useFirestore, useAuth, useAuthUser } from '@/firebase/client-provider';
