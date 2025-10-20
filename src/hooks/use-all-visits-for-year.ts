
'use client';

import { useEffect, useState } from 'react';
import type { VisitData } from '@/lib/types';
import { Unsubscribe, onSnapshot, Firestore, collectionGroup, query, where } from 'firebase/firestore';

export function useAllVisitsForYear(firestore: Firestore | null, destinationIds: string[], year: number) {
    const [allVisitData, setAllVisitData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const visitsQuery = query(collectionGroup(firestore, 'visits'), where('year', '==', year));

        const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
            const allVisitsForYear = snapshot.docs.map(doc => doc.data() as VisitData);
            
            // If destinationIds are provided (e.g., for a manager), filter the visits.
            // If destinationIds is empty (e.g., public dashboard loading destinations), show all.
            const filteredData = destinationIds.length > 0
                ? allVisitsForYear.filter(visit => destinationIds.includes(visit.destinationId))
                : allVisitsForYear;

            setAllVisitData(filteredData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching all visits for year:", error);
            setAllVisitData([]);
            setLoading(false);
        });

        return () => unsubscribe();
    // Using JSON.stringify on destinationIds ensures the effect re-runs if the array content changes, not just the reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, JSON.stringify(destinationIds), year]);

    return { data: allVisitData, loading: loading };
}
