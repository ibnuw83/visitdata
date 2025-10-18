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
import { getDestinations, getVisitData, saveVisitData } from "@/lib/local-data-service";
import { Destination, VisitData, WismanDetail } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Trash2 } from 'lucide-react';
import debounce from 'lodash.debounce';

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('id-ID', { month: 'long' }));

function DestinationDataEntry({ destination, initialData, onDataChange }: { destination: Destination, initialData: VisitData[], onDataChange: (updatedData: VisitData[]) => void }) {
  const [data, setData] = useState<VisitData[]>(initialData);
  const { toast } = useToast();

  const debouncedSave = useCallback(
    debounce((newData: VisitData[]) => {
      saveVisitData(newData);
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
      onDataChange(newData);
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
        onDataChange(newData);
        debouncedSave(newData);
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {months.map((monthName, index) => {
                        const monthData = data.find(d => d.month === index + 1);
                        return (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{monthName}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        className="h-8 w-24 border-0 shadow-none focus-visible:ring-1"
                                        value={monthData?.wisnus || 0}
                                        onChange={(e) => handleDataChange(index, 'wisnus', parseInt(e.target.value, 10) || 0)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-8 w-24 border-0 shadow-none focus-visible:ring-1"
                                            value={monthData?.wisman || 0}
                                            readOnly
                                        />
                                        <WismanPopover 
                                          details={monthData?.wismanDetails || []} 
                                          onSave={(newDetails) => handleWismanDetailsChange(index, newDetails)}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">{monthData?.totalVisitors.toLocaleString() || 0}</TableCell>
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
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function WismanPopover({ details, onSave }: { details: WismanDetail[], onSave: (details: WismanDetail[]) => void }) {
    const [wismanDetails, setWismanDetails] = useState(details);
    
    useEffect(() => {
        setWismanDetails(details);
    }, [details]);

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
                <Button variant="link" className="h-8 p-1 text-sm">Rincian</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Rincian Wisatawan Asing</h4>
                        <p className="text-sm text-muted-foreground">
                            Tambahkan jumlah pengunjung per negara asal.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {wismanDetails.map((detail, index) => (
                           <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                <Input
                                    placeholder="Negara Asal"
                                    value={detail.country}
                                    className="h-8"
                                    onChange={(e) => handleDetailChange(index, 'country', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Jumlah"
                                    value={detail.count}
                                    className="h-8 w-20"
                                    onChange={(e) => handleDetailChange(index, 'count', e.target.value)}
                                />
                                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeEntry(index)}>
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
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [allVisitData, setAllVisitData] = useState<VisitData[]>([]);
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year

  useEffect(() => {
    setDestinations(getDestinations());
    setAllVisitData(getVisitData());
  }, []);

  const handleDataChange = (updatedData: VisitData[]) => {
    const newAllVisitData = allVisitData.map(d => updatedData.find(ud => ud.id === d.id) || d);
    setAllVisitData(newAllVisitData);
  }

  const dataByDestination = useMemo(() => {
    return destinations.map(dest => {
      const destData = allVisitData.filter(d => d.destinationId === dest.id && d.year === year);
      if (destData.length === 0) {
        // If no data for the year, create a default structure
        return {
          destination: dest,
          data: months.map((monthName, index) => ({
            id: `visit-${dest.id}-${year}-${index + 1}`,
            destinationId: dest.id,
            year: year,
            month: index + 1,
            monthName: monthName,
            wisnus: 0,
            wisman: 0,
            wismanDetails: [],
            eventVisitors: 0,
            historicalVisitors: 0,
            totalVisitors: 0,
            locked: false,
          }))
        }
      }
      return { destination: dest, data: destData };
    });
  }, [destinations, allVisitData, year]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Input Data Kunjungan</h1>
        <p className="text-muted-foreground">
          Pilih destinasi untuk melihat dan mengedit data kunjungan tahunan.
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
                  />
              ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
