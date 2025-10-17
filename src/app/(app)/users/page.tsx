import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola pengguna (admin dan pengelola) di sini.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Pengguna</CardTitle>
            <CardDescription>Bagian ini sedang dalam pengembangan.</CardDescription>
        </CardHeader>
        <CardContent>
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Dalam Pembangunan!</AlertTitle>
                <AlertDescription>
                    Halaman manajemen pengguna saat ini sedang dikembangkan.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
