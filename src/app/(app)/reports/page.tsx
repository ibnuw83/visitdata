
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDestinations, getVisitData } from "@/lib/local-data-service";
import { Destination, VisitData } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [visitData, setVisitData] = useState<VisitData[]>([]);

  // Filter state
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');

  const { toast } = useToast();

  useEffect(() => {
    setDestinations(getDestinations());
    setVisitData(getVisitData());
  }, [])
  

  const years = [...new Set(visitData.map(d => d.year))].sort((a,b) => b - a);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
  
  const destinationMap = useMemo(() => new Map(destinations.map(d => [d.id, d.name])), [destinations]);

  const filteredData = useMemo(() => {
    let data = visitData;
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
  }, [visitData, selectedDestination, selectedYear, selectedMonth]);


  const handleDownload = () => {
    if (filteredData.length === 0) {
        toast({
            variant: "destructive",
            title: "Tidak ada data",
            description: "Tidak ada data yang cocok dengan filter yang Anda pilih.",
        });
        return;
    }

    const groupedByDestinationAndYear = filteredData.reduce((acc, d) => {
        const key = `${d.destinationId}_${d.year}`;
        if (!acc[key]) {
            acc[key] = {
                destName: destinationMap.get(d.destinationId) || 'Tidak Dikenal',
                year: d.year,
                data: []
            };
        }
        acc[key].data.push(d);
        return acc;
    }, {} as Record<string, { destName: string, year: number, data: VisitData[] }>);

    let csvContent = "";
    
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: new Date(0, i).toLocaleString('id-ID', { month: 'long' })
    }));

    for (const key in groupedByDestinationAndYear) {
        const group = groupedByDestinationAndYear[key];
        
        csvContent += `Laporan untuk:,"${group.destName} - Tahun ${group.year}"\n`;
        
        const csvHeader = [
          "Bulan",
          "Wisatawan Domestik",
          "Wisatawan Asing",
          "Rincian Negara",
          "Total Pengunjung"
        ];
        csvContent += csvHeader.join(',') + '\n';
        
        const totals = { wisnus: 0, wisman: 0, totalVisitors: 0 };

        const monthlyData = new Map(group.data.map(d => [d.month, d]));

        allMonths.forEach(m => {
            const d = monthlyData.get(m.month);
            const wisnus = d?.wisnus || 0;
            const wisman = d?.wisman || 0;
            const totalVisitors = d?.totalVisitors || 0;
            const rincianNegara = d?.wismanDetails?.map(detail => `${detail.country} = ${detail.count}`).join(', ') || '';

            totals.wisnus += wisnus;
            totals.wisman += wisman;
            totals.totalVisitors += totalVisitors;

            const row = [
                m.name,
                wisnus,
                wisman,
                `"${rincianNegara}"`,
                totalVisitors
            ];
            csvContent += row.join(',') + '\n';
        });

        // Add total row
        const totalRow = [
          "JUMLAH",
          totals.wisnus,
          totals.wisman,
          "", // Empty cell for rincian
          totals.totalVisitors
        ];
        csvContent += totalRow.join(',') + '\n';

        csvContent += '\n\n'; // Add two empty lines for separation
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `laporan-kunjungan-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
        title: "Laporan Diunduh",
        description: "File laporan CSV Anda telah berhasil diunduh.",
    })
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
            <Select value={selectedDestination} onValueChange={setSelectedDestination}>
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
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Semua Tahun</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
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
                  <SelectItem key={m.value} value={m.value.toString()}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Button className="w-full lg:w-auto" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Hasil Filter</CardTitle>
          <CardDescription>Menampilkan {filteredData.length} dari total {visitData.length} data kunjungan.</CardDescription>
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
