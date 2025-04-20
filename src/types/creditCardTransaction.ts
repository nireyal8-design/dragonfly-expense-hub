export interface CreditCardTransaction {
  transactionDate: string;
  merchantName: string;
  category: string;
  amount: number;
  paymentMethod: 'credit' | 'standing_order' | 'mobile_payment';
  isRecurring: boolean;
  recurringDetails?: {
    currentPayment: number;
    totalPayments: number;
  };
  notes?: string;
}

export interface Transaction {
  date: string;
  name: string;
  category: string;
  type: 'Domestic' | 'Foreign';
  paymentDetails: string | null;
  amount: number;
} 