'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsers, saveUsers } from '@/lib/local-data-service';
import type { User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MoreHorizontal, FilePenLine, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const getAvatar = (avatarId: string) => {
    return PlaceHolderImages.find(p => p.id === avatarId);
  }

  const handleEditClick = (userName: string) => {
    toast({
      title: `Aksi: Edit`,
      description: `Anda memilih Edit untuk pengguna ${userName}. (Fungsi belum diimplementasikan)`,
    });
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.uid === userId);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.uid !== userId);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    toast({
      title: "Pengguna Dihapus",
      description: `Pengguna "${userToDelete.name}" telah berhasil dihapus.`,
    });
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
                                <AlertDialog>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Buka menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleEditClick(user.name)}>
                                              <FilePenLine className="mr-2 h-4 w-4" />
                                              <span>Edit</span>
                                          </DropdownMenuItem>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Hapus</span>
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tindakan ini akan menghapus pengguna <span className="font-bold">"{user.name}"</span> secara permanen. Tindakan ini tidak dapat diurungkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Batal</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
