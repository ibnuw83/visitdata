'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDestinations } from "@/lib/local-data-service";
import { FolderTree } from "lucide-react";
import { Badge } from '@/components/ui/badge';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const uniqueCategories = [...new Set(getDestinations().map(d => d.category))];
    setCategories(uniqueCategories);
  }, []);

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
            <CardTitle>Daftar Kategori</CardTitle>
            <CardDescription>Kategori ini secara otomatis diambil dari destinasi yang ada.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-4">
                {categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-base capitalize p-4 py-2 flex items-center gap-2">
                        <FolderTree className="h-4 w-4" />
                        {category}
                    </Badge>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
