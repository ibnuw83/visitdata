
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from '@/firebase/auth/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import DestinationImageSettings from '@/components/settings/destination-image-settings';
import { useFirestore } from '@/firebase/client-provider';
import { doc, updateDoc } from 'firebase/firestore';

function AppSettingsCard() {
    const { toast } = useToast();
    const [appTitle, setAppTitle] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [footerText, setFooterText] = useState('');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // This will be replaced by data from Firestore
        setAppTitle('');
        setLogoUrl('');
        setFooterText('');
        setHeroTitle('');
        setHeroSubtitle('');
    }, []);

    const handleSaveAppSettings = () => {
        // This will be replaced by a call to Firestore
        toast({
            title: "Pengaturan Aplikasi Disimpan",
            description: "Pengaturan tampilan aplikasi telah diperbarui.",
        });
    }
    
    const handleBackupData = () => {
        toast({
            variant: 'destructive',
            title: "Fungsi Tidak Tersedia",
            description: "Pencadangan data akan menggunakan fitur ekspor/impor bawaan Firestore.",
        });
    }

    const handleRestoreClick = () => {
         toast({
            variant: 'destructive',
            title: "Fungsi Tidak Tersedia",
            description: "Pemulihan data akan menggunakan fitur ekspor/impor bawaan Firestore.",
        });
    };

    const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
        // This logic is now obsolete
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengaturan Aplikasi</CardTitle>
                <CardDescription>Sesuaikan tampilan global serta cadangkan dan pulihkan data aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="app-title">Judul Aplikasi</Label>
                        <Input id="app-title" value={appTitle} onChange={(e) => setAppTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="logo-url">URL Logo</Label>
                        <Input id="logo-url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="footer-text">Teks Footer</Label>
                        <Input id="footer-text" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hero-title">Judul Halaman Utama</Label>
                        <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hero-subtitle">Subjudul Halaman Utama</Label>
                        <Textarea id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveAppSettings}>Simpan Pengaturan Tampilan</Button>
                </div>
                <div className="border-t pt-6 space-y-4">
                     <div>
                        <h3 className="text-base font-medium">Cadangkan & Pulihkan Data</h3>
                        <p className="text-sm text-muted-foreground">Gunakan fitur ekspor/impor pada konsol Firebase Firestore untuk mencadangkan dan memulihkan data.</p>
                    </div>
                    <div className='flex justify-between items-center'>
                        <Button variant="outline" onClick={handleBackupData}>Info Pencadangan</Button>
                        <Button variant="outline" onClick={handleRestoreClick}>Info Pemulihan</Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleRestoreData}
                          className="hidden"
                          accept=".json"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ChangePhotoDialog({ onSave }: { onSave: (newUrl: string) => void }) {
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onSave(newAvatarUrl);
        setIsOpen(false);
        setNewAvatarUrl('');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Ubah Foto</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ubah Foto Profil</DialogTitle>
                    <DialogDescription>
                        Masukkan URL gambar baru untuk foto profil Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="avatar-url">URL Gambar</Label>
                    <Input 
                        id="avatar-url"
                        value={newAvatarUrl}
                        onChange={(e) => setNewAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.png"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Batal</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SettingsPage() {
  const { appUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [name, setName] = useState('');

  useEffect(() => {
    if (appUser) {
      setName(appUser.name);
    }
  }, [appUser]);

  const handleSaveChanges = async () => {
    if (!appUser || !firestore) return;
    const userRef = doc(firestore, 'users', appUser.uid);
    try {
        await updateDoc(userRef, { name });
        toast({
          title: "Perubahan Disimpan",
          description: "Pengaturan profil Anda telah berhasil diperbarui.",
        });
    } catch(e) {
        console.error("Error updating profile:", e);
        toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal menyimpan perubahan.'});
    }
  };

  const handlePhotoChange = async (newUrl: string) => {
    if (!appUser || !firestore) return;
    const userRef = doc(firestore, 'users', appUser.uid);
    try {
        await updateDoc(userRef, { avatarUrl: newUrl });
        toast({
            title: "Foto Profil Diperbarui",
            description: "Foto profil Anda telah berhasil diubah.",
        })
    } catch(e) {
        console.error("Error updating avatar:", e);
        toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal mengubah foto profil.'});
    }
  }
  
  const roleVariant = {
      admin: "secondary",
      pengelola: "outline",
  } as const;

  if (!appUser) {
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
                <AvatarImage src={appUser.avatarUrl} alt={appUser.name} />
                <AvatarFallback className="text-3xl">{name.charAt(0)}</AvatarFallback>
              </Avatar>
               <div>
                <ChangePhotoDialog onSave={handlePhotoChange} />
                <div className="mt-2 text-sm text-muted-foreground">
                    <span>Masuk sebagai: </span>
                    <Badge variant={roleVariant[appUser.role]} className="capitalize">{appUser.role}</Badge>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={appUser.email} disabled />
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
      {appUser.role === 'admin' && (
        <>
            <AppSettingsCard />
            <DestinationImageSettings />
        </>
      )}
    </div>
  );
}
