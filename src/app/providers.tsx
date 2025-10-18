
'use client';

import { ThemeProvider } from '@/context/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/context/auth-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseClientProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
