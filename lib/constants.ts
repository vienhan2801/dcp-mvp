import { OrderLineStatus, OrderStatus } from "@/domain/models/order";
import { PaymentStatus } from "@/domain/models/payment";
import { AllocationStatus } from "@/domain/models/contract";
import { UserRole, EvidenceActionType } from "@/domain/models/evidence";

// ─────────────────────────────────────────────
// STATUS LABELS & COLORS
// ─────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Nháp",
  pending_check: "Đang kiểm tra",
  pending_confirmation: "Chờ xác nhận",
  pending_approval: "Chờ phê duyệt",
  partially_confirmed: "Xác nhận một phần",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao",
  received_confirmed: "Đã nghiệm thu",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  draft: "default",
  pending_check: "warning",
  pending_confirmation: "warning",
  pending_approval: "warning",
  partially_confirmed: "secondary",
  confirmed: "primary",
  preparing: "secondary",
  shipping: "primary",
  delivered: "success",
  received_confirmed: "success",
  rejected: "danger",
  cancelled: "danger",
};

export const LINE_STATUS_LABELS: Record<OrderLineStatus, string> = {
  draft: "Nháp",
  pending_confirmation: "Chờ xác nhận",
  partially_confirmed: "XN một phần",
  confirmed: "Đã xác nhận",
  partially_fulfilled: "GH một phần",
  fulfilled: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const LINE_STATUS_COLORS: Record<OrderLineStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  draft: "default",
  pending_confirmation: "warning",
  partially_confirmed: "secondary",
  confirmed: "primary",
  partially_fulfilled: "secondary",
  fulfilled: "success",
  cancelled: "danger",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  not_invoiced: "Chưa xuất HĐ",
  invoiced: "Đã xuất HĐ",
  partially_paid: "TT một phần",
  paid: "Đã thanh toán",
  overdue: "Quá hạn",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  not_invoiced: "default",
  invoiced: "primary",
  partially_paid: "warning",
  paid: "success",
  overdue: "danger",
};

export const ALLOCATION_STATUS_LABELS: Record<AllocationStatus, string> = {
  available: "Còn hàng",
  low_remaining: "Sắp hết",
  fully_allocated: "Phân bổ hết",
  near_expiry: "Gần hết hạn",
  overallocated: "Vượt hạn mức",
};

export const ALLOCATION_STATUS_COLORS: Record<AllocationStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  available: "success",
  low_remaining: "warning",
  fully_allocated: "default",
  near_expiry: "danger",
  overallocated: "danger",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  supplier_admin: "Nhà phân phối - Quản trị",
  supplier_logistics: "Nhà phân phối - Kho vận",
  supplier_finance: "Nhà phân phối - Tài chính",
  manufacturer_admin: "Nhà cung cấp - Quản trị",
  manufacturer_logistics: "Nhà cung cấp - Kho vận",
  manufacturer_finance: "Nhà cung cấp - Tài chính",
  hospital_admin: "Bệnh viện - Quản trị",
  hospital_buyer: "Bệnh viện - Mua hàng",
  hospital_warehouse: "Bệnh viện - Kho vận",
  hospital_finance: "Bệnh viện - Tài chính",
  pharmacy_admin: "Nhà thuốc - Quản trị",
  pharmacy_buyer: "Nhà thuốc - Đặt hàng",
  pharmacy_warehouse: "Nhà thuốc - Kho vận",
  pharmacy_finance: "Nhà thuốc - Tài chính",
};

export const EVIDENCE_ACTION_LABELS: Record<EvidenceActionType, string> = {
  order_created: "Tạo đơn hàng",
  order_confirmed: "Xác nhận đơn",
  order_partially_confirmed: "XN một phần",
  order_pending_approval: "Chờ phê duyệt",
  order_approved: "Phê duyệt đơn",
  delivery_updated: "Cập nhật giao hàng",
  receipt_confirmed: "Nghiệm thu",
  issue_reported: "Báo sự cố",
  issue_resolved: "Xử lý sự cố",
  payment_updated: "Cập nhật TT",
  message_sent: "Gửi tin nhắn",
  contract_approved: "Phê duyệt HĐ",
  contract_amended: "Ký phụ lục HĐ",
  tender_imported: "Nhập gói thầu",
  tender_standardized: "Chuẩn hóa gói thầu",
  drug_created: "Tạo hồ sơ thuốc",
  drug_updated: "Cập nhật thuốc",
};

export const NEXT_DELIVERY_ACTION: Partial<Record<OrderStatus, string>> = {
  confirmed: "Bắt đầu chuẩn bị hàng",
  partially_confirmed: "Bắt đầu chuẩn bị hàng",
  preparing: "Xuất kho – Bắt đầu vận chuyển",
  shipping: "Xác nhận đã giao hàng",
};
