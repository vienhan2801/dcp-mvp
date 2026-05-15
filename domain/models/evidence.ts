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
  | "pharmacy_finance"     // Thanh toán
  // Khách hàng (Customer)
  | "customer_admin"
  | "customer_buyer"
  | "customer_receiver"
  | "customer_finance";

export type EvidenceActionType =
  | "order_created"
  | "order_confirmed"
  | "order_partially_confirmed"
  | "order_pending_approval"      // Đơn vào hàng đợi phê duyệt
  | "order_approved"              // NPP phê duyệt đơn
  | "delivery_updated"
  | "receipt_confirmed"
  | "issue_reported"
  | "issue_resolved"              // Sự cố được xử lý xong
  | "payment_updated"
  | "message_sent"
  | "contract_approved"           // HĐ phê duyệt bởi cả hai bên
  | "contract_amended"            // HĐ ký phụ lục / sửa đổi
  | "tender_imported"             // Gói thầu nhập vào thư viện
  | "tender_standardized"         // Gói thầu được chuẩn hóa
  | "drug_created"
  | "drug_updated";

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
