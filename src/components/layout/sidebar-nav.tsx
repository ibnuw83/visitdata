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
import { User } from '@/lib/types';

const menuItems = [
  { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard, roles: ['admin', 'pengelola'] },
  { href: '/categories', label: 'Kategori Wisata', icon: FolderTree, roles: ['admin'] },
  { href: '/destinations', label: 'Destinasi', icon: Landmark, roles: ['admin'] },
  { href: '/data-entry', label: 'Input Data', icon: Edit, roles: ['pengelola'] },
  { href: '/reports', label: 'Laporan', icon: FileText, roles: ['admin', 'pengelola'] },
  { href: '/ai-suggestions', label: 'Saran AI', icon: Lightbulb, roles: ['admin'] },
  { href: '/unlock-requests', label: 'Permintaan Revisi', icon: KeyRound, roles: ['admin'] },
  { href: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
];

const bottomMenuItems = [
    { href: '/settings', label: 'Pengaturan', icon: Settings, roles: ['admin', 'pengelola'] },
]

export default function SidebarNav({ user }: { user: User }) {
  const pathname = usePathname();

  const isUserInRole = (roles: string[]) => roles.includes(user.role);

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold font-headline">VisitData Hub</span>
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
