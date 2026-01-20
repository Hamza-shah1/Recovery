

export enum UserRole {
  SALESMAN = 'SALESMAN',
  CLIENT = 'CLIENT',
  COMPANY = 'COMPANY'
}

export enum PaymentType {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  MIXED = 'MIXED'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnic: string;
  role: UserRole;
  createdAt: number;
  password?: string;
}

export interface Client {
  id: string;
  shopName: string;
  phone: string;
  cnic: string;
  salesmanId: string;
  createdAt: number;
  totalPending: number;
  totalRecovered: number;
}

export interface Payment {
  id: string;
  clientId: string;
  salesmanId: string;
  totalBill: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: PaymentType;
  createdAt: number;
  receiptUrl?: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface AppState {
  currentUser: User | null;
  clients: Client[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

// AI Studio global types
// Moved the AIStudio interface into declare global to ensure it merges correctly with existing environment types
// and resolve the property type mismatch on the window object.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: Changed to optional to align with standard modifier requirements for global interface merging.
    aistudio?: AIStudio;
  }
}

// Support for direct global access without 'window.'
export const getAIStudio = (): AIStudio | undefined => {
  // Access global aistudio using the typed window object.
  return window.aistudio;
};
