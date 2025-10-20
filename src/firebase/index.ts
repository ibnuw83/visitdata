

// This file serves as a central hub for re-exporting Firebase-related utilities,
// making it easier to import them across the application.

import { useMemo } from "react";

// Core client providers and hooks
export { useFirebaseApp, useFirestore, useAuth, useAuthUser } from '@/app/providers';

// Authentication hook
export { useUser } from '@/lib/firebase/auth/use-user';

// Firestore hooks
export { useCollection } from '@/lib/firebase/firestore/use-collection';
export { useDoc } from '@/lib/firebase/firestore/use-doc';
export { useQuery } from '@/lib/firebase/firestore/use-query';

/**
 * A custom hook that memoizes a Firebase query or document reference.
 * This is crucial to prevent infinite loops in `useEffect` hooks within `useCollection` or `useDoc`
 * when the query/reference is created dynamically.
 * @param factory A function that creates the Firebase query or reference.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns The memoized query or reference.
 */
export const useMemoFirebase = <T>(factory: () => T, deps: React.DependencyList) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
};
