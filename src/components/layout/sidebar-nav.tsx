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
import { Edit, KeyRound, LayoutDashboard, Settings, FileText, Landmark, Users, FolderTree } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useEffect, useMemo } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import type { UnlockRequest, AppSettings } from '@/lib/types';


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
  const { appUser } = useUser();
  const firestore = useFirestore();

  const requestsQuery = useMemo(() => {
    if (!firestore || !appUser || appUser.role !== 'admin') return null;
    return query(collection(firestore, 'unlock-requests'), where('status', '==', 'pending'));
  }, [firestore, appUser]);

  const settingsRef = useMemo(() => firestore ? doc(firestore, 'settings/app') : null, [firestore]);

  const { data: pendingRequests } = useCollection<UnlockRequest>(requestsQuery);
  const { data: settings } = useDoc<AppSettings>(settingsRef);

  const pendingRequestsCount = pendingRequests?.length || 0;
  const appTitle = settings?.appTitle || 'VisitData Hub';
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} VisitData Hub`;

  useEffect(() => {
    if (settings?.logoUrl) {
      localStorage.setItem('logoUrl', settings.logoUrl);
      window.dispatchEvent(new Event('storage'));
    }
  }, [settings?.logoUrl]);

  if (!appUser) {
    return null;
  }

  const isUserInRole = (roles: string[]) => appUser.role && roles.includes(appUser.role);
  
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
