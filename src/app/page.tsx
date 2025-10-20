
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import TopDestinationsCarousel from "@/components/dashboard/top-destinations-carousel";
import type { VisitData, Destination, AppSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { MonthlyLineChart, MonthlyBarChart } from '@/components/dashboard/visitor-charts';

// --- New Hook to fetch public data ---
function usePublicDashboardData(year: number) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const functions = getFunctions();
                const getPublicData = httpsCallable(functions, 'getPublicDashboardData');
                const result = await getPublicData({ year });
                setData(result.data);
            } catch (err: any) {
                console.error("Error fetching public data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);

    return { 
        data, 
        loading, 
        error,
        destinations: data?.destinations || [],
        allVisitData: data?.allVisitData || [],
        availableYears: data?.availableYears || [year.toString()]
    };
}


function DashboardContent() {
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

    const { destinations, allVisitData, availableYears, loading, error } = usePublicDashboardData(selectedYear);

    const currentYear = useMemo(() => new Date().getFullYear(), []);

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear.toString())) {
            setSelectedYear(parseInt(availableYears[0]));
        }
    }, [availableYears, selectedYear]);

    const totalVisitors = useMemo(() => allVisitData.reduce((sum: number, item: VisitData) => sum + item.totalVisitors, 0), [allVisitData]);
    const totalWisnus = useMemo(() => allVisitData.reduce((sum: number, item: VisitData) => sum + item.wisnus, 0), [allVisitData]);
    const totalWisman = useMemo(() => allVisitData.reduce((sum: number, item: VisitData) => sum + item.wisman, 0), [allVisitData]);

    if (loading) {
        return (
             <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-5 w-72" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                 <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
                 <div className="grid gap-4">
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">Gagal Memuat Data</CardTitle>
                    <CardDescription>
                        Tidak dapat mengambil data dasbor publik. Silakan coba lagi nanti.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Dasbor Publik</h2>
                    <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {selectedYear}.</p>
                </div>
                <div className="w-full sm:w-auto">
                   <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))} disabled={availableYears.length === 0}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map((year: string) => (
                            <SelectItem key={year} value={year}>
                                Tahun {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Pengunjung" value={totalVisitors.toLocaleString()} icon={<Users />} className="bg-blue-600 text-white" />
                <StatCard title="Wisatawan Nusantara" value={totalWisnus.toLocaleString()} icon={<Globe />} className="bg-green-600 text-white" />
                <StatCard title="Wisatawan Mancanegara" value={totalWisman.toLocaleString()} icon={<Plane />} className="bg-orange-500 text-white" />
                <StatCard title="Total Destinasi Aktif" value={destinations?.length.toString() || '0'} icon={<Landmark />} className="bg-purple-600 text-white"/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MonthlyLineChart data={allVisitData} />
                <MonthlyBarChart data={allVisitData} />
            </div>

            <TopDestinationsCarousel data={allVisitData} destinations={destinations || []} />
        </div>
    )
}

export default function HomePage() {
    const firestore = useFirestore();
    const settingsRef = useMemo(() => firestore ? doc(firestore, 'settings/app') : null, [firestore]);
    const { data: settings } = useDoc<AppSettings>(settingsRef);
  
    const appTitle = settings?.appTitle || 'VisitData Hub';
    const heroTitle = settings?.heroTitle || 'Pusat Data Pariwisata Modern Anda';
    const heroSubtitle = settings?.heroSubtitle || 'Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.';
    const footerText = settings?.footerText || `Hak Cipta © ${new Date().getFullYear()} Dinas Pariwisata`;
    
    useEffect(() => {
        if (settings) {
            if (settings.logoUrl) {
                localStorage.setItem('logoUrl', settings.logoUrl);
            } else {
                localStorage.removeItem('logoUrl');
            }
            window.dispatchEvent(new Event('storage'));
        }
    }, [settings]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Logo className="h-8 w-8" />
            <span className="font-headline text-lg font-bold">{appTitle}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <h1 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {heroSubtitle}
            </p>
             <Button asChild size="lg" className="mt-4">
                <Link href="/login">
                  Masuk untuk Mengelola Data
                </Link>
              </Button>
          </div>
        </section>
        
        {/* Dashboard Section */}
        <section className="container py-8">
            <DashboardContent />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {footerText}
          </p>
        </div>
      </footer>
    </div>
  );
}
