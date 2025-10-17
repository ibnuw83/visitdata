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
            <CardTitle>Generate Reports</CardTitle>
            <CardDescription>This section is under development.</CardDescription>
        </CardHeader>
        <CardContent>
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Under Construction!</AlertTitle>
                <AlertDescription>
                    The reporting module is currently being developed. Soon you will be able to view, filter, and export detailed tourism reports.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
