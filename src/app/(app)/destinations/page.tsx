'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDestinations, saveDestinations, getCategories } from "@/lib/local-data-service";
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


export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // State for new destination form
  const [newDestinationName, setNewDestinationName] = useState('');
  const [newDestinationCategory, setNewDestinationCategory] = useState('');
  const [newDestinationLocation, setNewDestinationLocation] = useState('');
  const [newDestinationManagement, setNewDestinationManagement] = useState<'pemerintah' | 'swasta' | ''>('');

  const { toast } = useToast();
  
  useEffect(() => {
    setDestinations(getDestinations());
    setCategories(getCategories());
  }, []);

  const resetAddForm = () => {
    setNewDestinationName('');
    setNewDestinationCategory('');
    setNewDestinationLocation('');
    setNewDestinationManagement('');
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

    const newDestination: Destination = {
      id: `dest-${Date.now()}`,
      name: newDestinationName.trim(),
      category: newDestinationCategory,
      managementType: newDestinationManagement,
      location: newDestinationLocation.trim(),
      status: 'aktif',
      manager: 'pengelola-01', // Default manager for new destination
    };

    const updatedDestinations = [...destinations, newDestination];
    setDestinations(updatedDestinations);
    saveDestinations(updatedDestinations);

    toast({
      title: "Destinasi Ditambahkan",
      description: `Destinasi "${newDestination.name}" berhasil dibuat.`,
    });
    
    setIsAddDialogOpen(false);
    resetAddForm();
  };

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
  
  const managementVariant: { [key in Destination['managementType']]: "secondary" | "outline" } = {
    pemerintah: "secondary",
    swasta: "outline",
  };
  
  const ManagementIcon = ({ type }: { type: Destination['managementType']}) => {
    return type === 'pemerintah' ? <Building className="h-4 w-4" /> : <Mountain className="h-4 w-4" />;
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
