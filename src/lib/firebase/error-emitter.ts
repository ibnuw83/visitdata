import { EventEmitter } from 'events';

/**
 * Global event bus untuk error Firebase
 * - permission-error: Untuk galat izin Firestore.
 * - firestore-error: Untuk galat umum Firestore lainnya.
 * - auth-error: Untuk galat otentikasi.
 * - network-error: Untuk galat terkait jaringan.
 */
export const errorEmitter = new EventEmitter();
