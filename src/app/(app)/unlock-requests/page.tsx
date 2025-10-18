
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Destination, UnlockRequest, User as AppUser } from '@/lib/types';
import { format } from 'date-fns';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';

export default function UnlockRequestsPage() {
  const { user, refreshPendingRequests } = useAuth();
  const firestore = useFirestore();

  const { data: destinations } = useCollection<Destination>(firestore ? collection(firestore, 'destinations') : null);
  const { data: users } = useCollection<AppUser>(firestore ? collection(firestore, 'users') : null);
  const { data: unlockRequests } = useCollection<UnlockRequest>(firestore ? collection(firestore, 'unlock-requests') : null);

  const { toast } = useToast();
  
  const destinationMap = useMemo(() => new Map(destinations?.map(d => [d.id, d.name])), [destinations]);
  const userMap = useMemo(() => new Map(users?.map(u => [u.uid, u.name])), [users]);
  
  const statusVariant: { [key in UnlockRequest['status']]: "secondary" | "default" | "destructive" } = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
  };

  const handleAction = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    if (!user || !firestore || !unlockRequests) return;

    const requestRef = doc(firestore, 'unlock-requests', requestId);
    const targetRequest = unlockRequests.find(req => req.id === requestId);
    if (!targetRequest) return;
    
    try {
      await updateDoc(requestRef, {
        status: newStatus,
        processedBy: user.uid,
      });

      if (newStatus === 'approved') {
        const visitDataId = `visit-${targetRequest.destinationId}-${targetRequest.year}-${targetRequest.month}`;
        const visitDocRef = doc(firestore, 'destinations', targetRequest.destinationId, 'visits', visitDataId);
        await updateDoc(visitDocRef, { locked: false });
      }

      toast({
        title: `Permintaan ${newStatus === 'approved' ? 'Disetujui' : 'Ditolak'}`,
        description: `Status permintaan telah diperbarui.`,
      });
      refreshPendingRequests();
    } catch (error) {
      console.error("Error updating request: ", error);
      toast({
        variant: "destructive",
        title: "Gagal memperbarui",
        description: "Terjadi kesalahan saat memproses permintaan.",
      });
    }
  }

  const sortedRequests = useMemo(() => {
    if (!unlockRequests) return [];
    return [...unlockRequests].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [unlockRequests]);

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
                        <TableHead>Pemohon</TableHead>
                        <TableHead className="max-w-xs">Alasan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedRequests.map(req => {
                      const destinationName = destinationMap.get(req.destinationId) || 'Memuat...';
                      const requesterName = userMap.get(req.requestedBy) || 'Memuat...';
                      const period = `${new Date(req.year, req.month -1).toLocaleString('id-ID', {month: 'long'})} ${req.year}`;
                      return (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{destinationName}</TableCell>
                            <TableCell>{period}</TableCell>
                            <TableCell className="text-muted-foreground">{requesterName}</TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate max-w-xs">{req.reason}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[req.status]} className="capitalize">{req.status}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(req.timestamp), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-right">
                                {req.status === 'pending' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Buka menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction(req.id, 'approved')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                <span>Setujui</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction(req.id, 'rejected')}>
                                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                <span>Tolak</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                      )
                    })}
                     {sortedRequests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Tidak ada permintaan revisi.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
