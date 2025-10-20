
'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { user, appUser, isLoading } = useUser();
  const router = useRouter();

  // This effect handles redirection based on authentication status.
  useEffect(() => {
    // After loading is complete, if there is no authenticated user object, redirect to login.
    if (!isLoading && !user) {
        router.replace('/login');
    }
  }, [user, isLoading, router]);

  // While the authentication state and user profile are being fetched, show a skeleton.
  // This is the primary gate to prevent premature rendering or redirection.
  if (isLoading) {
    return <AppLayoutSkeleton />;
  }
  
  // After loading, if there's still no authenticated user (which means they need to be redirected),
  // or if for some reason there's an auth user without a corresponding appUser document (which can happen briefly
  // or in an error state), render null to prevent a flash of content before the redirect effect runs.
  // The logic in the useEffect hook is the source of truth for redirection.
  if (!user) {
    return null;
  }
  
  // If we have a user and their profile, render the full app layout.
  // The check for appUser is now implicitly handled by allowing rendering to proceed
  // if isLoading is false and a user object exists. The useUser hook ensures
  // appUser will be populated if the user is valid.
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
