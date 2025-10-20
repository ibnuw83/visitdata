
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
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, Unsubscribe, onSnapshot, Firestore } from "firebase/firestore";
import { MonthlyLineChart, MonthlyBarChart } from '@/components/dashboard/visitor-charts';


function useAllVisitsForYear(firestore: Firestore | null, destinationIds: string[], year: number) {
    const [allVisitData, setAllVisitData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || destinationIds.length === 0) {
            setLoading(false);
            setAllVisitData([]);
            return;
        }

        setLoading(true);
        const allData: { [key: string]: VisitData[] } = {};
        const unsubscribers: Unsubscribe[] = [];

        // Failsafe timeout
        const loadingTimeout = setTimeout(() => {
             if (Object.keys(allData).length !== destinationIds.length) {
                setLoading(false);
            }
        }, 5000);

        const checkCompletion = () => {
            if (Object.keys(allData).length === destinationIds.length) {
                setLoading(false);
                clearTimeout(loadingTimeout);
            }
        };

        destinationIds.forEach(destId => {
            const visitsRef = collection(firestore, 'destinations', destId, 'visits');
            const q = query(visitsRef, where('year', '==', year));
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                allData[destId] = snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as VisitData));
                
                const combinedData = Object.values(allData).flat();
                setAllVisitData(combinedData);
                
                checkCompletion();

            }, (error) => {
                console.error(`Error fetching visits for destination ${destId} in year ${year}:`, error);
                allData[destId] = []; // On error, assume no data
                checkCompletion();
            });
            unsubscribers.push(unsubscribe);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(loadingTimeout);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, JSON.stringify(destinationIds), year]);

    return { data: allVisitData, loading: loading };
}


function DashboardContent() {
    const firestore = useFirestore();
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

    const destinationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'destinations'), where('status', '==', 'aktif'));
    }, [firestore]);
    
    const { data: destinations, loading: destinationsLoading } = useCollection<Destination>(destinationsQuery);
    const destinationIds = useMemo(() => destinations?.map(d => d.id) || [], [destinations]);

    const { data: allVisitData, loading: visitsLoading } = useAllVisitsForYear(firestore, destinationIds, parseInt(selectedYear));
    
    const loading = destinationsLoading || visitsLoading;

    const currentYear = useMemo(() => new Date().getFullYear(), []);
    
    const availableYears = useMemo(() => {
        const allYearsSet = new Set<string>();
        if (allVisitData) {
            allVisitData.forEach(d => allYearsSet.add(d.year.toString()));
        }
        allYearsSet.add(currentYear.toString());
        return Array.from(allYearsSet).sort((a,b) => parseInt(b) - parseInt(a));
    }, [allVisitData, currentYear]);

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const totalVisitors = useMemo(() => allVisitData.reduce((sum, item) => sum + item.totalVisitors, 0), [allVisitData]);
    const totalWisnus = useMemo(() => allVisitData.reduce((sum, item) => sum + item.wisnus, 0), [allVisitData]);
    const totalWisman = useMemo(() => allVisitData.reduce((sum, item) => sum + item.wisman, 0), [allVisitData]);

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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Dasbor Publik</h2>
                    <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {selectedYear}.</p>
                </div>
                <div className="w-full sm:w-auto">
                   <Select value={selectedYear} onValueChange={setSelectedYear} disabled={availableYears.length === 0}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
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
