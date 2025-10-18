'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, PlusCircle, Trash2, FilePenLine } from "lucide-react";
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { getCategories, saveCategories } from '@/lib/local-data-service';
import { Category } from '@/lib/types';
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
        toast({
            variant: "destructive",
            title: "Nama kategori tidak boleh kosong.",
        });
        return;
    }
    const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim().toLowerCase(),
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setNewCategoryName('');
    setIsDialogOpen(false);
    toast({
        title: "Kategori Ditambahkan",
        description: `Kategori "${newCategory.name}" berhasil dibuat.`,
    });
  }

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    toast({
        title: "Kategori Dihapus",
        description: `Kategori "${categoryName}" telah dihapus.`,
    });
  }

  const handleEditCategory = (categoryName: string) => {
    toast({
      title: `Aksi: Edit`,
      description: `Anda memilih Edit untuk kategori ${categoryName}. (Fungsi belum diimplementasikan)`,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Kategori Wisata</h1>
        <p className="text-muted-foreground">
          Kelola kategori wisata di sini.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
                <CardTitle>Daftar Kategori</CardTitle>
                <CardDescription>Tambah, edit, atau hapus kategori wisata.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Tambah Kategori
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tambah Kategori Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan nama untuk kategori baru. Nama akan diubah menjadi huruf kecil.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="col-span-3"
                      placeholder="Contoh: Bahari"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Batal</Button>
                  </DialogClose>
                  <Button onClick={handleAddCategory}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                    <div key={category.id} className="group flex items-center justify-between p-3 pl-4 rounded-lg border bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3 font-medium text-secondary-foreground">
                           <FolderTree className="h-5 w-5" />
                           <span className="capitalize">{category.name}</span>
                        </div>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditCategory(category.name)}>
                                <FilePenLine className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini akan menghapus kategori <span className="font-bold capitalize">"{category.name}"</span>. Tindakan ini tidak dapat diurungkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
