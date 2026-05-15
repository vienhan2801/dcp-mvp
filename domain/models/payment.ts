export type PaymentStatus =
  | "not_invoiced"
  | "invoiced"
  | "partially_paid"
  | "paid"
  | "overdue";

export interface PaymentRecord {
  id: string;
  orderId: string;
  contractId: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: PaymentStatus;
  notes?: string;
}
