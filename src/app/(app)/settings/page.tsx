'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError, AuthError, useCollection } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import DestinationImageSettings from '@/components/settings/destination-image-settings';
import { doc, updateDoc, setDoc, collection, getDocs, writeBatch, getDoc, collectionGroup, Query } from 'firebase/firestore';
import { AppSettings, User, Category, Destination, UnlockRequest, VisitData, Country } from '@/lib/types';

function AppSettingsCard() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const settingsRef = useMemo(() => firestore ? doc(firestore, 'settings/app') : null, [firestore]);
    const { data: settingsData, loading } = useDoc<AppSettings>(settingsRef);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const docRef = doc(firestore, 'settings', 'app');

        setDoc(docRef, newSettings, { merge: true })
            .then(() => {
                if (logoUrl) {
                    localStorage.setItem('logoUrl', logoUrl);
                } else {
                    localStorage.removeItem('logoUrl');
                }
                window.dispatchEvent(new Event('storage'));
                toast({
                    title: "Pengaturan Aplikasi Disimpan",
                    description: "Pengaturan tampilan aplikasi telah diperbarui.",
                });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: 'settings/app',
                    operation: 'update',
                    requestResourceData: newSettings,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }

    const handleExportData = async () => {
        if (!firestore) return;
        setIsExporting(true);
        toast({ title: "Mengekspor data...", description: "Harap tunggu, ini mungkin butuh beberapa saat." });
    
        const exportedData: Record<string, any> = {};
        const collectionsToExport: { key: string, query: Query<unknown> }[] = [
            { key: 'users', query: collection(firestore, 'users') },
            { key: 'categories', query: collection(firestore, 'categories') },
            { key: 'destinations', query: collection(firestore, 'destinations') },
            { key: 'unlockRequests', query: collection(firestore, 'unlock-requests') },
            { key: 'countries', query: collection(firestore, 'countries') },
        ];
    
        try {
            // Export simple collections
            for (const { key, query } of collectionsToExport) {
                const snapshot = await getDocs(query);
                exportedData[key] = snapshot.docs.map(d => d.data());
            }
    
            // Handle 'visits' subcollection separately and safely
            const allVisits: VisitData[] = [];
            if (exportedData.destinations && exportedData.destinations.length > 0) {
                for (const dest of exportedData.destinations) {
                    const visitsRef = collection(firestore, 'destinations', dest.id, 'visits');
                    const visitsSnapshot = await getDocs(visitsRef);
                    visitsSnapshot.forEach(visitDoc => {
                        allVisits.push(visitDoc.data() as VisitData);
                    });
                }
            }
            exportedData.visits = allVisits;
    
            const appSettingsDoc = await getDoc(doc(firestore, 'settings/app'));
            if (appSettingsDoc.exists()) {
                exportedData.appSettings = appSettingsDoc.data();
            }
    
            const jsonString = JSON.stringify(exportedData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-visitdata-hub-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
    
            toast({ title: "Ekspor Berhasil", description: "Data Anda telah diunduh sebagai file JSON." });
    
        } catch (error: any) {
             const permissionError = new FirestorePermissionError({
                path: 'multiple collections',
                operation: 'list',
                details: `Gagal mengekspor data. Periksa izin baca Anda. Penyebab: ${error.message}`,
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleImportData = async () => {
        if (!importFile || !firestore) {
            toast({ variant: 'destructive', title: 'Tidak ada file dipilih' });
            return;
        }
    
        setIsImporting(true);
        toast({ title: "Mengimpor data...", description: "Ini akan menimpa data yang ada. Jangan tutup jendela ini." });
    
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                const batch = writeBatch(firestore);
    
                if (data.users && Array.isArray(data.users)) {
                    data.users.forEach((user: User) => {
                        const docRef = doc(firestore, 'users', user.uid);
                        batch.set(docRef, user);
                    });
                }
                if (data.categories && Array.isArray(data.categories)) {
                    data.categories.forEach((category: Category) => {
                        const docRef = doc(firestore, 'categories', category.id);
                        batch.set(docRef, category);
                    });
                }
                if (data.destinations && Array.isArray(data.destinations)) {
                    data.destinations.forEach((destination: Destination) => {
                        const docRef = doc(firestore, 'destinations', destination.id);
                        batch.set(docRef, destination);
                    });
                }
                if (data.countries && Array.isArray(data.countries)) {
                    data.countries.forEach((country: Country) => {
                        const docRef = doc(firestore, 'countries', country.code);
                        batch.set(docRef, country);
                    });
                }
                if (data.unlockRequests && Array.isArray(data.unlockRequests)) {
                    data.unlockRequests.forEach((request: UnlockRequest) => {
                        const docRef = doc(firestore, 'unlock-requests', request.id);
                        batch.set(docRef, request);
                    });
                }
                if (data.visits && Array.isArray(data.visits)) {
                     data.visits.forEach((visit: VisitData) => {
                        const docRef = doc(firestore, 'destinations', visit.destinationId, 'visits', visit.id);
                        batch.set(docRef, visit);
                    });
                }
                if (data.appSettings) {
                    const docRef = doc(firestore, 'settings', 'app');
                    batch.set(docRef, data.appSettings);
                }
    
                await batch.commit();
                toast({ title: "Impor Berhasil", description: "Data telah dipulihkan. Harap segarkan halaman." });
    
            } catch (error: any) {
                const permissionError = new FirestorePermissionError({
                    path: 'batch import',
                    operation: 'write',
                    details: error.message
                });
                errorEmitter.emit('permission-error', permissionError);
            } finally {
                setIsImporting(false);
                setIsImportDialogOpen(false);
                setImportFile(null);
            }
        };
        reader.readAsText(importFile);
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
                        <Input id="app-title" value={appTitle || ''} onChange={(e) => setAppTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="logo-url">URL Logo</Label>
                        <Input id="logo-url" value={logoUrl || ''} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="footer-text">Teks Footer</Label>
                        <Input id="footer-text" value={footerText || ''} onChange={(e) => setFooterText(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hero-title">Judul Halaman Utama</Label>
                        <Input id="hero-title" value={heroTitle || ''} onChange={(e) => setHeroTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hero-subtitle">Subjudul Halaman Utama</Label>
                        <Textarea id="hero-subtitle" value={heroSubtitle || ''} onChange={(e) => setHeroSubtitle(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveAppSettings}>Simpan Pengaturan Tampilan</Button>
                </div>
                <div className="border-t pt-6 space-y-4">
                     <div>
                        <h3 className="text-base font-medium">Cadangkan & Pulihkan Data</h3>
                        <p className="text-sm text-muted-foreground">Ekspor semua data aplikasi ke file JSON, atau impor dari file cadangan.</p>
                    </div>
                    <div className='flex justify-between items-center'>
                        <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                            {isExporting ? 'Mengekspor...' : 'Ekspor Semua Data'}
                        </Button>
                        
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">Impor Data</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <AlertDialog>
                                    <DialogHeader>
                                        <DialogTitle>Impor Data dari Cadangan</DialogTitle>
                                        <DialogDescription>Pilih file cadangan JSON (`.json`) untuk diimpor. Ini akan menimpa semua data yang ada saat ini.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Input 
                                            type="file" 
                                            accept=".json" 
                                            ref={fileInputRef} 
                                            onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} 
                                        />
                                        {importFile && <p className="text-sm mt-2 text-muted-foreground">File dipilih: {importFile.name}</p>}
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Batal</Button>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={!importFile || isImporting}>
                                                {isImporting ? 'Mengimpor...' : 'Lanjutkan Impor'}
                                            </Button>
                                        </AlertDialogTrigger>
                                    </DialogFooter>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan **MENIMPA** semua data yang ada di database dengan konten dari file cadangan. Tindakan ini tidak dapat diurungkan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleImportData} className="bg-destructive hover:bg-destructive/90">Ya, Timpa dan Impor</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DialogContent>
                        </Dialog>

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
    const updatedData = { name };

    updateDoc(userRef, updatedData)
        .then(() => {
            toast({
              title: "Nama Disimpan",
              description: "Nama profil Anda telah berhasil diperbarui.",
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `users/${appUser.uid}`,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handlePhotoChange = async (newUrl: string) => {
    if (!appUser || !firestore) return;
    const userRef = doc(firestore, 'users', appUser.uid);
    const updatedData = { avatarUrl: newUrl };

    updateDoc(userRef, updatedData)
        .then(() => {
            toast({
                title: "Foto Profil Diperbarui",
                description: "Foto profil Anda telah berhasil diubah.",
            })
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `users/${appUser.uid}`,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
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
            <CardDescription>Perbarui informasi profil Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={appUser.avatarUrl} alt={appUser.name} />
                <AvatarFallback className="text-3xl">{name ? name.charAt(0) : ''}</AvatarFallback>
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
                 <Input id="name" value={name || ''} onChange={(e) => setName(e.target.value)} />
                 <Button onClick={handleSaveChanges} variant="outline">Simpan Nama</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={appUser.email} disabled />
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
