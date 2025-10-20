
'use client';

import { useEffect, useState } from 'react';
import type { VisitData } from '@/lib/types';
import { Unsubscribe, onSnapshot, Firestore, collectionGroup, query, where } from 'firebase/firestore';

/**
 * A hook to fetch all visit data for a specific year from the 'visits' collection group.
 * This hook is intentionally simple: it fetches ALL visits for a year.
 * Filtering logic (e.g., by active destinations or by manager's assigned locations)
 * should be applied within the component that uses this hook.
 *
 * Requires a composite index in Firestore: `visits` collection group, `year` ASC.
 */
export function useAllVisitsForYear(firestore: Firestore | null, year: number) {
    const [data, setData] = useState<VisitData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) {
            setLoading(false);
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);

        // This query fetches all visits for a specific year across all destinations.
        const visitsQuery = query(collectionGroup(firestore, 'visits'), where('year', '==', year));

        const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
            const allVisitsForYear = snapshot.docs.map(doc => doc.data() as VisitData);
            setData(allVisitsForYear);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching all visits for year:", err);
            setError(err);
            setData([]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, year]);

    return { data, loading, error };
}
