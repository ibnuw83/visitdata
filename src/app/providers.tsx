
'use client';

import { ThemeProvider } from '@/context/theme-provider';
import { FirebaseClientProvider } from '@/lib/firebase/client-provider';

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
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
