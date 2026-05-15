export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Nháp",
    pending_supplier_confirmation: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao",
    received_confirmed: "Đã nghiệm thu",
    issue_reported: "Có vấn đề",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
}

export function orderStatusColor(status: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  const map: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    draft: "default",
    pending_supplier_confirmation: "warning",
    confirmed: "primary",
    preparing: "secondary",
    shipping: "primary",
    delivered: "success",
    received_confirmed: "success",
    issue_reported: "danger",
    cancelled: "danger",
  };
  return map[status] || "default";
}

export function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    not_invoiced: "Chưa xuất hóa đơn",
    invoiced: "Đã xuất hóa đơn",
    partially_paid: "Thanh toán một phần",
    paid: "Đã thanh toán",
    overdue: "Quá hạn",
  };
  return map[status] || status;
}

export function paymentStatusColor(status: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  const map: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    not_invoiced: "default",
    invoiced: "primary",
    partially_paid: "warning",
    paid: "success",
    overdue: "danger",
  };
  return map[status] || "default";
}

export function allocationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    available: "Còn hàng",
    low_remaining: "Sắp hết",
    fully_allocated: "Đã phân bổ hết",
    near_expiry: "Gần hết hạn",
    in_shipping: "Đang vận chuyển",
    payment_pending: "Chờ thanh toán",
  };
  return map[status] || status;
}

export function allocationStatusColor(status: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  const map: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    available: "success",
    low_remaining: "warning",
    fully_allocated: "default",
    near_expiry: "danger",
    in_shipping: "primary",
    payment_pending: "secondary",
  };
  return map[status] || "default";
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    supplier_admin: "NCC - Quản trị",
    supplier_logistics: "NCC - Kho vận",
    supplier_finance: "NCC - Tài chính",
    hospital_buyer: "Bệnh viện - Mua hàng",
  };
  return map[role] || role;
}

export function actionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    order_created: "Tạo đơn hàng",
    order_confirmed: "Xác nhận đơn",
    delivery_updated: "Cập nhật giao hàng",
    receipt_confirmed: "Xác nhận nhận hàng",
    issue_reported: "Báo sự cố",
    payment_updated: "Cập nhật thanh toán",
    message_sent: "Gửi tin nhắn",
  };
  return map[type] || type;
}
