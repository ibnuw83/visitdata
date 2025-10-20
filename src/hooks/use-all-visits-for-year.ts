
'use client';

import { useEffect, useState } from 'react';
import type { VisitData } from '@/lib/types';
import { Unsubscribe, onSnapshot, Firestore, collection, query, where } from 'firebase/firestore';

export function useAllVisitsForYear(firestore: Firestore | null, destinationIds: string[], year: number) {
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
                console.warn("useAllVisitsForYear timed out. Some data might be missing.");
                setLoading(false);
            }
        }, 8000); // Increased timeout

        const checkCompletion = () => {
            // This function is called every time a destination's data is loaded.
            // When all destinations have been processed (successfully or with an error),
            // the loading state is set to false.
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
                
                // Combine all fetched data into a single array
                const combinedData = Object.values(allData).flat();
                setAllVisitData(combinedData);
                
                checkCompletion();

            }, (error) => {
                console.error(`Error fetching visits for destination ${destId} in year ${year}:`, error);
                allData[destId] = []; // On error, assume no data for this destination
                checkCompletion();
            });
            unsubscribers.push(unsubscribe);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(loadingTimeout);
        };
    // Using JSON.stringify on destinationIds ensures the effect re-runs if the array content changes, not just the reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, JSON.stringify(destinationIds), year]);

    return { data: allVisitData, loading: loading };
}
