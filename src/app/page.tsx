
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import MonthlyVisitorsChart from "@/components/dashboard/monthly-visitors-chart";
import VisitorBreakdownChart from "@/components/dashboard/visitor-breakdown-chart";
import TopDestinationsCarousel from "@/components/dashboard/top-destinations-carousel";
import type { VisitData, Destination, AppSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/client-provider';
import { collection, collectionGroup } from "firebase/firestore";
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

function DashboardContent() {
    const firestore = useFirestore();
    const destinationsQuery = useMemo(() => firestore ? collection(firestore, 'destinations') : null, [firestore]);
    const { data: destinations, loading: destinationsLoading } = useCollection<Destination>(destinationsQuery);
    const visitsQuery = useMemo(() => firestore ? collectionGroup(firestore, 'visits') : null, [firestore]);
    const { data: allVisitData, loading: visitsLoading } = useCollection<VisitData>(visitsQuery);
    
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        setLoading(destinationsLoading || visitsLoading);
    }, [destinationsLoading, visitsLoading]);
    
    const availableYears = useMemo(() => {
        if (!allVisitData) return [new Date().getFullYear()];
        const allYears = [...new Set(allVisitData.map(d => d.year))].sort((a,b) => b-a);
        if (!allYears.includes(new Date().getFullYear())) {
            allYears.unshift(new Date().getFullYear());
        }
        return allYears;
    }, [allVisitData]);

    const yearlyData = useMemo(() => {
        if (!allVisitData) return [];
        return allVisitData.filter(d => d.year === parseInt(selectedYear));
    }, [allVisitData, selectedYear]);
    
    const totalVisitors = useMemo(() => yearlyData.reduce((sum, item) => sum + item.totalVisitors, 0), [yearlyData]);
    const totalWisnus = useMemo(() => yearlyData.reduce((sum, item) => sum + item.wisnus, 0), [yearlyData]);
    const totalWisman = useMemo(() => yearlyData.reduce((sum, item) => sum + item.wisman, 0), [yearlyData]);

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
                 <div className="grid gap-4 lg:grid-cols-5">
                    <Skeleton className="lg:col-span-3 h-80" />
                    <Skeleton className="lg-col-span-2 h-80" />
                </div>
                <div className="grid gap-4">
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Dasbor Publik</h1>
                    <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {selectedYear}.</p>
                </div>
                <div className="w-full sm:w-auto">
                   <Select value={selectedYear} onValueChange={setSelectedYear} disabled={availableYears.length === 0}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Pengunjung" value={totalVisitors.toLocaleString()} icon={<Users />} className="bg-blue-600 text-white" />
                <StatCard title="Wisatawan Nusantara" value={totalWisnus.toLocaleString()} icon={<Globe />} className="bg-green-600 text-white" />
                <StatCard title="Wisatawan Mancanegara" value={totalWisman.toLocaleString()} icon={<Plane />} className="bg-orange-500 text-white" />
                <StatCard title="Total Destinasi Aktif" value={destinations?.filter(d => d.status === 'aktif').length.toString() || '0'} icon={<Landmark />} className="bg-purple-600 text-white"/>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                        <CardDescription>Total pengunjung (domestik & asing) selama tahun {selectedYear}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MonthlyVisitorsChart data={yearlyData} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Komposisi Pengunjung</CardTitle>
                         <CardDescription>Perbandingan wisatawan nusantara dan mancanegara per bulan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VisitorBreakdownChart data={yearlyData} />
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid gap-4">
                <TopDestinationsCarousel data={yearlyData} destinations={destinations || []} />
            </div>
        </div>
    )
}

function PublicLandingPage() {
    const firestore = useFirestore();
    const settingsRef = useMemo(() => firestore ? doc(firestore, 'settings', 'app') : null, [firestore]);
    const { data: settings } = useDoc<AppSettings>(settingsRef);
  
    const appTitle = settings?.appTitle || 'VisitData Hub';
    const appFooter = settings?.footerText || `© ${new Date().getFullYear()} VisitData Hub`;
    const heroTitle = settings?.heroTitle || 'Pusat Data Pariwisata Modern Anda';
    const heroSubtitle = settings?.heroSubtitle || 'Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.';
  
    useEffect(() => {
        if (settings?.logoUrl) {
            localStorage.setItem('logoUrl', settings.logoUrl);
            window.dispatchEvent(new Event('storage'));
        }
    }, [settings?.logoUrl]);

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
            {appFooter}
          </p>
        </div>
      </footer>
    </div>
  );
}


export default function HomePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);
  
  if(isLoading) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
                <Logo className="h-10 w-10 animate-pulse" />
            </div>
        </div>
  }

  if (user) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
                <Logo className="h-10 w-10 animate-pulse" />
            </div>
        </div>;
  }

  return <PublicLandingPage />;
}
