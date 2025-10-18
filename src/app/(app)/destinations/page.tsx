
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Removed local-data-service
import type { Destination, Category } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Landmark, MoreHorizontal, FilePenLine, Trash2, ToggleLeft, ToggleRight, PlusCircle, Building, Mountain } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const colorPalette = [
    "text-blue-600",
    "text-green-600",
    "text-orange-500",
    "text-purple-600",
    "text-red-600",
    "text-yellow-600",
    "text-pink-600",
    "text-indigo-600",
];

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newDestinationName, setNewDestinationName] = useState('');
  const [newDestinationCategory, setNewDestinationCategory] = useState('');
  const [newDestinationLocation, setNewDestinationLocation] = useState('');
  const [newDestinationManagement, setNewDestinationManagement] = useState<'pemerintah' | 'swasta' | ''>('');
  const [newDestinationImageUrl, setNewDestinationImageUrl] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [editedDestinationName, setEditedDestinationName] = useState('');
  const [editedDestinationCategory, setEditedDestinationCategory] = useState('');
  const [editedDestinationLocation, setEditedDestinationLocation] = useState('');
  const [editedDestinationManagement, setEditedDestinationManagement] = useState<'pemerintah' | 'swasta'>('pemerintah');
  const [editedDestinationImageUrl, setEditedDestinationImageUrl] = useState('');

  const { toast } = useToast();
  
  const fetchData = useCallback(() => {
    setLoading(true);
    // Data will be fetched from Firestore
    setDestinations([]);
    setCategories([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetAddForm = () => {
    setNewDestinationName('');
    setNewDestinationCategory('');
    setNewDestinationLocation('');
    setNewDestinationManagement('');
    setNewDestinationImageUrl('');
  }

  const handleAddNewDestination = () => {
    if (!newDestinationName.trim() || !newDestinationCategory.trim() || !newDestinationLocation.trim() || !newDestinationManagement) {
      toast({
        variant: "destructive",
        title: "Input tidak lengkap",
        description: "Harap isi semua kolom untuk menambahkan destinasi baru.",
      });
      return;
    }

    // Logic to add to Firestore will be implemented here
    toast({
      title: "Destinasi Ditambahkan",
      description: `Destinasi "${newDestinationName}" berhasil dibuat.`,
    });
    
    setIsAddDialogOpen(false);
    resetAddForm();
  };

  const handleToggleStatus = (destinationId: string) => {
    // Logic to update status in Firestore
    const dest = destinations.find(d => d.id === destinationId);
    if (!dest) return;
    const newStatus = dest.status === 'aktif' ? 'nonaktif' : 'aktif';
    setDestinations(destinations.map(d => d.id === destinationId ? { ...d, status: newStatus } : d)); // Optimistic update
    toast({
      title: "Status Diperbarui",
      description: `Status destinasi "${dest.name}" sekarang ${newStatus}.`,
    });
  };

  const handleDelete = (destinationId: string) => {
    // Logic to delete from Firestore
    const destinationName = destinations.find(d => d.id === destinationId)?.name;
    setDestinations(destinations.filter(d => d.id !== destinationId)); // Optimistic update
    toast({
      title: "Destinasi Dihapus",
      description: `Destinasi "${destinationName}" telah dihapus.`,
    });
  };
  
 const openEditDialog = (destination: Destination) => {
    setEditingDestination(destination);
    setEditedDestinationName(destination.name);
    setEditedDestinationCategory(destination.category);
    setEditedDestinationLocation(destination.location);
    setEditedDestinationManagement(destination.managementType);
    setEditedDestinationImageUrl(destination.imageUrl || '');
    setIsEditDialogOpen(true);
  }

  const handleUpdateDestination = () => {
    if (!editedDestinationName.trim() || !editedDestinationCategory.trim() || !editedDestinationLocation.trim() || !editingDestination) {
      toast({
        variant: "destructive",
        title: "Input tidak lengkap",
        description: "Harap isi semua kolom.",
      });
      return;
    }

    // Logic to update in Firestore
    setIsEditDialogOpen(false);
    setEditingDestination(null);
    
    toast({
        title: "Destinasi Diperbarui",
        description: `Data untuk destinasi "${editedDestinationName}" telah diperbarui.`,
    });
  }

  const statusVariant: { [key in 'aktif' | 'nonaktif']: "default" | "destructive" } = {
    aktif: "default",
    nonaktif: "destructive",
  };
  
  const managementVariant: { [key in 'pemerintah' | 'swasta']: "secondary" | "outline" } = {
    pemerintah: "secondary",
    swasta: "outline",
  };
  
  const ManagementIcon = ({ type }: { type: 'pemerintah' | 'swasta'}) => {
    return type === 'pemerintah' ? <Building className="h-4 w-4" /> : <Mountain className="h-4 w-4" />;
  }

  if(loading) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-5 w-64" />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-5 w-80" />
                    </div>
                    <Skeleton className="h-10 w-44" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Destinasi</h1>
        <p className="text-muted-foreground">
          Kelola destinasi wisata di sini.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Daftar Destinasi</CardTitle>
              <CardDescription>Berikut adalah semua destinasi yang terdaftar dalam sistem.</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Tambah Destinasi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Tambah Destinasi Baru</DialogTitle>
                  <DialogDescription>
                    Isi detail di bawah ini untuk membuat destinasi baru.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dest-name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="dest-name"
                      value={newDestinationName}
                      onChange={(e) => setNewDestinationName(e.target.value)}
                      className="col-span-3"
                      placeholder="Contoh: Pantai Indah"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dest-category" className="text-right">
                      Kategori
                    </Label>
                     <Select value={newDestinationCategory} onValueChange={setNewDestinationCategory}>
                        <SelectTrigger id="dest-category" className="col-span-3">
                            <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.name} className="capitalize">{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dest-management" className="text-right">
                      Pengelola
                    </Label>
                     <Select value={newDestinationManagement} onValueChange={(value) => setNewDestinationManagement(value as 'pemerintah' | 'swasta')}>
                        <SelectTrigger id="dest-management" className="col-span-3">
                            <SelectValue placeholder="Pilih Jenis Pengelola" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pemerintah" className="capitalize">Pemerintah</SelectItem>
                            <SelectItem value="swasta" className="capitalize">Swasta</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dest-location" className="text-right">
                      Lokasi
                    </Label>
                    <Input
                      id="dest-location"
                      value={newDestinationLocation}
                      onChange={(e) => setNewDestinationLocation(e.target.value)}
                      className="col-span-3"
                      placeholder="Contoh: Nama Desa, Kecamatan, Kabupaten"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dest-image-url" className="text-right">
                      URL Gambar
                    </Label>
                    <Input
                      id="dest-image-url"
                      value={newDestinationImageUrl}
                      onChange={(e) => setNewDestinationImageUrl(e.target.value)}
                      className="col-span-3"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={resetAddForm}>Batal</Button>
                  </DialogClose>
                  <Button onClick={handleAddNewDestination}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Destinasi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Jenis Pengelola</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {destinations.map((dest, index) => (
                        <TableRow key={dest.id}>
                            <TableCell className="font-medium">
                               <div className="flex items-center gap-3">
                                <Landmark className={cn("h-4 w-4", colorPalette[index % colorPalette.length])} />
                                <span>{dest.name}</span>
                               </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{dest.category}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={managementVariant[dest.managementType]} className="capitalize flex items-center gap-1.5">
                                  <ManagementIcon type={dest.managementType} />
                                  {dest.managementType}
                                </Badge>
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
                                            <DropdownMenuItem onClick={() => openEditDialog(dest)}>
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
                    {destinations.length === 0 && !loading && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Belum ada destinasi.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Destinasi</DialogTitle>
            <DialogDescription>
              Ubah detail untuk destinasi <span className="font-bold">"{editingDestination?.name}"</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dest-name" className="text-right">
                Nama
              </Label>
              <Input
                id="edit-dest-name"
                value={editedDestinationName}
                onChange={(e) => setEditedDestinationName(e.target.value)}
                className="col-span-3"
              />
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dest-category" className="text-right">
                Kategori
              </Label>
                <Select value={editedDestinationCategory} onValueChange={setEditedDestinationCategory}>
                  <SelectTrigger id="edit-dest-category" className="col-span-3">
                      <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                      {categories.map(c => (
                          <SelectItem key={c.id} value={c.name} className="capitalize">{c.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dest-management" className="text-right">
                Pengelola
              </Label>
                <Select value={editedDestinationManagement} onValueChange={(value) => setEditedDestinationManagement(value as 'pemerintah' | 'swasta')}>
                  <SelectTrigger id="edit-dest-management" className="col-span-3">
                      <SelectValue placeholder="Pilih Jenis Pengelola" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="pemerintah" className="capitalize">Pemerintah</SelectItem>
                      <SelectItem value="swasta" className="capitalize">Swasta</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dest-location" className="text-right">
                Lokasi
              </Label>
              <Input
                id="edit-dest-location"
                value={editedDestinationLocation}
                onChange={(e) => setEditedDestinationLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dest-image-url" className="text-right">
                URL Gambar
              </Label>
              <Input
                id="edit-dest-image-url"
                value={editedDestinationImageUrl}
                onChange={(e) => setEditedDestinationImageUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            </DialogClose>
            <Button onClick={handleUpdateDestination}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
