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
            setAllVisitData([]);
            return;
        }

        setLoading(true);

        // This query fetches all visits for a specific year.
        // It requires a composite index on the 'visits' collection group.
        // Index: (year ASC, destinationId ASC)
        const visitsQuery = query(collectionGroup(firestore, 'visits'), where('year', '==', year));

        const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
            const allVisitsForYear = snapshot.docs.map(doc => doc.data() as VisitData);
            
            // If the component using this hook has a specific list of destinations (e.g., manager's dashboard),
            // filter the visits to only include those destinations.
            // If destinationIds is empty, it might mean the destination list is still loading,
            // so we filter based on what we have. An empty destinationIds list will result in empty filteredData.
            const filteredData = destinationIds.length > 0
                ? allVisitsForYear.filter(visit => destinationIds.includes(visit.destinationId))
                : [];

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
