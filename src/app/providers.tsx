
'use client';

import { ThemeProvider } from '@/context/theme-provider';
import { FirebaseClientProvider } from '@/lib/firebase/client-provider';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';

function InitialLoadingScreen() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
                <Logo className="h-10 w-10 animate-pulse" />
            </div>
            <p className="text-muted-foreground">Menginisialisasi aplikasi...</p>
        </div>
    )
}

function AuthGate({ children }: { children: React.ReactNode }) {
    const { isInitializing } = useAuth();

    if (isInitializing) {
        return <InitialLoadingScreen />;
    }

    return <>{children}</>;
}

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
            <AuthGate>
                {children}
            </AuthGate>
        </AuthProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
