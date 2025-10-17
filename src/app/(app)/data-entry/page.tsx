import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export default function DataEntryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Input Data</h1>
        <p className="text-muted-foreground">
          Halaman untuk pengelola destinasi menginput data pengunjung bulanan.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Data Entry Form</CardTitle>
            <CardDescription>This section is under development.</CardDescription>
        </CardHeader>
        <CardContent>
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Under Construction!</AlertTitle>
                <AlertDescription>
                    The interactive data entry form is being built. Soon, you'll be able to input and manage your visitor data here.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
