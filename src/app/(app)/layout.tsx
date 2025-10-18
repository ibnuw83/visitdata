
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/firebase/auth/use-user';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthUser } from '@/lib/firebase/client-provider';

function AppLayoutSkeleton() {
  return (
    <SidebarProvider>
      <Sidebar>
        <div className="flex flex-col h-full p-2 gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-px w-full" />
          <div className="flex-1 p-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="ml-auto flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72" />
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuthUser();
  const { appUser, isLoading: isAppUserLoading } = useUser();
  const router = useRouter();

  // Redirect if not logged in and loading is complete
  useEffect(() => {
    // Wait until the initial auth check is finished
    if (!isAuthLoading) {
        // If there's no authenticated user, redirect to login
        if (!user) {
            router.replace('/login');
        } 
        // If there is an authenticated user, but we've checked for appUser and it's null
        // (e.g., user deleted from Firestore but not Auth), also redirect.
        else if (!isAppUserLoading && !appUser) {
            router.replace('/login');
        }
    }
  }, [user, isAuthLoading, appUser, isAppUserLoading, router]);

  // Show loading skeleton while checking auth or fetching user profile data.
  // The `!appUser` check is crucial to wait for the Firestore profile.
  if (isAuthLoading || (user && !appUser)) {
    return <AppLayoutSkeleton />;
  }
  
  // If we're done loading and there's still no user, we'll be redirected by the useEffect.
  // Render nothing to avoid a flash of the layout.
  if (!user) {
    return null;
  }

  // If we have a user and their profile, show the full app layout.
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
