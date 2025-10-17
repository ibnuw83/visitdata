import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Kategori Wisata</h1>
        <p className="text-muted-foreground">
          Kelola kategori wisata di sini.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>This section is under development.</CardDescription>
        </CardHeader>
        <CardContent>
             <Alert>
                <Construction className="h-4 w-4" />
                <AlertTitle>Under Construction!</AlertTitle>
                <AlertDescription>
                    The tourism category management page is currently being developed.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
