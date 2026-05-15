import { PaymentRecord } from "@/domain/models/payment";

export const mockPayments: PaymentRecord[] = [
  {
    id: "PAY-2026-001",
    orderId: "ORD-2026-001",
    contractId: "CTR-2026-001",
    invoiceNo: "INV-PP-2026-001",
    invoiceDate: "2026-03-20",
    dueDate: "2026-05-04",
    invoiceAmount: 877_500_000,
    paidAmount:    700_000_000,
    outstandingAmount: 177_500_000,
    status: "partially_paid",
    notes: "Đã thanh toán đợt 1 ngày 01/04/2026",
  },
];
