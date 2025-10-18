'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDestinations, getUnlockRequests, saveUnlockRequests, getVisitData, saveVisitData, getUsers } from "@/lib/local-data-service";
import type { Destination, UnlockRequest, User, VisitData } from '@/lib/types';
import { format } from 'date-fns';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function UnlockRequestsPage() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    setDestinations(getDestinations());
    setUnlockRequests(getUnlockRequests());
    setUsers(getUsers());
  }, []);

  const getDestinationName = (id: string) => destinations.find(d => d.id === id)?.name || 'Tidak Dikenal';
  const getRequesterName = (id: string) => users.find(u => u.uid === id)?.name || 'Tidak Dikenal';
  
  const statusVariant: { [key in UnlockRequest['status']]: "secondary" | "default" | "destructive" } = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
  };

  const handleAction = (requestId: string, newStatus: 'approved' | 'rejected') => {
    if (!user) return;

    const updatedRequests = unlockRequests.map(req => 
      req.id === requestId ? { ...req, status: newStatus, processedBy: user.uid } : req
    );
    setUnlockRequests(updatedRequests);
    saveUnlockRequests(updatedRequests);

    const targetRequest = updatedRequests.find(req => req.id === requestId);
    if (!targetRequest) return;

    if (newStatus === 'approved') {
      const visitData = getVisitData();
      const updatedVisitData = visitData.map(vd => {
        if (vd.destinationId === targetRequest.destinationId && vd.year === targetRequest.year && vd.month === targetRequest.month) {
          return { ...vd, locked: false };
        }
        return vd;
      });
      saveVisitData(updatedVisitData);
    }
    
    toast({
      title: `Permintaan ${newStatus === 'approved' ? 'Disetujui' : 'Ditolak'}`,
      description: `Status permintaan telah diperbarui.`,
    });
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
                    {unlockRequests.map(req => {
                      const destinationName = getDestinationName(req.destinationId);
                      const period = `${new Date(req.year, req.month -1).toLocaleString('id-ID', {month: 'long'})} ${req.year}`;
                      return (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{destinationName}</TableCell>
                            <TableCell>{period}</TableCell>
                            <TableCell className="text-muted-foreground">{getRequesterName(req.requestedBy)}</TableCell>
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
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
