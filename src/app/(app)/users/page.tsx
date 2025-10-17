'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers } from '@/lib/local-data-service';
import type { User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const getAvatar = (avatarId: string) => {
    return PlaceHolderImages.find(p => p.id === avatarId);
  }

  const statusVariant = {
      aktif: "default",
      nonaktif: "destructive",
  } as const;
  
  const roleVariant = {
      admin: "secondary",
      pengelola: "outline",
  } as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola pengguna (admin dan pengelola) di sini.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription>Berikut adalah daftar semua pengguna yang terdaftar di sistem.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pengguna</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Peran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => {
                      const userImage = getAvatar(user.avatar);
                      return (
                        <TableRow key={user.uid}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={userImage?.imageUrl} alt={user.name} data-ai-hint={userImage?.imageHint}/>
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Actions like Edit/Delete would go here */}
                            </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
