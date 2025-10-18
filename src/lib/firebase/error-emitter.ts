import { EventEmitter } from 'events';

// This is a simple event emitter that can be used to broadcast events across the app.
// We use this to broadcast permission errors from Firestore so that we can display them
// in a central location.
export const errorEmitter = new EventEmitter();
