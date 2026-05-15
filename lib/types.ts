export type UserRole =
  | "supplier_admin"
  | "supplier_logistics"
  | "supplier_finance"
  | "hospital_buyer";

export type OrderStatus =
  | "draft"
  | "pending_supplier_confirmation"
  | "confirmed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "received_confirmed"
  | "issue_reported"
  | "cancelled";

export type PaymentStatus =
  | "not_invoiced"
  | "invoiced"
  | "partially_paid"
  | "paid"
  | "overdue";

export type AllocationStatus =
  | "available"
  | "low_remaining"
  | "fully_allocated"
  | "near_expiry"
  | "in_shipping"
  | "payment_pending";

export interface ContractItem {
  id: string;
  productCode: string;
  productName: string;
  activeIngredient: string;
  dosageForm: string;
  specification: string;
  unit: string;
  contractedQuantity: number;
  unitPrice: number;
  orderedQuantity: number;
  preparingQuantity: number;
  shippingQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  expiryDate: string;
  batchNo: string;
  status: AllocationStatus;
}

export interface OrderItem {
  contractItemId: string;
  productName: string;
  requestedQuantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface MedicineOrder {
  id: string;
  contractId: string;
  hospitalName: string;
  supplierName: string;
  orderDate: string;
  requestedDeliveryDate: string;
  deliveryLocation: string;
  note?: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

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
}

export interface EvidenceLog {
  id: string;
  contractId: string;
  orderId?: string;
  actorRole: UserRole;
  actorName: string;
  actionType:
    | "order_created"
    | "order_confirmed"
    | "delivery_updated"
    | "receipt_confirmed"
    | "issue_reported"
    | "payment_updated"
    | "message_sent";
  title: string;
  description: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  tenderCode: string;
  contractCode: string;
  contractName: string;
  supplierName: string;
  hospitalName: string;
  startDate: string;
  endDate: string;
  contractStatus: "active" | "expired" | "suspended";
  totalContractValue: number;
  orderedValue: number;
  deliveredValue: number;
  paidValue: number;
  outstandingValue: number;
  remainingValue: number;
  paymentTerm: string;
  deliveryTerm: string;
  items: ContractItem[];
}
