
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
import { cn } from '@/lib/utils';

const colorPalette = [
    "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50",
    "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50",
    "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50",
    "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50",
    "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50",
    "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800/50",
    "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800/50",
    "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    setIsAddDialogOpen(false);
    toast({
        title: "Kategori Ditambahkan",
        description: `Kategori "${newCategory.name}" berhasil dibuat.`,
    });
  }

  const handleDeleteCategory = (categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    toast({
        title: "Kategori Dihapus",
        description: `Kategori "${categoryName}" telah dihapus.`,
    });
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setIsEditDialogOpen(true);
  }

  const handleUpdateCategory = () => {
    if (!editedCategoryName.trim() || !editingCategory) {
        toast({
            variant: "destructive",
            title: "Nama kategori tidak boleh kosong.",
        });
        return;
    }

    const updatedCategories = categories.map(c => 
        c.id === editingCategory.id ? { ...c, name: editedCategoryName.trim().toLowerCase() } : c
    );

    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setIsEditDialogOpen(false);
    setEditingCategory(null);
    
    toast({
        title: "Kategori Diperbarui",
        description: `Kategori "${editingCategory.name}" telah diubah menjadi "${editedCategoryName}".`,
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                {categories.map((category, index) => (
                    <div key={category.id} className={cn("group flex items-center justify-between p-3 pl-4 rounded-lg border", colorPalette[index % colorPalette.length])}>
                        <div className="flex items-center gap-3 font-medium text-secondary-foreground">
                           <FolderTree className="h-5 w-5" />
                           <span className="capitalize">{category.name}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(category)}>
                                <FilePenLine className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>
              Ubah nama untuk kategori <span className="font-bold capitalize">"{editingCategory?.name}"</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nama
              </Label>
              <Input
                id="edit-name"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            </DialogClose>
            <Button onClick={handleUpdateCategory}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    