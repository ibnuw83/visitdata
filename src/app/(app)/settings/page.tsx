
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/client-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import DestinationImageSettings from '@/components/settings/destination-image-settings';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { AppSettings } from '@/lib/types';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

function AppSettingsCard() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const settingsRef = useMemo(() => firestore ? doc(firestore, 'settings/app') : null, [firestore]);
    const { data: settingsData, loading } = useDoc<AppSettings>(settingsRef);

    const [appTitle, setAppTitle] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [footerText, setFooterText] = useState('');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');

    useEffect(() => {
        if (settingsData) {
            setAppTitle(settingsData.appTitle || '');
            setLogoUrl(settingsData.logoUrl || '');
            setFooterText(settingsData.footerText || '');
            setHeroTitle(settingsData.heroTitle || '');
            setHeroSubtitle(settingsData.heroSubtitle || '');
        }
    }, [settingsData]);

    const handleSaveAppSettings = async () => {
        if (!firestore) return;
        const newSettings = { appTitle, logoUrl, footerText, heroTitle, heroSubtitle };
        try {
            await setDoc(doc(firestore, 'settings', 'app'), newSettings, { merge: true });
            // Also update localStorage for immediate UI changes in Logo component
            if (logoUrl) {
                localStorage.setItem('logoUrl', logoUrl);
            } else {
                localStorage.removeItem('logoUrl');
            }
             window.dispatchEvent(new Event('storage')); // Notify other components of storage change
            toast({
                title: "Pengaturan Aplikasi Disimpan",
                description: "Pengaturan tampilan aplikasi telah diperbarui.",
            });
        } catch (e) {
            console.error("Error saving app settings:", e);
            toast({ variant: 'destructive', title: "Gagal", description: "Tidak dapat menyimpan pengaturan aplikasi." });
        }
    }
    
    const handleBackupData = () => {
        toast({
            title: "Info Pencadangan Data",
            description: "Gunakan fitur ekspor/impor pada konsol Firebase Firestore untuk mencadangkan dan memulihkan data.",
        });
    }

    const handleRestoreClick = () => {
         toast({
            title: "Info Pemulihan Data",
            description: "Gunakan fitur ekspor/impor pada konsol Firebase Firestore untuk mencadangkan dan memulihkan data.",
        });
    };

    if (loading) {
        return (
             <Card>
                <CardHeader>
                     <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-80" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <Skeleton className="h-10 w-48" />
                </CardContent>
            </Card>
        )
    }

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
  const { appUser, user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
          title: "Nama Disimpan",
          description: "Nama profil Anda telah berhasil diperbarui.",
        });
    } catch(e) {
        console.error("Error updating profile:", e);
        toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal menyimpan nama.'});
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !user.email) {
        toast({ variant: 'destructive', title: "Gagal", description: "Pengguna tidak ditemukan." });
        return;
    }
    if (!currentPassword || !newPassword) {
        toast({ variant: 'destructive', title: "Input Tidak Lengkap", description: "Harap isi kata sandi saat ini dan yang baru." });
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        toast({
            title: "Kata Sandi Diperbarui",
            description: "Kata sandi Anda telah berhasil diubah.",
        });
        setCurrentPassword('');
        setNewPassword('');
    } catch (error: any) {
        console.error("Error updating password:", error);
        let description = "Terjadi kesalahan saat mengubah kata sandi.";
        if (error.code === 'auth/wrong-password') {
            description = "Kata sandi saat ini yang Anda masukkan salah.";
        } else if (error.code === 'auth/weak-password') {
            description = "Kata sandi baru terlalu lemah. Minimal 6 karakter.";
        }
        toast({
            variant: 'destructive',
            title: "Gagal Mengubah Kata Sandi",
            description: description,
        });
    }
  }

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
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <div className="flex gap-2">
                 <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                 <Button onClick={handleSaveChanges} variant="outline">Simpan Nama</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={appUser.email} disabled />
            </div>
             <div className="border-t pt-6 space-y-4">
                 <div className="space-y-2">
                     <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
                     <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">Kata Sandi Baru</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <Button onClick={handlePasswordChange}>Ubah Kata Sandi</Button>
             </div>
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
