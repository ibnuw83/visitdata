import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">
          Lihat, filter, dan ekspor laporan data pariwisata.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Buat Laporan</CardTitle>
            <CardDescription>Bagian ini sedang dalam pengembangan.</CardDescription>
        </CardHeader>
        <CardContent>
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Dalam Pembangunan!</AlertTitle>
                <AlertDescription>
                    Modul pelaporan saat ini sedang dikembangkan. Segera Anda akan dapat melihat, memfilter, dan mengekspor laporan pariwisata terperinci.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
