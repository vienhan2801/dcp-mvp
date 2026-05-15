import { PaymentRecord, PaymentStatus } from "@/domain/models/payment";

export function createPaymentRecord(
  orderId: string,
  contractId: string,
  invoiceAmount: number
): PaymentRecord {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 45); // 45-day payment term

  return {
    id: `PAY-${Date.now()}`,
    orderId,
    contractId,
    invoiceNo: `INV-PP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    invoiceDate: today.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    invoiceAmount,
    paidAmount: 0,
    outstandingAmount: invoiceAmount,
    status: "invoiced",
  };
}

export function updatePayment(
  record: PaymentRecord,
  paidAmount: number
): PaymentRecord {
  const outstanding = record.invoiceAmount - paidAmount;
  let status: PaymentStatus;
  if (paidAmount <= 0) status = "invoiced";
  else if (paidAmount < record.invoiceAmount) status = "partially_paid";
  else status = "paid";

  return { ...record, paidAmount, outstandingAmount: outstanding, status };
}

export function isOverdue(record: PaymentRecord): boolean {
  if (record.status === "paid") return false;
  return new Date(record.dueDate) < new Date();
}

export function getPaymentSummary(records: PaymentRecord[]) {
  const totalInvoiced = records.reduce((s, r) => s + r.invoiceAmount, 0);
  const totalPaid = records.reduce((s, r) => s + r.paidAmount, 0);
  const totalOutstanding = records.reduce((s, r) => s + r.outstandingAmount, 0);
  const overdueCount = records.filter(isOverdue).length;
  return { totalInvoiced, totalPaid, totalOutstanding, overdueCount };
}
