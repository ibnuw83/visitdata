
type FirestoreOperation = 'get' | 'list' | 'create' | 'update' | 'delete';

interface FirestorePermissionErrorOptions {
    path: string;
    operation: FirestoreOperation;
    message?: string;
}

export class FirestorePermissionError extends Error {
    path: string;
    operation: FirestoreOperation;

    constructor({ path, operation, message }: FirestorePermissionErrorOptions) {
        const defaultMessage = `Firestore permission denied for operation '${operation}' on path '${path}'.`;
        super(message || defaultMessage);
        this.name = 'FirestorePermissionError';
        this.path = path;
        this.operation = operation;
        
        // This is to make the error serializable and visible in logs.
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
