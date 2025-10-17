import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export default function SettingsPage() {
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
            <CardTitle>Pengaturan</CardTitle>
            <CardDescription>Bagian ini sedang dalam pengembangan.</CardDescription>
        </CardHeader>
        <CardContent>
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Dalam Pembangunan!</AlertTitle>
                <AlertDescription>
                    Halaman pengaturan saat ini sedang dikembangkan. Segera Anda akan dapat mengelola profil dan preferensi aplikasi Anda di sini.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
