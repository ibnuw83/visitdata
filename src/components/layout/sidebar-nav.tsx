
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { BarChart2, Edit, KeyRound, LayoutDashboard, Settings, FileText, Landmark, Users, FolderTree } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { getUnlockRequests } from '@/lib/local-data-service';

const menuItems = [
  { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard, roles: ['admin', 'pengelola'] },
  { href: '/data-entry', label: 'Input Data', icon: Edit, roles: ['pengelola', 'admin'] },
  { href: '/reports', label: 'Laporan', icon: FileText, roles: ['admin', 'pengelola'] },
  { href: '/categories', label: 'Kategori Wisata', icon: FolderTree, roles: ['admin'] },
  { href: '/destinations', label: 'Destinasi', icon: Landmark, roles: ['admin'] },
  { href: '/unlock-requests', label: 'Permintaan Revisi', icon: KeyRound, roles: ['admin'], id: 'unlock-requests' },
  { href: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
  { href: '/settings', label: 'Pengaturan', icon: Settings, roles: ['admin', 'pengelola'] },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [appTitle, setAppTitle] = useState('VisitData Hub');
  const [footerText, setFooterText] = useState('© 2024 VisitData Hub');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    // Ensure this runs only on the client
    const savedTitle = localStorage.getItem('appTitle');
    const savedFooter = localStorage.getItem('appFooter');
    if (savedTitle) setAppTitle(savedTitle);
    if (savedFooter) setFooterText(savedFooter);

    if (user?.role === 'admin') {
      const requests = getUnlockRequests();
      const pendingCount = requests.filter(req => req.status === 'pending').length;
      setPendingRequestsCount(pendingCount);
    }

    const handleStorageChange = () => {
      const newTitle = localStorage.getItem('appTitle');
      const newFooter = localStorage.getItem('appFooter');
      if (newTitle) setAppTitle(newTitle);
      if (newFooter) setFooterText(newFooter);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  if (!user) {
    return null;
  }

  const isUserInRole = (roles: string[]) => roles.includes(user.role);
  
  const accessibleMenuItems = menuItems.filter(item => isUserInRole(item.roles));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-semibold font-headline">{appTitle}</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {accessibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                href={item.href}
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href} className='flex items-center gap-2'>
                  <item.icon />
                  <span>{item.label}</span>
                   {item.id === 'unlock-requests' && pendingRequestsCount > 0 && (
                      <SidebarMenuBadge>{pendingRequestsCount}</SidebarMenuBadge>
                   )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
         <div className="px-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {footerText}
        </div>
      </SidebarFooter>
    </>
  );
}
