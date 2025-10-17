'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDestinations, getVisitData } from "@/lib/local-data-service";
import type { Destination, VisitData } from '@/lib/types';
import { getReportSuggestions, ReportSuggestionsOutput } from '@/ai/flows/ai-powered-report-suggestions';
import { Lightbulb, Loader2, BarChart, LineChart, PieChart } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

const chartIcons = {
    "Bar Chart": <BarChart className="h-4 w-4 text-muted-foreground" />,
    "Line Chart": <LineChart className="h-4 w-4 text-muted-foreground" />,
    "Pie Chart": <PieChart className="h-4 w-4 text-muted-foreground" />,
} as const;

export default function AiSuggestionsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [visitData, setVisitData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    
    const [selectedDestId, setSelectedDestId] = useState<string | undefined>();
    const [suggestions, setSuggestions] = useState<ReportSuggestionsOutput['suggestions'] | null>(null);

    useEffect(() => {
        setDestinations(getDestinations());
        setVisitData(getVisitData());
        setLoading(false);
    }, []);

    const handleGenerate = async () => {
        if (!selectedDestId) {
            setError('Silakan pilih destinasi terlebih dahulu.');
            return;
        }

        const destination = destinations.find(d => d.id === selectedDestId);
        if (!destination) return;
        
        const relevantData = visitData.filter(d => d.destinationId === selectedDestId);
        if (relevantData.length === 0) {
            setError('Tidak ada data kunjungan untuk destinasi ini.');
            return;
        }
        
        setGenerating(true);
        setError('');
        setSuggestions(null);

        // Create summaries
        const currentMonthData = relevantData.sort((a,b) => b.month - a.month)[0];
        if (!currentMonthData) {
            setError('Tidak ada data kunjungan untuk bulan terakhir di destinasi ini.');
            setGenerating(false);
            return;
        }
        const currentMonthDataSummary = `Bulan ${currentMonthData.monthName}: ${currentMonthData.totalVisitors} total pengunjung (${currentMonthData.wisnus} nusantara, ${currentMonthData.wisman} mancanegara).`;
        
        const totalLast12Months = relevantData.reduce((sum, d) => sum + d.totalVisitors, 0);
        const historicalDataSummary = `Total pengunjung selama 12 bulan terakhir adalah ${totalLast12Months}. Rata-rata per bulan sekitar ${Math.round(totalLast12Months / 12)}.`;

        try {
            const result = await getReportSuggestions({
                currentMonthDataSummary,
                historicalDataSummary,
                destinationCategory: destination.category,
            });
            setSuggestions(result.suggestions);
        } catch (e) {
            console.error(e);
            setError('Gagal menghasilkan saran. Silakan coba lagi nanti.');
        } finally {
            setGenerating(false);
        }
    };


    if (loading) {
        return (
             <div className="flex flex-col gap-8">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-5 w-72" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10 md:col-span-2" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Saran Laporan berbasis AI</h1>
                <p className="text-muted-foreground">
                    Dapatkan ide-ide laporan yang cerdas berdasarkan tren data pariwisata Anda.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Generator Saran</CardTitle>
                    <CardDescription>Pilih destinasi untuk mendapatkan saran laporan yang relevan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid md:grid-cols-3 gap-4">
                        <Select onValueChange={setSelectedDestId} value={selectedDestId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Destinasi" />
                            </SelectTrigger>
                            <SelectContent>
                                {destinations.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleGenerate} disabled={generating || !selectedDestId} className="md:col-span-2">
                            {generating ? <Loader2 className="animate-spin" /> : 'Buat Saran Laporan'}
                        </Button>
                    </div>
                     {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {generating && (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                             <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                             </CardContent>
                        </Card>
                    ))}
                 </div>
            )}
            
            {suggestions && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((suggestion, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-start gap-3">
                                     <Lightbulb className="text-accent flex-shrink-0 mt-1" />
                                     <span>{suggestion.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                                    {chartIcons[suggestion.chartType as keyof typeof chartIcons] || <BarChart className="h-4 w-4" />}
                                    <span>Saran Visualisasi: {suggestion.chartType}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
