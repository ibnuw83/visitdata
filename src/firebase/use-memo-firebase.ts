'use client';

import { useMemo, DependencyList } from 'react';
import {
  Query,
  DocumentReference,
  queryEqual,
  refEqual,
} from 'firebase/firestore';

type FirebaseRef = Query | DocumentReference;

function refEquals(a: FirebaseRef | null, b: FirebaseRef | null): boolean {
  if (!a || !b) {
    return a === b;
  }
  if ('path' in a && 'path' in b) {
    return refEqual(a, b);
  }
  if ('_query' in a && '_query' in b) {
    return queryEqual(a, b);
  }
  return false;
}

/**
 * A custom `useMemo` hook that is aware of Firebase SDK objects.
 * It uses `queryEqual` and `refEqual` to compare `Query` and `DocumentReference` objects.
 */
export function useMemoFirebase<T extends FirebaseRef | null>(
  factory: () => T,
  deps: DependencyList | undefined
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dependencies = deps || [];

  const ref = React.useRef<[T, DependencyList] | null>(null);

  if (
    ref.current === null ||
    dependencies.length !== ref.current[1].length ||
    dependencies.some((dep, i) => {
      const prevDep = ref.current![1][i];
      if (
        (dep instanceof Query || dep instanceof DocumentReference) &&
        (prevDep instanceof Query || prevDep instanceof DocumentReference)
      ) {
        return !refEquals(dep, prevDep);
      }
      return dep !== prevDep;
    })
  ) {
    ref.current = [factory(), dependencies];
  }

  return ref.current[0];
}
