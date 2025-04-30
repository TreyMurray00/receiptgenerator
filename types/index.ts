export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id: string;
  title: string;
  date: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  items: ReceiptItem[];
  taxRate: number;
  currency: string;
  notes?: string;
  paymentMethod: 'cash' | 'bank';
  referenceNumber?: string;
  bankName?: string;
}

export interface Settings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  showLogo: boolean;
  darkMode: boolean;
  signature: string;
}