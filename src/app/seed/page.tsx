
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// --- Data Seeding ---
// This data will be used to populate the Firestore database.
// NOTE: The admin user (admin@dinas.com) must be created MANUALLY in the Firebase Console
// with the UID specified here. This client-side script only writes the Firestore profile.

const adminUserData = {
  uid: 'eZIY6FKbXcglAWS9J6GgxnnLJ553',
  email: 'admin@dinas.com',
  name: 'Admin Dinas',
  role: 'admin',
  status: 'aktif',
  assignedLocations: [],
  avatarUrl: `https://avatar.vercel.sh/admin@dinas.com.png`
};


// Main Seeding Page Component
export default function SeedPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleSeed = async () => {
    if (!firestore) {
      const msg = "Firestore is not initialized. Seeding cannot proceed.";
      addLog(`❌ Error: ${msg}`);
      setError(msg);
      return;
    }
    
    // Prevent running in production
    if (process.env.NODE_ENV === 'production') {
        toast({
            variant: "destructive",
            title: "Operasi Ditolak",
            description: "Seeding hanya dapat dijalankan di lingkungan pengembangan.",
        });
        return;
    }

    setIsLoading(true);
    setLogs([]);
    setError(null);

    try {
      addLog("--- Memulai Proses Seeding Database ---");
      const batch = writeBatch(firestore);

      // 1. Seed User Profile
      addLog(`1. Menyiapkan profil Firestore untuk pengguna: ${adminUserData.email}...`);
      const userRef = doc(firestore, "users", adminUserData.uid);
      batch.set(userRef, adminUserData);
      addLog(`   - Profil untuk UID ${adminUserData.uid} ditambahkan ke batch.`);

      addLog("2. Menjalankan batch write ke Firestore...");
      await batch.commit();
      addLog("   - Batch berhasil ditulis.");

      addLog("--- ✅ Proses Seeding Selesai ---");
      toast({
        title: "Seeding Berhasil",
        description: "Database telah berhasil di-seed dengan data awal.",
      });

    } catch (e: any) {
      console.error("Seeding failed:", e);
      const msg = e.message || "Terjadi kesalahan yang tidak diketahui.";
      addLog(`❌ Error: ${msg}`);
      setError(msg);
      toast({
        variant: "destructive",
        title: "Seeding Gagal",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (process.env.NODE_ENV === 'production') {
    return (
         <div className="container mx-auto p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Akses Ditolak</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Halaman ini hanya tersedia di lingkungan pengembangan.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Seeding Utility</CardTitle>
          <CardDescription>
            Gunakan halaman ini untuk mengisi (seed) database Firestore Anda dengan data awal.
            Pastikan Anda telah membuat pengguna `admin@dinas.com` di Firebase Authentication Console secara manual dengan UID `eZIY6FKbXcglAWS9J6GgxnnLJ553`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Peringatan</AlertTitle>
                <AlertDescription>
                    Menjalankan proses ini akan menimpa data yang ada di koleksi `users`. Lanjutkan dengan hati-hati.
                </AlertDescription>
            </Alert>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full">
            {isLoading ? 'Sedang Memproses...' : 'Jalankan Proses Seed'}
          </Button>

          {(logs.length > 0 || error) && (
            <div className="mt-4 p-4 bg-muted rounded-md max-h-80 overflow-y-auto">
              <h3 className="font-semibold mb-2">Log Proses:</h3>
              <pre className="text-xs whitespace-pre-wrap">
                {logs.join('\n')}
                {error && <span className="text-destructive mt-2 block">{`\nFINAL ERROR: ${error}`}</span>}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
