
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { PlusCircle, Trash2, Lock, Unlock, KeyRound } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Combobox } from '@/components/ui/combobox';
import { useUser, useFirestore, useCollection, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { collection, query, where, doc, setDoc, writeBatch, getDocs, serverTimestamp, addDoc, collectionGroup, QuerySnapshot, DocumentData } from 'firebase/firestore';


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

function DestinationDataEntry({ destination, initialData, onDataChange, onNewRequest, colorClass }: { destination: Destination, initialData: VisitData[], onDataChange: (updatedData: VisitData) => void, onNewRequest: (req: Omit<UnlockRequest, 'id' | 'timestamp'>) => void, colorClass: string }) {
  const [data, setData] = useState<VisitData[]>(initialData);
  const { toast } = useToast();
  const { appUser } = useUser();
  const firestore = useFirestore();
  const countriesQuery = useMemo(() => firestore ? collection(firestore, 'countries') : null, [firestore]);
  const { data: countries } = useCollection<Country>(countriesQuery);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((newData: VisitData) => {
      onDataChange(newData);
    }, 1000),
    [onDataChange]
  );
  
  const handleDataChange = (monthIndex: number, field: 'wisnus', value: number) => {
    const newData = [...data];
    const monthData = newData.find(d => d.month === monthIndex + 1);

    if (monthData) {
        const updatedMonthData: VisitData = {
            ...monthData,
            [field]: value,
            totalVisitors: value + monthData.wisman,
        };
        if(appUser?.uid) updatedMonthData.lastUpdatedBy = appUser.uid;
      
      setData(newData.map(d => d.month === monthIndex + 1 ? updatedMonthData : d));
      debouncedSave(updatedMonthData);
    }
  };

  const handleWismanDetailsChange = (monthIndex: number, wismanDetails: WismanDetail[]) => {
     const newData = [...data];
     const monthData = newData.find(d => d.month === monthIndex + 1);
     if (monthData) {
        const wisman = wismanDetails.reduce((sum, detail) => sum + (detail.count || 0), 0);
        const updatedMonthData: VisitData = {
          ...monthData,
          wismanDetails,
          wisman,
          totalVisitors: monthData.wisnus + wisman,
        };
        if(appUser?.uid) updatedMonthData.lastUpdatedBy = appUser.uid;

        setData(newData.map(d => d.month === monthIndex + 1 ? updatedMonthData : d));
        debouncedSave(updatedMonthData);
     }
  }

  const handleLockChange = (monthIndex: number, locked: boolean) => {
    const monthData = data.find(d => d.month === monthIndex + 1);
    if (monthData) {
        const updatedMonthData: VisitData = { ...monthData, locked };
        if(appUser?.uid) updatedMonthData.lastUpdatedBy = appUser.uid;

        onDataChange(updatedMonthData); // Save immediately
        toast({
            title: `Data ${locked ? 'Dikunci' : 'Dibuka'}`,
            description: `Data untuk bulan ${monthData.monthName} telah ${locked ? 'dikunci' : 'dibuka'}.`,
        });
    }
  }

  const yearlyTotals = useMemo(() => {
    return data.reduce((acc, curr) => {
        acc.wisnus += curr.wisnus;
        acc.wisman += curr.wisman;
        acc.totalVisitors += curr.totalVisitors;
        return acc;
    }, { wisnus: 0, wisman: 0, totalVisitors: 0});
  }, [data]);

  return (
    <AccordionItem value={destination.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-center justify-between pr-4">
          <span className={cn("font-semibold", colorClass)}>{destination.name} - {initialData[0]?.year || 'N/A'}</span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <span>Domestik: <span className="font-bold">{yearlyTotals.wisnus.toLocaleString()}</span></span>
            <span>Asing: <span className="font-bold">{yearlyTotals.wisman.toLocaleString()}</span></span>
            <span>Total: <span className="font-bold">{yearlyTotals.totalVisitors.toLocaleString()}</span></span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-1">
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
                    {months.map((monthName, index) => {
                        const monthData = data.find(d => d.month === index + 1);
                        const isLocked = monthData?.locked || false;
                        
                        if (!monthData) return null;

                        return (
                            <TableRow key={index} className={isLocked ? 'bg-muted/30' : ''}>
                                <TableCell className="font-medium">{monthName}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        className="h-8 w-24 border-0 shadow-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-70"
                                        value={monthData.wisnus || 0}
                                        onChange={(e) => handleDataChange(index, 'wisnus', parseInt(e.target.value, 10) || 0)}
                                        disabled={isLocked}
                                    />
                                </TableCell>
                                <TableCell>
                                    <WismanPopover 
                                        details={monthData.wismanDetails || []}
                                        totalWisman={monthData.wisman || 0}
                                        onSave={(newDetails) => handleWismanDetailsChange(index, newDetails)}
                                        disabled={isLocked}
                                        countries={countries || []}
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

function WismanPopover({ details, totalWisman, onSave, disabled, countries }: { details: WismanDetail[], totalWisman: number, onSave: (details: WismanDetail[]) => void, disabled?: boolean, countries: Country[] }) {
    const [wismanDetails, setWismanDetails] = useState(details);
    
    useEffect(() => {
        setWismanDetails(details);
    }, [details]);

    const countryOptions = useMemo(() => (countries || []).map(c => ({ label: c.name, value: c.name })).sort((a, b) => a.label.localeCompare(b.label)), [countries]);

    const handleDetailChange = (index: number, field: keyof WismanDetail, value: string | number) => {
        const newDetails = [...wismanDetails];
        if (field === 'count') {
            newDetails[index][field] = Number(value);
        } else {
            newDetails[index][field] = String(value);
        }
        setWismanDetails(newDetails);
    };

    const addEntry = () => {
        setWismanDetails([...wismanDetails, { country: '', count: 0 }]);
    };

    const removeEntry = (index: number) => {
        const newDetails = wismanDetails.filter((_, i) => i !== index);
        setWismanDetails(newDetails);
    };

    const handleSave = () => {
        onSave(wismanDetails.filter(d => d.country && d.count > 0));
    }

    return (
        <Popover onOpenChange={(open) => !open && handleSave()}>
            <PopoverTrigger asChild>
                <Input
                    type="number"
                    readOnly
                    value={totalWisman}
                    className="h-8 w-24 cursor-pointer border-0 shadow-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-70"
                    placeholder="Input Rincian"
                    disabled={disabled}
                />
            </PopoverTrigger>
            <PopoverContent className="w-96">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Rincian Wisatawan Asing</h4>
                        <p className="text-sm text-muted-foreground">
                            Tambahkan jumlah pengunjung per negara asal.
                        </p>
                    </div>
                    <div className="grid gap-2 max-h-60 overflow-y-auto pr-3">
                        {wismanDetails.map((detail, index) => (
                           <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                <Combobox
                                  options={countryOptions}
                                  value={detail.country}
                                  onChange={(value) => handleDetailChange(index, 'country', value)}
                                  placeholder="Cari negara..."
                                  inputPlaceholder="Pilih Negara"
                                />
                                <Input
                                    type="number"
                                    placeholder="Jumlah"
                                    value={detail.count}
                                    className="h-9 w-24"
                                    onChange={(e) => handleDetailChange(index, 'count', e.target.value)}
                                />
                                 <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeEntry(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Negara
                    </Button>
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
  
  const destinationsQuery = useMemo(() => {
    if (!firestore || !appUser) return null;

    let constraints = [where('status', '==', 'aktif')];
    
    if (appUser.role === 'admin') {
      return query(collection(firestore, 'destinations'), ...constraints);
    }
    
    if (appUser.role === 'pengelola' && appUser.assignedLocations && appUser.assignedLocations.length > 0) {
      constraints.push(where('id', 'in', appUser.assignedLocations));
      return query(collection(firestore, 'destinations'), ...constraints);
    }

    if (appUser.role === 'pengelola') {
        return query(collection(firestore, 'destinations'), where('id', 'in', ['non-existent-id']));
    }

    return null;
  }, [firestore, appUser]);

  
  const { data: destinations } = useCollection<Destination>(destinationsQuery);

  const visitsQuery = useMemo(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'visits');
  }, [firestore]);

  const { data: allVisitData, setData: setAllVisitData } = useCollection<VisitData>(visitsQuery);
  
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (!allVisitData) return [currentYear.toString()];
    const yearsFromData = [...new Set(allVisitData.map(d => d.year))].sort((a,b) => b-a);
    if (!yearsFromData.includes(currentYear)) {
      yearsFromData.unshift(currentYear);
    }
    return yearsFromData.map(String);
  }, [allVisitData]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear.toString())) {
        setSelectedYear(new Date().getFullYear());
    }
  }, [availableYears, selectedYear]);

  const handleDataChange = async (updatedData: VisitData) => {
    if (!firestore) return;
    const visitDocRef = doc(firestore, 'destinations', updatedData.destinationId, 'visits', updatedData.id);
    
    const dataToSet: Partial<VisitData> = { ...updatedData };
    if (!dataToSet.lastUpdatedBy) {
        delete dataToSet.lastUpdatedBy;
    }

    setDoc(visitDocRef, dataToSet, { merge: true })
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
    if (!availableYears.includes(newYear.toString()) && firestore && destinations) {
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
              wisnus: 0, wisman: 0, wismanDetails: [], totalVisitors: 0,
              locked: true,
          };
          batch.set(visitDocRef, newVisitData);
          newVisitEntries.push(newVisitData);
        });
      });
      
      batch.commit()
        .then(() => {
            setAllVisitData(prevData => [...(prevData || []), ...newVisitEntries]);
            setSelectedYear(newYear);
            toast({
                title: "Tahun Ditambahkan",
                description: `Tahun ${newYear} telah ditambahkan. Anda sekarang dapat mengelola data untuk tahun tersebut.`
            });
        })
        .catch(async (serverError) => {
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
    }
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
        setAllVisitData(prevData => (prevData || []).filter(d => d.year !== selectedYear));
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
    if (!destinations || !allVisitData) return [];
    
    const filteredDestinations = selectedDestinationFilter === 'all'
      ? destinations
      : destinations.filter(d => d.id === selectedDestinationFilter);

    return filteredDestinations.map(dest => {
      let destData = allVisitData.filter(d => d.destinationId === dest.id && d.year === selectedYear);
      
      if (destData.length === 0 || destData.length < 12) {
          const fullYearData = months.map((monthName, index) => {
              const monthIndex = index + 1;
              const existingData = destData.find(d => d.month === monthIndex);
              if (existingData) return existingData;

              return {
                  id: `${dest.id}-${selectedYear}-${monthIndex}`,
                  destinationId: dest.id,
                  year: selectedYear,
                  month: monthIndex,
                  monthName: monthName,
                  wisnus: 0,
                  wisman: 0,
                  wismanDetails: [],
                  totalVisitors: 0,
                  locked: true,
              };
          });
          return { destination: dest, data: fullYearData.sort((a,b) => a.month - b.month) };
      }
      
      return { destination: dest, data: destData.sort((a,b) => a.month - b.month) };
    });
  }, [destinations, allVisitData, selectedYear, selectedDestinationFilter]);

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Kunjungan Tahun {selectedYear}</CardTitle>
              <CardDescription>Klik pada setiap destinasi untuk mengelola data.</CardDescription>
            </div>
             
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
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
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={availableYears.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
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
                .map(({ destination, data }, index) => (
                  <DestinationDataEntry 
                    key={`${destination.id}-${selectedYear}`}
                    destination={destination} 
                    initialData={data}
                    onDataChange={handleDataChange}
                    onNewRequest={handleNewRequest as any}
                    colorClass={colorPalette[index % colorPalette.length]}
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

    