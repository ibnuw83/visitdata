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

export class FirestoreGenericError extends Error {
  context: Record<string, any>;
  constructor(context: Record<string, any>, message?: string) {
    super(message || 'Firestore Error');
    this.name = 'FirestoreGenericError';
    this.context = context;
  }
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message || 'Authentication Error');
    this.name = 'AuthError';
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(message?: string) {
    super(message || 'Network connection error');
    this.name = 'NetworkError';
  }
}
