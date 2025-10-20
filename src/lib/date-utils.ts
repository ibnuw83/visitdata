import { format } from 'date-fns';
import type { FieldValue, Timestamp } from 'firebase/firestore';

/**
 * Safely converts a Firestore timestamp (which could be a Timestamp object,
 * a string, or a FieldValue placeholder) into a formatted date string.
 * @param fsTimestamp The timestamp value from Firestore.
 * @param formatString The desired date format string.
 * @returns The formatted date string or 'N/A' if the timestamp is invalid or not yet set.
 */
export function formatFirestoreTimestamp(
  fsTimestamp: FieldValue | { seconds: number; nanoseconds: number } | string | null | undefined,
  formatString: string = 'dd MMM yyyy'
): string {
  if (!fsTimestamp) {
    return 'N/A';
  }

  // Check if it's a Firestore Timestamp object
  if (typeof fsTimestamp === 'object' && 'seconds' in fsTimestamp && 'nanoseconds' in fsTimestamp) {
    return format((fsTimestamp as Timestamp).toDate(), formatString);
  }
  
  // Check if it's a string that can be parsed
  if (typeof fsTimestamp === 'string') {
    const date = new Date(fsTimestamp);
    if (!isNaN(date.getTime())) {
      return format(date, formatString);
    }
  }
  
  // If it's a server timestamp that hasn't been set yet or innego type, return a placeholder
  return 'Menunggu...';
}
