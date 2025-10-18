'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/auth-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const userImage = user ? PlaceHolderImages.find(p => p.id === user.avatar) : null;

  const handleSaveChanges = () => {
    // In a real app, this would involve API calls to update user profile and password.
    // For this demo, we'll just show a success toast.
    toast({
      title: "Perubahan Disimpan",
      description: "Pengaturan profil Anda telah berhasil diperbarui (simulasi).",
    });
  };

  const handlePhotoChange = () => {
    toast({
        title: "Fitur Dalam Pengembangan",
        description: "Fungsi untuk mengubah foto profil akan segera hadir.",
    })
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-5 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola profil dan pengaturan aplikasi Anda.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Profil Pengguna</CardTitle>
            <CardDescription>Perbarui informasi profil dan kata sandi Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userImage?.imageUrl} alt={user.name} data-ai-hint={userImage?.imageHint}/>
                <AvatarFallback className="text-3xl">{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handlePhotoChange}>Ubah Foto</Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
              <Input id="current-password" type="password" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="new-password">Kata Sandi Baru</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
