
'use client';

import { ThemeProvider } from '@/context/theme-provider';
import { AppProvider as VisitDataAppProvider } from './provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <VisitDataAppProvider>
        {children}
      </VisitDataAppProvider>
    </ThemeProvider>
  );
}
