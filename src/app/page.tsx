
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe, AlertTriangle } from "lucide-react";
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
import { getFunctions, httpsCallable } from "firebase/functions";
import { MonthlyLineChart, MonthlyBarChart } from '@/components/dashboard/visitor-charts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type PublicDashboardData = {
    totalVisitors: number;
    totalWisnus: number;
    totalWisman: number;
    activeDestinations: Destination[];
    visitData: VisitData[];
    availableYears: string[];
}

function DashboardContent() {
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<PublicDashboardData | null>(null);
    const firestore = useFirestore();

    const fetchDashboardData = useCallback(async (year: number) => {
        if (!firestore) return;
        setLoading(true);
        setError(null);
        try {
            const functions = getFunctions(firestore.app);
            const getPublicDashboardData = httpsCallable(functions, 'getPublicDashboardData');
            const result = await getPublicDashboardData({ year });
            const data = result.data as PublicDashboardData;

            // Simple validation
            if (!data || typeof data.totalVisitors !== 'number') {
                throw new Error("Data respons tidak valid dari server.");
            }

            setDashboardData(data);
        } catch (err: any) {
            console.error("Error calling getPublicDashboardData:", err);
            setError(err.message || "Terjadi kesalahan yang tidak diketahui saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }, [firestore]);

    useEffect(() => {
        fetchDashboardData(selectedYear);
    }, [selectedYear, fetchDashboardData]);

    const handleYearChange = (yearValue: string) => {
        const year = parseInt(yearValue, 10);
        setSelectedYear(year);
    }
    
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
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Gagal Memuat Data Dasbor</AlertTitle>
                <AlertDescription>
                    Terjadi kesalahan saat mengambil data dari server. Silakan coba lagi nanti.
                    <p className="mt-2 text-xs font-mono bg-destructive-foreground/10 p-2 rounded">Pesan error: {error}</p>
                </AlertDescription>
            </Alert>
        )
    }

    if (!dashboardData || dashboardData.activeDestinations.length === 0) {
       return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-muted-foreground">Dasbor Publik</CardTitle>
                </CardHeader>
                <CardContent className="flex h-48 items-center justify-center">
                    <p className="text-muted-foreground">Belum ada data untuk ditampilkan.</p>
                </CardContent>
            </Card>
        )
    }
    
    const { totalVisitors, totalWisnus, totalWisman, activeDestinations, visitData, availableYears } = dashboardData;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Dasbor Publik</h2>
                    <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {selectedYear}.</p>
                </div>
                <div className="w-full sm:w-auto">
                   <Select value={selectedYear.toString()} onValueChange={handleYearChange} disabled={availableYears.length === 0}>
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
                <StatCard title="Total Destinasi Aktif" value={activeDestinations.length.toString()} icon={<Landmark />} className="bg-purple-600 text-white"/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MonthlyLineChart data={visitData} />
                <MonthlyBarChart data={visitData} />
            </div>

            <TopDestinationsCarousel data={visitData} destinations={activeDestinations} />
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
