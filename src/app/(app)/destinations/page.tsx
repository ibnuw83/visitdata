'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDestinations, saveDestinations } from "@/lib/local-data-service";
import type { Destination } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Landmark, MoreHorizontal, FilePenLine, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    setDestinations(getDestinations());
  }, []);

  const handleToggleStatus = (destinationId: string) => {
    const updatedDestinations = destinations.map(dest => {
      if (dest.id === destinationId) {
        return { ...dest, status: dest.status === 'aktif' ? 'nonaktif' : 'aktif' };
      }
      return dest;
    });
    setDestinations(updatedDestinations);
    saveDestinations(updatedDestinations);
    const updatedDest = updatedDestinations.find(d => d.id === destinationId);
    toast({
      title: "Status Diperbarui",
      description: `Status destinasi "${updatedDest?.name}" sekarang ${updatedDest?.status}.`,
    });
  };

  const handleDelete = (destinationId: string) => {
    const destinationName = destinations.find(d => d.id === destinationId)?.name;
    const updatedDestinations = destinations.filter(dest => dest.id !== destinationId);
    setDestinations(updatedDestinations);
    saveDestinations(updatedDestinations);
    toast({
      title: "Destinasi Dihapus",
      description: `Destinasi "${destinationName}" telah dihapus.`,
    });
  };
  
  const handleEdit = (destinationName: string) => {
     toast({
      title: `Aksi: Edit`,
      description: `Anda memilih Edit untuk destinasi ${destinationName}. (Fungsi belum diimplementasikan)`,
    });
  }

  const statusVariant: { [key in Destination['status']]: "default" | "destructive" } = {
    aktif: "default",
    nonaktif: "destructive",
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Destinasi</h1>
        <p className="text-muted-foreground">
          Kelola destinasi wisata di sini.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Daftar Destinasi</CardTitle>
            <CardDescription>Berikut adalah semua destinasi yang terdaftar dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Destinasi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {destinations.map(dest => (
                        <TableRow key={dest.id}>
                            <TableCell className="font-medium">
                               <div className="flex items-center gap-3">
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                                <span>{dest.name}</span>
                               </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{dest.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{dest.location}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[dest.status]} className="capitalize">{dest.status}</Badge>
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
                                            <DropdownMenuItem onClick={() => handleEdit(dest.name)}>
                                                <FilePenLine className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(dest.id)}>
                                                {dest.status === 'aktif' ? (
                                                    <><ToggleLeft className="mr-2 h-4 w-4" /><span>Nonaktifkan</span></>
                                                ) : (
                                                    <><ToggleRight className="mr-2 h-4 w-4" /><span>Aktifkan</span></>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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
                                                Tindakan ini akan menghapus destinasi <span className="font-bold">"{dest.name}"</span> secara permanen. Tindakan ini tidak dapat diurungkan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(dest.id)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                 </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}