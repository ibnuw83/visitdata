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
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { BarChart2, Edit, KeyRound, LayoutDashboard, Settings, FileText, Landmark, Users, FolderTree, Lightbulb } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard, roles: ['admin', 'pengelola'] },
  { href: '/categories', label: 'Kategori Wisata', icon: FolderTree, roles: ['admin'] },
  { href: '/destinations', label: 'Destinasi', icon: Landmark, roles: ['admin'] },
  { href: '/data-entry', label: 'Input Data', icon: Edit, roles: ['pengelola', 'admin'] },
  { href: '/reports', label: 'Laporan', icon: FileText, roles: ['admin', 'pengelola'] },
  { href: '/unlock-requests', label: 'Permintaan Revisi', icon: KeyRound, roles: ['admin'] },
  { href: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
];

const bottomMenuItems = [
    { href: '/settings', label: 'Pengaturan', icon: Settings, roles: ['admin', 'pengelola'] },
]

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [appTitle, setAppTitle] = useState('VisitData Hub');
  const [footerText, setFooterText] = useState('© 2024 VisitData Hub');

  useEffect(() => {
    // Ensure this runs only on the client
    const savedTitle = localStorage.getItem('appTitle');
    const savedFooter = localStorage.getItem('appFooter');
    if (savedTitle) setAppTitle(savedTitle);
    if (savedFooter) setFooterText(savedFooter);

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
  }, []);

  if (!user) {
    return null;
  }

  const isUserInRole = (roles: string[]) => roles.includes(user.role);

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold font-headline">{appTitle}</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.filter(item => isUserInRole(item.roles)).map((item) => (
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
        <SidebarMenu>
            {bottomMenuItems.filter(item => isUserInRole(item.roles)).map((item) => (
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
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
