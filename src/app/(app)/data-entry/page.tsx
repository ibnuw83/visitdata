'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDestinations, getVisitData } from "@/lib/local-data-service";
import { Destination, VisitData } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';

export default function DataEntryPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setDestinations(getDestinations());
    setVisitData(getVisitData());
  }, []);

  const years = [...new Set(visitData.map(d => d.year))];
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you would save this data to localStorage or an API
    toast({
        title: "Data Tersimpan",
        description: "Data pengunjung berhasil disimpan (simulasi).",
    });
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="destination">Destinasi</Label>
                        <Select name="destinationId">
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
                         <Select name="year">
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
                        <Select name="month">
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
                        <Input id="wisnus" name="wisnus" type="number" placeholder="Contoh: 1200" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wisman">Wisatawan Mancanegara (Wisman)</Label>
                        <Input id="wisman" name="wisman" type="number" placeholder="Contoh: 50" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="eventVisitors">Pengunjung Event Budaya</Label>
                        <Input id="eventVisitors" name="eventVisitors" type="number" placeholder="Contoh: 300" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="historicalVisitors">Pengunjung Situs Sejarah</Label>
                        <Input id="historicalVisitors" name="historicalVisitors" type="number" placeholder="Contoh: 150" />
                    </div>
                </div>
                
                <Button type="submit">Simpan Data</Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
