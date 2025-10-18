
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
import { getDestinations, getVisitData, saveVisitData, getCountries, getUnlockRequests, saveUnlockRequests } from "@/lib/local-data-service";
import { Destination, VisitData, WismanDetail, Country, UnlockRequest } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Trash2, Lock, Unlock, KeyRound } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/context/auth-context';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';


const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('id-ID', { month: 'long' }));

function UnlockRequestDialog({ destination, monthData, onNewRequest }: { destination: Destination, monthData: VisitData, onNewRequest: (req: UnlockRequest) => void }) {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'Alasan tidak boleh kosong' });
            return;
        }
        if (!user) return;

        const newRequest: UnlockRequest = {
            id: `req-${Date.now()}`,
            destinationId: destination.id,
            month: monthData.month,
            year: monthData.year,
            reason: reason,
            status: 'pending',
            requestedBy: user.uid,
            timestamp: new Date().toISOString(),
        };

        onNewRequest(newRequest);
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

function DestinationDataEntry({ destination, initialData, onDataChange, onNewRequest }: { destination: Destination, initialData: VisitData[], onDataChange: (updatedData: VisitData[]) => void, onNewRequest: (req: UnlockRequest) => void }) {
  const [data, setData] = useState<VisitData[]>(initialData);
  const { toast } = useToast();
  const { user } = useAuth();

  const debouncedSave = useCallback(
    debounce((newData: VisitData[]) => {
      onDataChange(newData);
      toast({
        title: "Data Disimpan",
        description: `Perubahan untuk ${destination.name} telah disimpan otomatis.`,
      });
    }, 1000),
    [destination.name]
  );
  
  const handleDataChange = (monthIndex: number, field: 'wisnus', value: number) => {
    const newData = [...data];
    const monthData = newData.find(d => d.month === monthIndex + 1);

    if (monthData) {
      monthData[field] = value;
      monthData.totalVisitors = monthData.wisnus + monthData.wisman;
      setData(newData);
      debouncedSave(newData);
    }
  };

  const handleWismanDetailsChange = (monthIndex: number, wismanDetails: WismanDetail[]) => {
     const newData = [...data];
     const monthData = newData.find(d => d.month === monthIndex + 1);
     if (monthData) {
        monthData.wismanDetails = wismanDetails;
        monthData.wisman = wismanDetails.reduce((sum, detail) => sum + (detail.count || 0), 0);
        monthData.totalVisitors = monthData.wisnus + monthData.wisman;
        setData(newData);
        debouncedSave(newData);
     }
  }

  const handleLockChange = (monthIndex: number, locked: boolean) => {
    const newData = [...data];
    const monthData = newData.find(d => d.month === monthIndex + 1);
    if (monthData) {
        monthData.locked = locked;
        setData(newData);
        debouncedSave(newData);
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
          <span className="font-semibold text-primary">{destination.name} - {initialData[0]?.year || 'N/A'}</span>
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
                                    />
                                </TableCell>
                                <TableCell className="text-right font-medium">{monthData.totalVisitors.toLocaleString() || 0}</TableCell>
                                <TableCell className="text-center">
                                    {user?.role === 'admin' ? (
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
                                                onNewRequest={onNewRequest}
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

function WismanPopover({ details, totalWisman, onSave, disabled }: { details: WismanDetail[], totalWisman: number, onSave: (details: WismanDetail[]) => void, disabled?: boolean }) {
    const [wismanDetails, setWismanDetails] = useState(details);
    const [countries, setCountries] = useState<Country[]>([]);
    
    useEffect(() => {
        setWismanDetails(details);
    }, [details]);
    
    useEffect(() => {
        setCountries(getCountries());
    }, []);

    const countryOptions = useMemo(() => countries.map(c => ({ label: c.name, value: c.name })), [countries]);

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
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [allVisitData, setAllVisitData] = useState<VisitData[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // This now runs only on client
    const allDestinations = getDestinations();
    if (user?.role === 'pengelola') {
        // Filter destinations for 'pengelola'
        const assignedDestinations = allDestinations.filter(d => user.assignedLocations.includes(d.id));
        setDestinations(assignedDestinations);
    } else {
        // 'admin' sees all destinations
        setDestinations(allDestinations);
    }
    setAllVisitData(getVisitData());
    setUnlockRequests(getUnlockRequests());
  }, [user]);

  const handleDataChange = (updatedData: VisitData[]) => {
    // A bit complex: we need to merge the changes from one destination
    // back into the main `allVisitData` state.
    const updatedIds = new Set(updatedData.map(d => d.id));
    const unaffectedData = allVisitData.filter(d => !updatedIds.has(d.id));
    const newAllVisitData = [...unaffectedData, ...updatedData];
    setAllVisitData(newAllVisitData);
    saveVisitData(newAllVisitData);
  }

  const handleNewRequest = (newRequest: UnlockRequest) => {
    const updatedRequests = [...unlockRequests, newRequest];
    setUnlockRequests(updatedRequests);
    saveUnlockRequests(updatedRequests);
  }

  const dataByDestination = useMemo(() => {
    return destinations.map(dest => {
      const destData = allVisitData.filter(d => d.destinationId === dest.id && d.year === year);
      
      // If no data for the year, create a default structure for all 12 months
      if (destData.length < 12) {
          const existingMonths = destData.map(d => d.month);
          const missingMonthsData = months
            .map((monthName, index) => ({ monthName, monthIndex: index + 1 }))
            .filter(({ monthIndex }) => !existingMonths.includes(monthIndex))
            .map(({ monthName, monthIndex }) => ({
                id: `visit-${dest.id}-${year}-${monthIndex}`,
                destinationId: dest.id,
                year: year,
                month: monthIndex,
                monthName: monthName,
                wisnus: 0,
                wisman: 0,
                wismanDetails: [],
                eventVisitors: 0,
                historicalVisitors: 0,
                totalVisitors: 0,
                locked: true, // Default new entries to locked
            }));
          const fullYearData = [...destData, ...missingMonthsData].sort((a, b) => a.month - b.month);
           return { destination: dest, data: fullYearData };
      }
      
      return { destination: dest, data: destData.sort((a,b) => a.month - b.month) };
    });
  }, [destinations, allVisitData, year]);

  if (!user) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Input Data Kunjungan</h1>
        <p className="text-muted-foreground">
          {user.role === 'admin' 
            ? 'Pilih destinasi untuk mengelola dan mengunci data kunjungan.' 
            : 'Pilih destinasi Anda untuk melihat dan mengedit data kunjungan.'}
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Data Kunjungan Tahun {year}</CardTitle>
            <CardDescription>Klik pada setiap destinasi untuk mengelola data.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-2">
              {dataByDestination
                .filter(d => d.destination.status === 'aktif')
                .map(({ destination, data }) => (
                  <DestinationDataEntry 
                    key={destination.id} 
                    destination={destination} 
                    initialData={data}
                    onDataChange={handleDataChange}
                    onNewRequest={handleNewRequest}
                  />
              ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

    