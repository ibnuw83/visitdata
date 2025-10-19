
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Destination, VisitData, WismanDetail, Country, UnlockRequest } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Trash2, Lock, Unlock, KeyRound, Save } from 'lucide-react';
import { useUser, useFirestore, useCollection, errorEmitter, FirestorePermissionError, useMemoFirebase } from '@/firebase';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { collection, query, where, doc, setDoc, writeBatch, getDocs, serverTimestamp, addDoc, getDoc, collectionGroup } from 'firebase/firestore';


const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('id-ID', { month: 'long' }));

function UnlockRequestDialog({ destination, monthData, onNewRequest }: { destination: Destination, monthData: VisitData, onNewRequest: (req: Omit<UnlockRequest, 'id' | 'timestamp'>) => void }) {
    const { appUser } = useUser();
    const [reason, setReason] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'Alasan tidak boleh kosong' });
            return;
        }
        if (!appUser) return;

        const newRequest: Omit<UnlockRequest, 'id' | 'timestamp' | 'processedBy'> = {
            destinationId: destination.id,
            destinationName: destination.name,
            month: monthData.month,
            year: monthData.year,
            reason: reason,
            status: 'pending',
            requestedBy: appUser.uid,
            requesterName: appUser.name,
        };

        onNewRequest(newRequest as any);
        toast({ title: 'Permintaan Terkirim', description: 'Permintaan buka kunci telah dikirim ke admin.' });
        setReason('');
        setIsOpen(false);
    }


    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Minta Buka Kunci
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Minta Buka Kunci Data</DialogTitle>
                    <DialogDescription>
                        Kirim permintaan ke admin untuk membuka kunci data periode <span className="font-bold">{monthData.monthName} {monthData.year}</span> untuk destinasi <span className="font-bold">{destination.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="reason">Alasan Permintaan Revisi</Label>
                    <Textarea 
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Contoh: Terjadi kesalahan input jumlah wisatawan domestik."
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Batal</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit}>Kirim Permintaan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const colorPalette = [
    "text-blue-600",
    "text-green-600",
    "text-orange-500",
    "text-purple-600",
    "text-red-600",
    "text-yellow-600",
    "text-pink-600",
    "text-indigo-600",
];

