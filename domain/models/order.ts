// ─────────────────────────────────────────────────────────
// ORDER DOMAIN MODEL
// Orders are demand plans — each line has independent lifecycle
// ─────────────────────────────────────────────────────────

export type OrderLineStatus =
  | "draft"
  | "pending_confirmation"
  | "partially_confirmed"
  | "confirmed"
  | "partially_fulfilled"
  | "fulfilled"
  | "cancelled";

export type OrderStatus =
  | "draft"
  | "pending_check"          // Mới gửi — đang auto-validate
  | "pending_confirmation"   // Legacy / chờ xác nhận
  | "pending_approval"       // Đã validate — chờ NPP phê duyệt
  | "partially_confirmed"
  | "confirmed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "received_confirmed"
  | "rejected"
  | "cancelled";

export type DeliveryStatus = "preparing" | "shipping" | "delivered";

export interface FulfillmentRecord {
  id: string;
  orderLineId: string;
  source: "warehouse" | "manufacturer";
  quantity: number;
  status: "pending" | "dispatched" | "delivered";
  dispatchedAt?: string;
  deliveredAt?: string;
  note?: string;
}

export interface OrderLine {
  id: string;
  contractItemId: string;
  productName: string;
  productCode: string;
  unit: string;
  unitPrice: number;

  // ── Quantity lifecycle ──
  requestedQty: number;
  confirmedQty: number;    // supplier confirms (can be partial)
  rejectedQty: number;     // supplier rejects
  deliveredQty: number;    // physically delivered
  lineAmount: number;      // requestedQty × unitPrice

  status: OrderLineStatus;
  fulfillmentRecords: FulfillmentRecord[];
  supplierNote?: string;   // reason for partial confirm
}

export interface Order {
  id: string;
  contractId: string;
  hospitalName: string;
  supplierName: string;
  orderDate: string;
  requestedDeliveryDate: string;
  deliveryLocation: string;
  note?: string;
  status: OrderStatus;
  totalRequestedAmount: number;
  totalConfirmedAmount: number;
  lines: OrderLine[];
}
