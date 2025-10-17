'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDestinations } from "@/lib/local-data-service";
import type { Destination } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Landmark } from 'lucide-react';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  useEffect(() => {
    setDestinations(getDestinations());
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Destinasi</h1>
        <p className="text-muted-foreground">
          Kelola destinasi wisata di sini.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Daftar Destinasi</CardTitle>
            <CardDescription>Berikut adalah semua destinasi yang terdaftar dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Destinasi</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {destinations.map(dest => (
                        <TableRow key={dest.id}>
                            <TableCell className="font-medium">
                               <div className="flex items-center gap-3">
                                <Landmark className="h-4 w-4 text-muted-foreground" />
                                <span>{dest.name}</span>
                               </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{dest.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{dest.location}</TableCell>
                            <TableCell className="text-right">
                                {/* Actions like Edit/Delete would go here */}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
