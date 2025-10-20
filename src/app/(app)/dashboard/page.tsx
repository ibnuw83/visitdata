
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, Plane, Globe } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import TopDestinationsCard from "@/components/dashboard/top-destinations-card";
import type { VisitData, Destination } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Unsubscribe, onSnapshot, Firestore } from 'firebase/firestore';
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

        const loadingTimeout = setTimeout(() => {
            if (Object.keys(allData).length !== destinationIds.length) {
                setLoading(false); // Only set loading to false if it hasn't completed
            }
        }, 5000); // Failsafe timeout

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


export default function DashboardPage() {
    const { appUser } = useUser();
    const firestore = useFirestore();
    
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

    const destinationsQuery = useMemoFirebase(() => {
        if (!firestore || !appUser) return null;

        let q = query(collection(firestore, 'destinations'), where('status', '==', 'aktif'));

        if (appUser.role === 'pengelola') {
            if (!appUser.assignedLocations || appUser.assignedLocations.length === 0) {
                // Return a query that will find no documents
                return query(collection(firestore, 'destinations'), where('id', '==', 'non-existent-id'));
            }
            q = query(q, where('id', 'in', appUser.assignedLocations));
        }
        return q;
    }, [firestore, appUser]);

    const { data: destinations, loading: destinationsLoading } = useCollection<Destination>(destinationsQuery);
    const destinationIds = useMemo(() => destinations?.map(d => d.id) || [], [destinations]);

    const { data: allVisitData, loading: visitsLoading } = useAllVisitsForYear(firestore, destinationIds, parseInt(selectedYear));

    const loading = destinationsLoading || visitsLoading;

    const currentYear = new Date().getFullYear();
    const availableYears = useMemo(() => {
        if (!allVisitData) return [currentYear.toString()];
        const allYears = [...new Set(allVisitData.map(d => d.year.toString()))].sort((a, b) => parseInt(b) - parseInt(a));
        if (!allYears.includes(currentYear.toString())) {
            allYears.unshift(currentYear.toString());
        }
        return allYears.length > 0 ? allYears : [currentYear.toString()];
    }, [allVisitData, currentYear]);
    
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const totalVisitors = useMemo(() => allVisitData.reduce((sum, item) => sum + item.totalVisitors, 0), [allVisitData]);
    const totalWisnus = useMemo(() => allVisitData.reduce((sum, item) => sum + item.wisnus, 0), [allVisitData]);
    const totalWisman = useMemo(() => allVisitData.reduce((sum, item) => sum + item.wisman, 0), [allVisitData]);

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MonthlyLineChart data={allVisitData} />
                <MonthlyBarChart data={allVisitData} />
            </div>

            <TopDestinationsCard data={allVisitData} destinations={destinations || []} />
        </div>
    )
}
