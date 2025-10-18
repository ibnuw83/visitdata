
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
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

function DestinationDataEntry({ destination, initialData, onDataChange, onNewRequest, colorClass }: { destination: Destination, initialData: VisitData[], onDataChange: (updatedData: VisitData[]) => void, onNewRequest: (req: UnlockRequest) => void, colorClass: string }) {
  const [data, setData] = useState<VisitData[]>(initialData);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((newData: VisitData[]) => {
      onDataChange(newData);
    }, 1000),
    [onDataChange]
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
        onDataChange(newData); // Save immediately
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
        const fetchCountries = () => setCountries(getCountries());
        fetchCountries();
        window.addEventListener('storage', fetchCountries);
        return () => window.removeEventListener('storage', fetchCountries);
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
  
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    if (!user) return;
    
    const allDestinations = getDestinations();
    let userDestinations = allDestinations;
    if (user.role === 'pengelola') {
        userDestinations = allDestinations.filter(d => user.assignedLocations.includes(d.id));
    }
    setDestinations(userDestinations);

    const visitData = getVisitData();
    setAllVisitData(visitData);
    setUnlockRequests(getUnlockRequests());
    
    const yearsFromData = [...new Set(visitData.map(d => d.year))].sort((a,b) => b-a);
    const currentYear = new Date().getFullYear();
    const allYears = [...new Set([currentYear, ...yearsFromData])].sort((a,b) => b-a);

    setAvailableYears(allYears);
    if (!allYears.includes(selectedYear)) {
        setSelectedYear(allYears[0] || currentYear);
    }
  }, [user, selectedYear]);

  useEffect(() => {
    fetchData();
    window.addEventListener('storage', fetchData);
    return () => {
        window.removeEventListener('storage', fetchData);
    }
  }, [fetchData]);

  const handleDataChange = (updatedData: VisitData[]) => {
    const allData = getVisitData();
    const updatedIds = new Set(updatedData.map(d => d.id));
    const unaffectedData = allData.filter(d => !updatedIds.has(d.id));
    const newAllVisitData = [...unaffectedData, ...updatedData];
    saveVisitData(newAllVisitData);
    
    // Optimistic UI update
    setAllVisitData(newAllVisitData);

    toast({
        title: "Data Disimpan Otomatis",
        description: `Perubahan untuk destinasi telah disimpan.`,
      });
  }

  const handleNewRequest = (newRequest: UnlockRequest) => {
    const currentRequests = getUnlockRequests();
    const updatedRequests = [...currentRequests, newRequest];
    saveUnlockRequests(updatedRequests);
  }
  
  const handleAddYear = () => {
    const newYear = (availableYears[0] || new Date().getFullYear()) + 1;
    if (!availableYears.includes(newYear)) {
      setAvailableYears([newYear, ...availableYears]);
      setSelectedYear(newYear);
    }
  };

  const dataByDestination = useMemo(() => {
    return destinations.map(dest => {
      let destData = allVisitData.filter(d => d.destinationId === dest.id && d.year === selectedYear);
      
      if (destData.length === 0 || destData.length < 12) {
          const existingMonths = new Set(destData.map(d => d.month));
          const fullYearData = months.map((monthName, index) => {
              const monthIndex = index + 1;
              const existingData = destData.find(d => d.month === monthIndex);
              if (existingData) return existingData;

              return {
                  id: `visit-${dest.id}-${selectedYear}-${monthIndex}`,
                  destinationId: dest.id,
                  year: selectedYear,
                  month: monthIndex,
                  monthName: monthName,
                  wisnus: 0,
                  wisman: 0,
                  wismanDetails: [],
                  eventVisitors: 0,
                  historicalVisitors: 0,
                  totalVisitors: 0,
                  locked: true,
              };
          });
          destData = fullYearData;
      }
      
      return { destination: dest, data: destData.sort((a,b) => a.month - b.month) };
    });
  }, [destinations, allVisitData, selectedYear]);

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Kunjungan Tahun {selectedYear}</CardTitle>
              <CardDescription>Klik pada setiap destinasi untuk mengelola data.</CardDescription>
            </div>
             
              <div className="flex items-center gap-2">
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                      {availableYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                              Tahun {year}
                          </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                 {user.role === 'admin' && (
                    <Button variant="outline" size="icon" onClick={handleAddYear}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                 )}
              </div>
            
          </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-2">
              {dataByDestination
                .filter(d => d.destination.status === 'aktif')
                .map(({ destination, data }, index) => (
                  <DestinationDataEntry 
                    key={`${destination.id}-${selectedYear}`}
                    destination={destination} 
                    initialData={data}
                    onDataChange={handleDataChange}
                    onNewRequest={handleNewRequest}
                    colorClass={colorPalette[index % colorPalette.length]}
                  />
              ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
