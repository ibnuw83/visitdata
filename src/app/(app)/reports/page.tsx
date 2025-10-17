'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDestinations, getVisitData } from "@/lib/local-data-service";
import { Destination, VisitData } from "@/lib/types";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [visitData, setVisitData] = useState<VisitData[]>([]);

  useEffect(() => {
    setDestinations(getDestinations());
    setVisitData(getVisitData());
  }, [])
  

  const years = [...new Set(visitData.map(d => d.year))];
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">
          Lihat, filter, dan ekspor laporan data pariwisata.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Generator Laporan</CardTitle>
            <CardDescription>Pilih parameter di bawah ini untuk membuat dan mengunduh laporan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Destinasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Destinasi</SelectItem>
                {destinations.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Button className="w-full lg:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
