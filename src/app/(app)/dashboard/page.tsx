
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import MonthlyVisitorsChart from "@/components/dashboard/monthly-visitors-chart";
import VisitorBreakdownChart from "@/components/dashboard/visitor-breakdown-chart";
import TopDestinationsCard from "@/components/dashboard/top-destinations-card";
import type { VisitData, Destination } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, onSnapshot, Unsubscribe, Firestore } from 'firebase/firestore';

/**
 * Custom hook to fetch all visit data from multiple destinations in real-time.
 * This hook is now safe and will only run when it has a non-empty array of destination IDs.
 */
function useAllVisits(firestore: Firestore | null, destinationIds: string[]) {
    const [allVisitData, setAllVisitData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Critical safety check: Do not run if firestore is not ready or if there are no destination IDs.
        if (!firestore || destinationIds.length === 0) {
            setLoading(false);
            setAllVisitData([]);
            return;
        }

        setLoading(true);
        const allData: { [key: string]: VisitData[] } = {};
        const unsubscribers: Unsubscribe[] = [];

        // Set a timeout to mark loading as finished if some listeners don't return.
        const loadingTimeout = setTimeout(() => {
            setLoading(false);
        }, 5000); // 5-second timeout

        const checkCompletion = () => {
            if (Object.keys(allData).length === destinationIds.length) {
                setLoading(false);
                clearTimeout(loadingTimeout);
            }
        };

        destinationIds.forEach(destId => {
            const visitsRef = collection(firestore, 'destinations', destId, 'visits');
            const unsubscribe = onSnapshot(visitsRef, (snapshot) => {
                allData[destId] = snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as VisitData));
                
                const combinedData = Object.values(allData).flat();
                setAllVisitData(combinedData);
                
                checkCompletion();

            }, (error) => {
                console.error(`Error fetching visits for destination ${destId}:`, error);
                allData[destId] = []; // On error, assume no data for this listener
                checkCompletion();
            });
            unsubscribers.push(unsubscribe);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(loadingTimeout);
        };
    // Re-run this effect ONLY if the stringified version of destinationIds changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, JSON.stringify(destinationIds)]);

    return { data: allVisitData, loading };
}


export default function DashboardPage() {
    const { appUser } = useUser();
    const firestore = useFirestore();
    
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

    const destinationsQuery = useMemoFirebase(() => {
        if (!firestore || !appUser) return null;

        let q = query(collection(firestore, 'destinations'), where('status', '==', 'aktif'));

        if (appUser.role === 'pengelola') {
            // Safety check: if a manager has no assigned locations, return a query for a non-existent ID.
            if (!appUser.assignedLocations || appUser.assignedLocations.length === 0) {
                return query(collection(firestore, 'destinations'), where('id', 'in', ['non-existent-id']));
            }
            q = query(q, where('id', 'in', appUser.assignedLocations));
        }
        return q;
    }, [firestore, appUser]);

    const { data: destinations, loading: destinationsLoading } = useCollection<Destination>(destinationsQuery);
    
    // Stabilize destinationIds to prevent re-renders
    const destinationIds = useMemo(() => destinations?.map(d => d.id) || [], [destinations]);

    // Use the new custom hook for fetching visits
    const { data: allVisitData, loading: visitsLoading } = useAllVisits(firestore, destinationIds);

    const loading = destinationsLoading || visitsLoading;

    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => {
        if (!allVisitData) return [currentYear.toString()];
        const allYears = [...new Set(allVisitData.map(d => d.year.toString()))].sort((a, b) => parseInt(b) - parseInt(a));
        if (!allYears.includes(currentYear.toString())) {
            allYears.unshift(currentYear.toString());
        }
        return allYears;
    }, [allVisitData, currentYear]);

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const yearlyData = useMemo(() => {
        if (!allVisitData) return [];
        return allVisitData.filter(d => d.year === parseInt(selectedYear));
    }, [allVisitData, selectedYear]);
    
    const totalVisitors = useMemo(() => yearlyData.reduce((sum, item) => sum + item.totalVisitors, 0), [yearlyData]);
    const totalWisnus = useMemo(() => yearlyData.reduce((sum, item) => sum + item.wisnus, 0), [yearlyData]);
    const totalWisman = useMemo(() => yearlyData.reduce((sum, item) => sum + item.wisman, 0), [yearlyData]);

    const dashboardTitle = useMemo(() => {
        if (appUser?.role === 'pengelola' && destinations && destinations.length > 0) {
            const destinationNames = destinations.map(d => d.name).join(', ');
            return `Dasbor: ${destinationNames}`;
        }
        return 'Dasbor';
    }, [appUser, destinations]);

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
                    <h1 className="font-headline text-3xl font-bold tracking-tight">{dashboardTitle}</h1>
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
                <StatCard title="Total Destinasi Aktif" value={(destinations || []).length.toString()} icon={<Landmark />} className="bg-purple-600 text-white"/>
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
                <TopDestinationsCard data={yearlyData} destinations={destinations || []} />
            </div>
        </div>
    )
}
