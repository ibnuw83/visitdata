
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/lib/firebase/client-provider';
import { useUser } from '@/lib/firebase/auth/use-user';
import { useCollection } from '@/lib/firebase/firestore/use-collection';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';


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
  const firestore = useFirestore();
  const categoriesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'categories');
  }, [firestore]);
  const { data: categories, loading } = useCollection<Category>(categoriesQuery);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !firestore) {
        toast({
            variant: "destructive",
            title: "Nama kategori tidak boleh kosong.",
        });
        return;
    }
    const categoryName = newCategoryName.trim().toLowerCase();
    const newCategoryData = { name: categoryName };

    addDoc(collection(firestore, 'categories'), newCategoryData)
        .then(() => {
            setNewCategoryName('');
            setIsAddDialogOpen(false);
            toast({
                title: "Kategori Ditambahkan",
                description: `Kategori "${categoryName}" berhasil dibuat.`,
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `categories`,
                operation: 'create',
                requestResourceData: newCategoryData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!firestore || !categories) return;
    const categoryName = categories.find(c => c.id === categoryId)?.name;
    const docRef = doc(firestore, 'categories', categoryId);

    deleteDoc(docRef)
        .then(() => {
            toast({
                title: "Kategori Dihapus",
                description: `Kategori "${categoryName}" telah dihapus.`,
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `categories/${categoryId}`,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setIsEditDialogOpen(true);
  }

  const handleUpdateCategory = async () => {
    if (!editedCategoryName.trim() || !editingCategory || !firestore) {
        toast({
            variant: "destructive",
            title: "Nama kategori tidak boleh kosong.",
        });
        return;
    }
    const categoryRef = doc(firestore, 'categories', editingCategory.id);
    const newName = editedCategoryName.trim().toLowerCase();
    const updatedData = { name: newName };

    updateDoc(categoryRef, updatedData)
        .then(() => {
            setIsEditDialogOpen(false);
            setEditingCategory(null);
            toast({
                title: "Kategori Diperbarui",
                description: `Kategori "${editingCategory.name}" telah diubah menjadi "${newName}".`,
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `categories/${editingCategory.id}`,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }
  
  if(loading) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-64" />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-5 w-72" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
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
                {(categories || []).map((category, index) => (
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
             {(!categories || categories.length === 0) && (
                <div className="text-center text-muted-foreground py-12">
                    <FolderTree className="mx-auto h-12 w-12" />
                    <p className="mt-4">Belum ada kategori.</p>
                    <p className="text-sm">Mulai dengan menambahkan kategori baru.</p>
                </div>
             )}
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
