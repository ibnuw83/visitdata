
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UnlockRequest } from '@/lib/types';
import { format } from 'date-fns';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc, writeBatch, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function UnlockRequestsPage() {
  const { appUser } = useUser();
  const firestore = useFirestore();

  const requestsQuery = useMemo(() => {
    if (!firestore || appUser?.role !== 'admin') return null;
    return query(collection(firestore, 'unlock-requests'));
  }, [firestore, appUser?.role]);
  
  const { data: unlockRequests, loading: requestsLoading, setData: setUnlockRequests } = useCollection<UnlockRequest>(requestsQuery);
  const { toast } = useToast();
  
  const statusVariant: { [key in UnlockRequest['status']]: "secondary" | "default" | "destructive" } = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
  };

  const handleAction = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    if (!appUser || !firestore || !unlockRequests) return;

    const targetRequest = unlockRequests.find(req => req.id === requestId);
    if (!targetRequest) return;
    
    const batch = writeBatch(firestore);

    const requestRef = doc(firestore, 'unlock-requests', requestId);
    const requestUpdateData = {
        status: newStatus,
        processedBy: appUser.uid,
    };
    batch.update(requestRef, requestUpdateData);

    if (newStatus === 'approved') {
        const visitDataId = `${targetRequest.destinationId}-${targetRequest.year}-${targetRequest.month}`;
        const visitDocRef = doc(firestore, 'destinations', targetRequest.destinationId, 'visits', visitDataId);
        const visitDataUpdate = { locked: false };
        batch.update(visitDocRef, visitDataUpdate);
    }

    await batch.commit();

    setUnlockRequests(prevRequests => 
      (prevRequests || []).map(req => 
        req.id === requestId ? { ...req, status: newStatus, processedBy: appUser.uid } : req
      )
    );

    toast({
      title: `Permintaan ${newStatus === 'approved' ? 'Disetujui' : 'Ditolak'}`,
      description: `Status permintaan telah diperbarui.`,
    });
  }

  const sortedRequests = useMemo(() => {
    if (!unlockRequests) return [];
    return [...unlockRequests].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
    });
  }, [unlockRequests]);

  if (appUser?.role !== 'admin') {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Akses Ditolak</h1>
                <p className="text-muted-foreground">
                Halaman ini hanya dapat diakses oleh admin.
                </p>
            </div>
        </div>
    )
  }

  if (requestsLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
        </div>
        <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-80" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
        </Card>
      </div>
    );
  }

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
                      const period = `${new Date(req.year, req.month -1).toLocaleString('id-ID', {month: 'long'})} ${req.year}`;
                      return (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.destinationName || req.destinationId}</TableCell>
                            <TableCell>{period}</TableCell>
                            <TableCell className="text-muted-foreground">{req.requesterName || req.requestedBy}</TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate max-w-xs">{req.reason}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[req.status]} className="capitalize">{req.status}</Badge>
                            </TableCell>
                            <TableCell>{req.timestamp ? format(new Date(req.timestamp), 'dd MMM yyyy') : 'Baru saja'}</TableCell>
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
                     {(!sortedRequests || sortedRequests.length === 0) && (
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
