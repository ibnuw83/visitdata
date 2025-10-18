
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Destination, VisitData } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, collectionGroup } from "firebase/firestore";

export default function ReportsPage() {
  const { appUser } = useUser();
  const firestore = useFirestore();
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState('all');

  const destinationsQuery = useMemo(() => {
    if (!firestore || !appUser) return null;
    
    if (appUser.role === 'admin') {
        return collection(firestore, 'destinations');
    }
    
    if (appUser.role === 'pengelola' && appUser.assignedLocations && appUser.assignedLocations.length > 0) {
        return query(collection(firestore, 'destinations'), where('id', 'in', appUser.assignedLocations));
    }

    if (appUser.role === 'pengelola') {
        return query(collection(firestore, 'destinations'), where('id', 'in', ['non-existent-id']));
    }

    return null;
  }, [firestore, appUser]);

  const visitsQuery = useMemo(() => {
      if (!firestore) return null;
      return collectionGroup(firestore, 'visits');
  }, [firestore]);

  const { data: destinations } = useCollection<Destination>(destinationsQuery);
  const { data: visitData } = useCollection<VisitData>(visitsQuery);


  const { toast } = useToast();

  const years = useMemo(() => {
    if (!visitData) return [currentYear.toString()];
    const allYears = [...new Set(visitData.map(d => d.year))].sort((a,b) => b-a);
    if (!allYears.includes(currentYear)) {
        allYears.unshift(currentYear);
    }
    return allYears.map(String);
  },[visitData, currentYear]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setSelectedYear(new Date().getFullYear().toString());
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
  
  const destinationMap = useMemo(() => new Map(destinations?.map(d => [d.id, d.name])), [destinations]);

  const filteredData = useMemo(() => {
    if (!visitData || !destinations) return [];

    let data = visitData;
    
    const dests = destinations || [];
    const allowedDestinationIds = new Set(dests.map(d => d.id));
    data = data.filter(d => allowedDestinationIds.has(d.destinationId));

    if (selectedDestination !== 'all') {
      data = data.filter(d => d.destinationId === selectedDestination);
    }
    if (selectedYear !== 'all') {
      data = data.filter(d => d.year === parseInt(selectedYear));
    }
    if (selectedMonth !== 'all') {
      data = data.filter(d => d.month === parseInt(selectedMonth));
    }
    
    return data.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return a.month - b.month;
    });
  }, [visitData, destinations, selectedDestination, selectedYear, selectedMonth]);


  const handleDownload = () => {
    if (filteredData.length === 0) {
        toast({
            variant: "destructive",
            title: "Tidak ada data",
            description: "Tidak ada data yang cocok dengan filter yang Anda pilih.",
        });
        return;
    }

    const wb = XLSX.utils.book_new();

    const groupedByDestination = filteredData.reduce((acc, d) => {
        const destName = destinationMap.get(d.destinationId) || 'Tidak Dikenal';
        if (!acc[destName]) {
            acc[destName] = [];
        }
        acc[destName].push(d);
        return acc;
    }, {} as Record<string, VisitData[]>);

    for (const destName in groupedByDestination) {
        if (Object.prototype.hasOwnProperty.call(groupedByDestination, destName)) {
            const sheetData = groupedByDestination[destName];
            const year = sheetData[0]?.year;
            
            const header = ["Bulan", "Wis. Domestik", "Wis. Asing", "Rincian Negara", "Total Pengunjung"];
            
            const totals = { wisnus: 0, wisman: 0, totalVisitors: 0 };
            
            const allMonthsData = months.map(m => {
                const data = sheetData.find(d => d.month === parseInt(m.value));
                const wisnus = data?.wisnus || 0;
                const wisman = data?.wisman || 0;
                const totalVisitors = data?.totalVisitors || 0;
                const rincianNegara = data?.wismanDetails?.map(detail => `${detail.country} = ${detail.count}`).join('; ') || '';

                totals.wisnus += wisnus;
                totals.wisman += wisman;
                totals.totalVisitors += totalVisitors;

                return [m.name, wisnus, wisman, rincianNegara, totalVisitors];
            });

            const totalRow = ["JUMLAH", totals.wisnus, totals.wisman, "", totals.totalVisitors];
            
            const dataToExport = [
                [`Laporan untuk: ${destName} - Tahun ${year}`],
                [],
                header,
                ...allMonthsData,
                [],
                totalRow
            ];

            const ws = XLSX.utils.aoa_to_sheet(dataToExport);

            // Sanitize sheet name
            const safeSheetName = destName.replace(/[:\\/?*[\\]]/g, '').substring(0, 31);
            XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
        }
    }
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `laporan-kunjungan-${date}.xlsx`);

    toast({
        title: "Laporan Diunduh",
        description: "File laporan Excel Anda telah berhasil diunduh.",
    })
  }

  if (!appUser) {
    return null; // or a loading skeleton
  }

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
            <CardDescription>Pilih parameter di bawah ini untuk memfilter data dan mengunduh laporan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={selectedDestination} onValueChange={setSelectedDestination} disabled={appUser.role === 'pengelola' && (destinations || []).length === 1}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Destinasi" />
              </SelectTrigger>
              <SelectContent>
                {appUser.role === 'admin' && <SelectItem value="all">Semua Destinasi</SelectItem>}
                {(destinations || []).map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Button className="w-full lg:w-auto" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan (Excel)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Hasil Filter</CardTitle>
          <CardDescription>Menampilkan {filteredData.length} dari total {(visitData || []).length} data kunjungan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Destinasi</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Wis. Domestik</TableHead>
                <TableHead className="text-right">Wis. Asing</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{destinationMap.get(d.destinationId) || 'Tidak Dikenal'}</TableCell>
                    <TableCell>{d.monthName} {d.year}</TableCell>
                    <TableCell className="text-right">{d.wisnus.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                       <Popover>
                        <PopoverTrigger asChild>
                           <span className="cursor-pointer underline decoration-dashed underline-offset-4 hover:decoration-solid">
                            {d.wisman.toLocaleString()}
                           </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Rincian Wisatawan Asing</h4>
                              <p className="text-sm text-muted-foreground">
                                Pengunjung berdasarkan negara asal untuk {d.monthName} {d.year}.
                              </p>
                            </div>
                            <div className="grid gap-2">
                                {(d.wismanDetails && d.wismanDetails.length > 0) ? (
                                    d.wismanDetails.map((detail, index) => (
                                      <div key={index} className="grid grid-cols-2 items-center gap-4">
                                        <span className="font-medium">{detail.country}</span>
                                        <Badge variant="outline" className="justify-self-end">{detail.count.toLocaleString()}</Badge>
                                      </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Tidak ada rincian.</p>
                                )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{d.totalVisitors.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data untuk ditampilkan. Silakan ubah kriteria filter Anda.
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
