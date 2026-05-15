export type UserRole =
  // NPP (Nhà phân phối)
  | "supplier_admin"
  | "supplier_logistics"
  | "supplier_finance"
  // Nhà cung cấp (Manufacturer)
  | "manufacturer_admin"
  | "manufacturer_logistics"
  | "manufacturer_finance"
  // Bệnh viện (Hospital)
  | "hospital_admin"
  | "hospital_buyer"       // Mua hàng / đặt đơn
  | "hospital_warehouse"   // Quản kho / nhập kho / nghiệm thu
  | "hospital_finance"     // Thanh toán
  // Nhà thuốc (Pharmacy)
  | "pharmacy_admin"
  | "pharmacy_buyer"       // Chủ nhà thuốc / đặt hàng
  | "pharmacy_warehouse"   // Quản kho / nhập kho
  | "pharmacy_finance";    // Thanh toán

export type EvidenceActionType =
  | "order_created"
  | "order_confirmed"
  | "order_partially_confirmed"
  | "delivery_updated"
  | "receipt_confirmed"
  | "issue_reported"
  | "payment_updated"
  | "message_sent";

export interface EvidenceLog {
  id: string;
  contractId: string;
  orderId?: string;
  actorRole: UserRole;
  actorName: string;
  actionType: EvidenceActionType;
  title: string;
  description: string;
  metadata?: Record<string, string | number>;
  createdAt: string;
}
