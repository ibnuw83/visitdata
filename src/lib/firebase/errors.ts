export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: Record<string, any>;

  constructor(context: Record<string, any>, message?: string) {
    super(message || 'Firestore Permission Denied');
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