function DestinationDataEntry({ destination, onDataChange, onLockChange, onNewRequest, colorClass, selectedYear, onManualSave, hasUnsavedChanges, pendingChanges }: { destination: Destination, onDataChange: (updatedData: VisitData) => void, onLockChange: (updatedData: VisitData) => void, onNewRequest: (req: Omit<UnlockRequest, 'id' | 'timestamp'>) => void, colorClass: string, selectedYear: number, onManualSave: () => void, hasUnsavedChanges: boolean, pendingChanges: Record<string, VisitData> }) {
  const { appUser } = useUser();
  const firestore = useFirestore();
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const isAccordionOpen = accordionValue.includes(destination.id);

  const visitsQuery = useMemoFirebase(() => {
    if (!firestore || !isAccordionOpen) return null;
    return query(collection(firestore, 'destinations', destination.id, 'visits'), where('year', '==', selectedYear));
  }, [firestore, destination.id, selectedYear, isAccordionOpen]);

  const { data: fetchedVisitData } = useCollection<VisitData>(visitsQuery);
  
  const displayData = useMemo(() => {
    return months.map((monthName, index) => {
        const monthIndex = index + 1;
        const id = `${destination.id}-${selectedYear}-${monthIndex}`;
        
        if (pendingChanges[id]) {
            return pendingChanges[id];
        }

        const existingData = fetchedVisitData?.find(d => d.month === monthIndex);
        if (existingData) {
            return existingData;
        }
        
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const isFutureOrLocked = selectedYear > currentYear || (selectedYear === currentYear && monthIndex > currentMonth);

        return {
            id: id,
            destinationId: destination.id,
            year: selectedYear,
            month: monthIndex,
            monthName: monthName,
            wisnus: 0,
            wisman: 0,
            wismanDetails: [],
            totalVisitors: 0,
            locked: appUser?.role === 'admin' ? true : isFutureOrLocked,
        };
    }).sort((a, b) => a.month - b.month);
  }, [fetchedVisitData, pendingChanges, destination.id, selectedYear, appUser?.role]);
  
  const handleLocalDataChange = (monthIndex: number, field: 'wisnus', value: number) => {
    const monthData = displayData.find(d => d.month === monthIndex + 1);

    if (monthData) {
        const updatedMonthData: VisitData = {
            ...monthData,
            [field]: value,
            totalVisitors: value + monthData.wisman,
        };
        if(appUser?.uid) updatedMonthData.lastUpdatedBy = appUser.uid;
      
      onDataChange(updatedMonthData); // Bubble up the single change to parent
    }
  };

  const handleWismanDetailsChange = (monthIndex: number, wismanDetails: WismanDetail[]) => {
     const monthData = displayData.find(d => d.month === monthIndex + 1);
     if (monthData) {
        const wisman = wismanDetails.reduce((sum, detail) => sum + (detail.count || 0), 0);
        const updatedMonthData: VisitData = {
          ...monthData,
          wismanDetails,
          wisman,
          totalVisitors: monthData.wisnus + wisman,
        };
        if(appUser?.uid) updatedMonthData.lastUpdatedBy = appUser.uid;

        onDataChange(updatedMonthData); // Bubble up the single change to parent
     }
  }

  const handleLockChange = (monthIndex: number, locked: boolean) => {
    const monthData = displayData.find(d => d.month === monthIndex + 1);
    if (monthData) {
        const updatedMonthData: VisitData = { ...monthData, locked };
        if(appUser?.uid) updatedMonthData.lastUpdatedBy = appUser.uid;

        onLockChange(updatedMonthData); // Save immediately
    }
  }

  const yearlyTotals = useMemo(() => {
    return displayData.reduce((acc, curr) => {
        if (!curr) return acc;
        acc.wisnus += curr.wisnus || 0;
        acc.wisman += curr.wisman || 0;
        acc.totalVisitors += curr.totalVisitors || 0;
        return acc;
    }, { wisnus: 0, wisman: 0, totalVisitors: 0});
  }, [displayData]);

  return (
    <AccordionItem value={destination.id} onFocus={() => setAccordionValue([destination.id])} onClick={() => setAccordionValue(isAccordionOpen ? [] : [destination.id])}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-center justify-between pr-4">
          <span className={cn("font-semibold", colorClass)}>{destination.name} - {selectedYear}</span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <span>Domestik: <span className="font-bold">{yearlyTotals.wisnus.toLocaleString()}</span></span>
            <span>Asing: <span className="font-bold">{yearlyTotals.wisman.toLocaleString()}</span></span>
            <span>Total: <span className="font-bold">{yearlyTotals.totalVisitors.toLocaleString()}</span></span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-1">
            {hasUnsavedChanges && (
                <div className="flex items-center justify-end p-2 mb-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800/50">
                    <span className="text-sm text-yellow-800 dark:text-yellow-200 mr-4">Anda memiliki perubahan yang belum disimpan.</span>
                    <Button size="sm" onClick={onManualSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                    </Button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/50">
                        <TableHead className="w-[120px]">Bulan</TableHead>
                        <TableHead>Wis. Domestik</TableHead>
                        <TableHead>Wis. Asing</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[150px] text-center">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayData.map((monthData, index) => {
                        if (!monthData) return null;
                        const isLocked = monthData.locked || false;

                        return (
                            <TableRow key={index} className={isLocked ? 'bg-muted/30' : ''}>
                                <TableCell className="font-medium">{monthData.monthName}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        className="h-8 w-24 border-0 shadow-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-70"
                                        value={monthData.wisnus || 0}
                                        onChange={(e) => handleLocalDataChange(index, 'wisnus', parseInt(e.target.value, 10) || 0)}
                                        disabled={isLocked}
                                    />
                                </TableCell>
                                <TableCell>
                                    <WismanPopover 
                                        details={monthData.wismanDetails || []}
                                        totalWisman={monthData.wisman || 0}
                                        onChange={(newDetails) => handleWismanDetailsChange(index, newDetails)}
                                        disabled={isLocked}
                                    />
                                </TableCell>
                                <TableCell className="text-right font-medium">{monthData.totalVisitors.toLocaleString() || 0}</TableCell>
                                <TableCell className="text-center">
                                    {appUser?.role === 'admin' ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                            <Switch 
                                                checked={isLocked}
                                                onCheckedChange={(checked) => handleLockChange(index, checked)}
                                                aria-label="Kunci Data"
                                            />
                                        </div>
                                    ) : (
                                        isLocked ? (
                                            <UnlockRequestDialog 
                                                destination={destination}
                                                monthData={monthData}
                                                onNewRequest={onNewRequest as any}
                                            />
                                        ) : (
                                           <div className="flex items-center justify-center text-sm text-green-600 gap-2">
                                            <Unlock className="h-4 w-4" />
                                            <span>Terbuka</span>
                                           </div>
                                        )
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-secondary/50 font-bold">
                        <TableCell>Total Tahunan</TableCell>
                        <TableCell>{yearlyTotals.wisnus.toLocaleString()}</TableCell>
                        <TableCell>{yearlyTotals.wisman.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{yearlyTotals.totalVisitors.toLocaleString()}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function WismanPopover({ details, totalWisman, onChange, disabled }: { details: WismanDetail[], totalWisman: number, onChange: (details: WismanDetail[]) => void, disabled?: boolean }) {
    
    const handleDetailChange = (index: number, field: keyof WismanDetail, value: string | number) => {
        const newDetails = [...details];
        if (field === 'country') {
            newDetails[index][field] = String(value);
        } else {
            newDetails[index][field] = Number(value);
        }
        onChange(newDetails);
    };

    const addEntry = () => {
        onChange([...details, { country: '', count: 0 }]);
    };

    const removeEntry = (index: number) => {
        onChange(details.filter((_, i) => i !== index));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-24 cursor-pointer border-0 shadow-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-70 justify-start"
                  disabled={disabled}>
                   {totalWisman > 0 ? totalWisman.toLocaleString() : 'Input'}
                </Button>
            </PopoverTrigger>
            <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-96">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Rincian Wisatawan Asing</h4>
                        <p className="text-sm text-muted-foreground">
                            Tambahkan jumlah pengunjung per negara asal.
                        </p>
                    </div>
                    <div className="grid gap-2 max-h-60 overflow-y-auto pr-3">
                        {details.map((detail, index) => (
                           <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                <Input
                                    type="text"
                                    placeholder="Nama Negara"
                                    value={detail.country}
                                    className="h-9"
                                    onChange={(e) => handleDetailChange(index, 'country', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Jumlah"
                                    value={detail.count || ''}
                                    className="h-9 w-24"
                                    onChange={(e) => handleDetailChange(index, 'count', e.target.value)}
                                />
                                 <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeEntry(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-between items-center pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Negara
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default function DataEntryPage() {
  const { appUser } = useUser();
  const firestore = useFirestore();
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('all');
  const { toast } = useToast();
  
  const [pendingChanges, setPendingChanges] = useState<Record<string, VisitData>>({});
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  const destinationsQuery = useMemoFirebase(() => {
    if (!firestore || !appUser) return null;

    let q = query(collection(firestore, 'destinations'), where('status', '==', 'aktif'));
    
    if (appUser.role === 'pengelola') {
      if (appUser.assignedLocations && appUser.assignedLocations.length > 0) {
        q = query(q, where('id', 'in', appUser.assignedLocations));
      } else {
        return query(q, where('id', 'in', ['non-existent-id']));
      }
    }

    return q;
  }, [firestore, appUser]);

  
  const { data: destinations } = useCollection<Destination>(destinationsQuery);
  
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 7}, (_, i) => currentYear + 1 - i);
    return years.map(String);
  }, []);

  useEffect(() => {
    if (!availableYears.includes(selectedYear.toString())) {
        setSelectedYear(new Date().getFullYear());
    }
  }, [availableYears, selectedYear]);

  const handleDataChange = useCallback((updatedData: VisitData) => {
    setPendingChanges(prev => ({
        ...prev,
        [updatedData.id]: updatedData,
    }));
  }, []);
  
  const handleManualSave = () => {
    if (!firestore || !hasUnsavedChanges) return;
    
    const batch = writeBatch(firestore);
    const batchOperations: Record<string, any> = {};

    Object.values(pendingChanges).forEach(updatedData => {
        const visitDocRef = doc(firestore, 'destinations', updatedData.destinationId, 'visits', updatedData.id);
        const dataToSet: Partial<VisitData> = { ...updatedData };
        if (!dataToSet.lastUpdatedBy && appUser?.uid) {
            dataToSet.lastUpdatedBy = appUser.uid;
        }
        batch.set(visitDocRef, dataToSet, { merge: true });
        batchOperations[visitDocRef.path] = dataToSet;
    });

    batch.commit()
      .then(() => {
        toast({
          title: "Perubahan Disimpan",
          description: "Semua perubahan Anda telah berhasil disimpan.",
        });
        setPendingChanges({});
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: 'destinations/{destId}/visits',
            operation: 'update',
            requestResourceData: { batchUpdates: batchOperations },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  const handleLockChange = async (updatedData: VisitData) => {
    if (!firestore) return;
    const visitDocRef = doc(firestore, 'destinations', updatedData.destinationId, 'visits', updatedData.id);
    
    const dataToSet: Partial<VisitData> = { locked: updatedData.locked };
    if (appUser?.uid) {
        dataToSet.lastUpdatedBy = appUser.uid;
    }

    setDoc(visitDocRef, dataToSet, { merge: true })
        .then(() => {
             toast({
                title: `Data ${updatedData.locked ? 'Dikunci' : 'Dibuka'}`,
                description: `Data untuk bulan ${updatedData.monthName} telah ${updatedData.locked ? 'dikunci' : 'dibuka'}.`,
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: visitDocRef.path,
                operation: 'update',
                requestResourceData: dataToSet,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  const handleNewRequest = async (newRequest: Omit<UnlockRequest, 'id' | 'timestamp'>) => {
    if (!firestore) return;
    const requestsCollection = collection(firestore, 'unlock-requests');
    const requestData = {
        ...newRequest,
        timestamp: serverTimestamp()
    };
    
    addDoc(requestsCollection, requestData)
      .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: 'unlock-requests',
              operation: 'create',
              requestResourceData: requestData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });
  }
  
  const handleAddYear = async () => {
    const newYear = (parseInt(availableYears[0]) || new Date().getFullYear()) + 1;
    if (!firestore || !destinations) return;
  
    const batch = writeBatch(firestore);
    const newVisitEntries: VisitData[] = [];
  
    destinations.forEach(dest => {
      months.forEach((monthName, index) => {
        const monthIndex = index + 1;
        const visitId = `${dest.id}-${newYear}-${monthIndex}`;
        const visitDocRef = doc(firestore, 'destinations', dest.id, 'visits', visitId);
        const newVisitData: VisitData = {
          id: visitId,
          destinationId: dest.id,
          year: newYear,
          month: monthIndex,
          monthName: monthName,
          wisnus: 0,
          wisman: 0,
          wismanDetails: [],
          totalVisitors: 0,
          locked: true,
        };
        batch.set(visitDocRef, newVisitData);
        newVisitEntries.push(newVisitData);
      });
    });
  
    batch.commit()
      .then(() => {
        setSelectedYear(newYear);
        toast({
          title: "Tahun Ditambahkan",
          description: `Tahun ${newYear} telah ditambahkan. Anda sekarang dapat mengelola data untuk tahun tersebut.`
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'destinations/{destId}/visits',
          operation: 'create',
          requestResourceData: {
            year: newYear,
            destinations: destinations.map(d => d.id),
            batchOperations: newVisitEntries
          },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteYear = async () => {
    if (availableYears.length <= 1) {
        toast({
            variant: "destructive",
            title: "Tindakan Ditolak",
            description: "Tidak dapat menghapus satu-satunya tahun yang tersedia."
        });
        return;
    }

    if (!firestore || !destinations) return;
    
    const batch = writeBatch(firestore);
    const pathsToDelete: string[] = [];

    try {
        for (const dest of destinations) {
            const visitsRef = collection(firestore, 'destinations', dest.id, 'visits');
            const q = query(visitsRef, where('year', '==', selectedYear));
            const snapshot = await getDocs(q);
            snapshot.docs.forEach(d => {
                batch.delete(d.ref);
                pathsToDelete.push(d.ref.path);
            });
        }
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: `destinations/{destId}/visits`,
            operation: 'list', // The failing operation is the getDocs query
            requestResourceData: { year: selectedYear }
        });
        errorEmitter.emit('permission-error', permissionError);
        return; // Stop execution
    }
    
    batch.commit()
      .then(() => {
        const newYear = availableYears.find(y => y !== selectedYear.toString()) || new Date().getFullYear().toString();
        setSelectedYear(parseInt(newYear));
        toast({
            title: "Tahun Dihapus",
            description: `Semua data untuk tahun ${selectedYear} telah dihapus.`,
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `destinations/{destId}/visits`,
            operation: 'delete',
            requestResourceData: { 
                year: selectedYear,
                pathsToDelete
            }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const dataByDestination = useMemo(() => {
    if (!destinations) return [];
    
    return selectedDestinationFilter === 'all'
      ? destinations
      : destinations.filter(d => d.id === selectedDestinationFilter);

  }, [destinations, selectedDestinationFilter]);

  if (!appUser) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Input Data Kunjungan</h1>
        <p className="text-muted-foreground">
          {appUser.role === 'admin' 
            ? 'Pilih destinasi untuk mengelola dan mengunci data kunjungan.' 
            : 'Pilih destinasi Anda untuk melihat dan mengedit data kunjungan.'}
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Data Kunjungan Tahun {selectedYear}</CardTitle>
              <CardDescription>Klik pada setiap destinasi untuk mengelola data.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={selectedDestinationFilter} onValueChange={setSelectedDestinationFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Pilih Destinasi" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Semua Destinasi</SelectItem>
                      {(destinations || []).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => (
                        <SelectItem key={year} value={year}>
                            Tahun {year}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
               {appUser.role === 'admin' && (
                  <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" onClick={handleAddYear}>
                          <PlusCircle className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <DialogTrigger asChild>
                              <Button variant="destructive" size="icon" disabled={availableYears.length <= 1}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </DialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Semua Data Tahun {selectedYear}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Tindakan ini akan menghapus semua data kunjungan untuk tahun <span className="font-bold">{selectedYear}</span> di semua destinasi. Tindakan ini tidak dapat diurungkan.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteYear} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </div>
               )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-2">
              {dataByDestination
                .map((destination, index) => (
                  <DestinationDataEntry 
                    key={`${destination.id}-${selectedYear}`}
                    destination={destination} 
                    onDataChange={handleDataChange}
                    onLockChange={handleLockChange}
                    onNewRequest={handleNewRequest as any}
                    colorClass={colorPalette[index % colorPalette.length]}
                    selectedYear={selectedYear}
                    onManualSave={handleManualSave}
                    hasUnsavedChanges={hasUnsavedChanges}
                    pendingChanges={pendingChanges}
                  />
              ))}
            </Accordion>
             {dataByDestination.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <p>Tidak ada data untuk destinasi atau tahun yang dipilih.</p>
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}

    

    