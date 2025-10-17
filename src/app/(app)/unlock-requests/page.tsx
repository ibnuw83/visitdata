'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDestinations, getUnlockRequests } from "@/lib/local-data-service";
import type { Destination, UnlockRequest } from '@/lib/types';
import { format } from 'date-fns';

export default function UnlockRequestsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  
  useEffect(() => {
    setDestinations(getDestinations());
    setUnlockRequests(getUnlockRequests());
  }, []);

  const getDestinationName = (id: string) => destinations.find(d => d.id === id)?.name || 'Tidak Dikenal';
  
  const statusVariant: { [key in UnlockRequest['status']]: "secondary" | "default" | "destructive" } = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Permintaan Revisi</h1>
        <p className="text-muted-foreground">
          Kelola permintaan buka kunci data dari pengelola destinasi.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Daftar Permintaan</CardTitle>
            <CardDescription>Tinjau dan proses permintaan yang masuk.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Destinasi</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead className="max-w-xs">Alasan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {unlockRequests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{getDestinationName(req.destinationId)}</TableCell>
                            <TableCell>{new Date(req.year, req.month -1).toLocaleString('id-ID', {month: 'long'})} {req.year}</TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate max-w-xs">{req.reason}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[req.status]} className="capitalize">{req.status}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(req.timestamp), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-right">
                                {req.status === 'pending' && (
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm">Tolak</Button>
                                        <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90">Setujui</Button>
                                    </div>
                                )}
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
