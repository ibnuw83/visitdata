'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDestinations, getVisitData, saveVisitData } from "@/lib/local-data-service";
import { Destination, VisitData, WismanDetail } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function DataEntryPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const { toast } = useToast();

  // Form state
  const [destinationId, setDestinationId] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [wisnus, setWisnus] = useState(0);
  const [wismanDetails, setWismanDetails] = useState<WismanDetail[]>([{ country: '', count: 0 }]);
  const [eventVisitors, setEventVisitors] = useState(0);
  const [historicalVisitors, setHistoricalVisitors] = useState(0);

  useEffect(() => {
    setDestinations(getDestinations());
    setVisitData(getVisitData());
  }, []);

  const years = [...new Set(visitData.map(d => d.year))].sort((a,b) => b-a);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

  const handleWismanDetailChange = (index: number, field: keyof WismanDetail, value: string | number) => {
    const newDetails = [...wismanDetails];
    if (field === 'count') {
      newDetails[index][field] = Number(value);
    } else {
      newDetails[index][field] = String(value);
    }
    setWismanDetails(newDetails);
  };

  const addWismanEntry = () => {
    setWismanDetails([...wismanDetails, { country: '', count: 0 }]);
  };

  const removeWismanEntry = (index: number) => {
    const newDetails = wismanDetails.filter((_, i) => i !== index);
    setWismanDetails(newDetails);
  };
  
  const totalWisman = wismanDetails.reduce((sum, detail) => sum + detail.count, 0);
  const totalVisitors = wisnus + totalWisman + eventVisitors + historicalVisitors;

  const resetForm = () => {
    setDestinationId('');
    setYear('');
    setMonth('');
    setWisnus(0);
    setWismanDetails([{ country: '', count: 0 }]);
    setEventVisitors(0);
    setHistoricalVisitors(0);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!destinationId || !year || !month) {
        toast({
            variant: 'destructive',
            title: "Input Tidak Lengkap",
            description: "Harap pilih destinasi, tahun, dan bulan.",
        });
        return;
    }
    
    // In a real app, you would save this to a database
    // For this demo, we simulate saving to local storage
    const newEntry: VisitData = {
        id: `visit-${destinationId}-${year}-${month}`,
        destinationId,
        year: Number(year),
        month: Number(month),
        monthName: months.find(m => m.value === Number(month))?.name || '',
        wisnus,
        wisman: totalWisman,
        wismanDetails: wismanDetails.filter(d => d.country && d.count > 0),
        eventVisitors,
        historicalVisitors,
        totalVisitors,
        locked: false, // New entries are unlocked by default
    };

    const updatedData = [...visitData.filter(d => d.id !== newEntry.id), newEntry];
    saveVisitData(updatedData);
    setVisitData(updatedData);

    toast({
        title: "Data Tersimpan",
        description: `Data pengunjung untuk ${newEntry.monthName} ${newEntry.year} berhasil disimpan.`,
    });
    resetForm();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Input Data</h1>
        <p className="text-muted-foreground">
          Formulir untuk pengelola destinasi menginput data pengunjung bulanan.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Formulir Input Data Pengunjung</CardTitle>
            <CardDescription>Isi detail di bawah ini untuk mencatat data pengunjung.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destinasi</Label>
                        <Select name="destinationId" value={destinationId} onValueChange={setDestinationId} required>
                            <SelectTrigger id="destination">
                                <SelectValue placeholder="Pilih Destinasi" />
                            </SelectTrigger>
                            <SelectContent>
                                {destinations.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year">Tahun</Label>
                         <Select name="year" value={year} onValueChange={setYear} required>
                            <SelectTrigger id="year">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="month">Bulan</Label>
                        <Select name="month" value={month} onValueChange={setMonth} required>
                            <SelectTrigger id="month">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => (
                                <SelectItem key={m.value} value={m.value.toString()}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="wisnus">Wisatawan Nusantara (Wisnus)</Label>
                        <Input id="wisnus" name="wisnus" type="number" placeholder="Contoh: 1200" value={wisnus} onChange={e => setWisnus(Number(e.target.value))}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="eventVisitors">Pengunjung Event Budaya</Label>
                        <Input id="eventVisitors" name="eventVisitors" type="number" placeholder="Contoh: 300" value={eventVisitors} onChange={e => setEventVisitors(Number(e.target.value))}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="historicalVisitors">Pengunjung Situs Sejarah</Label>
                        <Input id="historicalVisitors" name="historicalVisitors" type="number" placeholder="Contoh: 150" value={historicalVisitors} onChange={e => setHistoricalVisitors(Number(e.target.value))}/>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Label>Wisatawan Mancanegara (Wisman)</Label>
                    <div className="space-y-3 rounded-lg border p-4">
                        {wismanDetails.map((detail, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                                <Input 
                                    placeholder="Negara Asal" 
                                    value={detail.country} 
                                    onChange={e => handleWismanDetailChange(index, 'country', e.target.value)}
                                />
                                <Input 
                                    type="number" 
                                    placeholder="Jumlah" 
                                    value={detail.count}
                                    onChange={e => handleWismanDetailChange(index, 'count', e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeWismanEntry(index)} disabled={wismanDetails.length === 1}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={addWismanEntry}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Negara
                        </Button>
                    </div>
                </div>
                
                <div className="space-y-4 rounded-lg bg-secondary p-4 text-secondary-foreground">
                    <h3 className="font-semibold">Total Pengunjung</h3>
                    <div className="flex justify-between items-center">
                        <span>Wisnus:</span>
                        <span className="font-bold">{wisnus.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Wisman:</span>
                        <span className="font-bold">{totalWisman.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Event:</span>
                        <span className="font-bold">{eventVisitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Sejarah:</span>
                        <span className="font-bold">{historicalVisitors.toLocaleString()}</span>
                    </div>
                    <hr className="border-border"/>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold">Total Keseluruhan:</span>
                        <span className="font-bold">{totalVisitors.toLocaleString()}</span>
                    </div>
                </div>

                <Button type="submit">Simpan Data</Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
