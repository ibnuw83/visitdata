import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/session';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    // This should be handled by middleware, but as a fallback
    redirect('/');
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav user={user} />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
