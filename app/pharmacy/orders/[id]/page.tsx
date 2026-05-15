"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, Chip } from "@/components/ui";
import { fmtVND, fmtDate } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";

interface OrderLine {
  name: string;
  form: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  date: string;
  lines: OrderLine[];
  total: number;
  status: OrderStatus;
  deliveryDate?: string;
  deliveryAddress: string;
  note?: string;
  nppName: string;
  nppPhone: string;
  confirmedAt?: string;
  shippedAt?: string;
  completedAt?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: "DH-NT-00023",
    date: "2026-05-05",
    status: "shipping",
    deliveryDate: "2026-05-09",
    deliveryAddress: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
    nppName: "Công ty TNHH Dược phẩm Nam Thuận",
    nppPhone: "028 3855 1234",
    note: "Giao giờ hành chính, có bảo vệ nhận hàng.",
    confirmedAt: "2026-05-05T09:30:00",
    shippedAt: "2026-05-06T08:00:00",
    lines: [
      {
        name: "Amoxicillin 500mg",
        form: "Viên nang",
        qty: 500,
        unit: "Viên",
        unitPrice: 1_800,
        total: 900_000,
      },
      {
        name: "Paracetamol 500mg",
        form: "Viên nén",
        qty: 1000,
        unit: "Viên",
        unitPrice: 1_300,
        total: 1_300_000,
      },
    ],
    total: 2_200_000,
  },
  {
    id: "DH-NT-00022",
    date: "2026-04-28",
    status: "completed",
    deliveryDate: "2026-05-02",
    deliveryAddress: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
    nppName: "Công ty TNHH Dược phẩm Nam Thuận",
    nppPhone: "028 3855 1234",
    confirmedAt: "2026-04-28T14:00:00",
    shippedAt: "2026-04-30T07:30:00",
    completedAt: "2026-05-02T10:15:00",
    lines: [
      {
        name: "Omeprazole 20mg",
        form: "Viên nang",
        qty: 300,
        unit: "Viên",
        unitPrice: 5_300,
        total: 1_590_000,
      },
      {
        name: "Vitamin C 1000mg",
        form: "Viên nén",
        qty: 200,
        unit: "Viên",
        unitPrice: 7_000,
        total: 1_400_000,
      },
    ],
    total: 2_990_000,
  },
  {
    id: "DH-NT-00021",
    date: "2026-04-15",
    status: "completed",
    deliveryDate: "2026-04-18",
    deliveryAddress: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
    nppName: "Công ty TNHH Dược phẩm Nam Thuận",
    nppPhone: "028 3855 1234",
    note: "Đơn bổ sung hàng khẩn.",
    confirmedAt: "2026-04-15T10:00:00",
    shippedAt: "2026-04-16T08:00:00",
    completedAt: "2026-04-18T09:00:00",
    lines: [
      {
        name: "Amoxicillin 500mg",
        form: "Viên nang",
        qty: 700,
        unit: "Viên",
        unitPrice: 2_800,
        total: 1_960_000,
      },
    ],
    total: 1_960_000,
  },
  {
    id: "DH-NT-00020",
    date: "2026-04-02",
    status: "pending",
    deliveryAddress: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM",
    nppName: "Công ty TNHH Dược phẩm Nam Thuận",
    nppPhone: "028 3855 1234",
    note: "Ưu tiên giao trước 10h sáng.",
    lines: [
      {
        name: "Paracetamol 500mg",
        form: "Viên nén",
        qty: 2000,
        unit: "Viên",
        unitPrice: 1_500,
        total: 3_000_000,
      },
      {
        name: "Vitamin C 1000mg",
        form: "Bột tiêm",
        qty: 500,
        unit: "Lọ",
        unitPrice: 5_400,
        total: 2_700_000,
      },
    ],
    total: 5_700_000,
  },
];

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: "default" | "primary" | "success" | "warning" | "danger" }
> = {
  pending:   { label: "Chờ xác nhận", color: "warning" },
  confirmed: { label: "Đã xác nhận",  color: "primary" },
  shipping:  { label: "Đang giao",    color: "primary" },
  completed: { label: "Hoàn thành",   color: "success" },
  cancelled: { label: "Đã huỷ",       color: "danger" },
};

// ─── Form badge ────────────────────────────────────────────────────────────
function FormBadge({ form }: { form: string }) {
  const styles: Record<string, string> = {
    "Viên nang": "bg-purple-100 text-purple-700",
    "Viên nén":  "bg-blue-100 text-blue-700",
    "Bột tiêm":  "bg-orange-100 text-orange-700",
  };
  const cls = styles[form] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{form}</span>
  );
}

// ─── Status timeline ────────────────────────────────────────────────────────
const TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending",   label: "Đặt hàng"   },
  { key: "confirmed", label: "Xác nhận"   },
  { key: "shipping",  label: "Vận chuyển" },
  { key: "completed", label: "Hoàn thành" },
];

const STATUS_RANK: Record<OrderStatus, number> = {
  pending:   0,
  confirmed: 1,
  shipping:  2,
  completed: 3,
  cancelled: -1,
};

function StatusTimeline({ order }: { order: Order }) {
  const rank = STATUS_RANK[order.status];

  const timestamps: Record<string, string | undefined> = {
    pending:   order.date,
    confirmed: order.confirmedAt,
    shipping:  order.shippedAt,
    completed: order.completedAt,
  };

  return (
    <div className="flex items-start gap-0 w-full overflow-x-auto pb-2">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepRank = STATUS_RANK[step.key];
        const reached  = rank >= stepRank;
        const ts       = timestamps[step.key];

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Step */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  reached
                    ? "bg-[#0F766E] border-[#0F766E] text-white"
                    : "bg-white border-[#E4EAE7] text-[#6B7A73]"
                }`}
              >
                {reached ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${reached ? "text-[#0F766E]" : "text-[#6B7A73]"}`}>
                {step.label}
              </span>
              {ts && reached && (
                <span className="text-[10px] text-[#6B7A73] whitespace-nowrap">
                  {fmtDate(ts.split("T")[0])}
                </span>
              )}
            </div>
            {/* Connector line */}
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-18px] ${
                  rank > stepRank ? "bg-[#0F766E]" : "bg-[#E4EAE7]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params  = useParams();
  const id      = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const order   = MOCK_ORDERS.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-4xl">📦</p>
        <p className="font-semibold text-[#10231C] text-lg">Không tìm thấy đơn hàng</p>
        <Link href="/pharmacy/orders">
          <span className="text-sm text-[#0F766E] font-medium hover:underline cursor-pointer">← Quay lại danh sách đơn hàng</span>
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-[#F6F8F7] pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {/* Back + header */}
        <div>
          <Link href="/pharmacy/orders">
            <span className="inline-flex items-center gap-1 text-sm text-[#0F766E] font-medium hover:underline cursor-pointer mb-3">
              ← Đơn hàng
            </span>
          </Link>
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#10231C]">{order.id}</h1>
                <Chip color={cfg.color} variant="flat" size="sm">{cfg.label}</Chip>
              </div>
              <p className="text-sm text-[#6B7A73] mt-1">Ngày đặt: {fmtDate(order.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#10231C]">{order.nppName}</p>
              <p className="text-sm text-[#6B7A73]">{order.nppPhone}</p>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        <Card>
          <CardBody className="py-5 px-6">
            <StatusTimeline order={order} />
          </CardBody>
        </Card>

        {/* Status banners */}
        {order.status === "shipping" && (
          <div className="p-4 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-[#0F766E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 001 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 12v4a1 1 0 01-1 1h-1" />
            </svg>
            <p className="text-sm font-medium text-[#0F766E]">Đơn hàng đang được vận chuyển đến nhà thuốc. Vui lòng kiểm tra hàng khi nhận.</p>
          </div>
        )}
        {order.status === "completed" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-700">Đã giao hàng thành công{order.completedAt ? ` vào ${fmtDate(order.completedAt.split("T")[0])}` : ""}.</p>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: order lines */}
          <div className="lg:col-span-2">
            <Card>
              <CardBody className="p-0">
                <div className="px-5 pt-5 pb-3 border-b border-[#E4EAE7]">
                  <h2 className="font-semibold text-[#10231C]">Chi tiết đơn hàng</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                        <th className="text-left px-5 py-3 font-medium text-[#6B7A73]">Sản phẩm</th>
                        <th className="text-left px-3 py-3 font-medium text-[#6B7A73]">Dạng</th>
                        <th className="text-right px-3 py-3 font-medium text-[#6B7A73]">SL</th>
                        <th className="text-right px-3 py-3 font-medium text-[#6B7A73]">Đơn giá</th>
                        <th className="text-right px-5 py-3 font-medium text-[#6B7A73]">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.lines.map((line, idx) => (
                        <tr key={idx} className="border-b border-[#E4EAE7] last:border-0 hover:bg-[#F6F8F7]/60 transition-colors">
                          <td className="px-5 py-3 font-medium text-[#10231C]">{line.name}</td>
                          <td className="px-3 py-3">
                            <FormBadge form={line.form} />
                          </td>
                          <td className="px-3 py-3 text-right text-[#10231C]">
                            {line.qty.toLocaleString("vi-VN")} {line.unit}
                          </td>
                          <td className="px-3 py-3 text-right text-[#6B7A73]">
                            {fmtVND(line.unitPrice)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-[#10231C]">
                            {fmtVND(line.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#F0FDFA]">
                        <td colSpan={4} className="px-5 py-3 text-right font-bold text-[#10231C]">Tổng cộng</td>
                        <td className="px-5 py-3 text-right font-bold text-[#0F766E] text-base">{fmtVND(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right: delivery + payment */}
          <div className="flex flex-col gap-4">
            {/* Delivery info */}
            <Card>
              <CardBody className="p-5">
                <h2 className="font-semibold text-[#10231C] mb-3">Thông tin giao hàng</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[#6B7A73] text-xs mb-0.5">Địa chỉ nhận hàng</p>
                    <p className="text-[#10231C]">{order.deliveryAddress}</p>
                  </div>
                  {order.deliveryDate && (
                    <div>
                      <p className="text-[#6B7A73] text-xs mb-0.5">Ngày giao dự kiến</p>
                      <p className="text-[#10231C]">{fmtDate(order.deliveryDate)}</p>
                    </div>
                  )}
                  {order.note && (
                    <div>
                      <p className="text-[#6B7A73] text-xs mb-0.5">Ghi chú</p>
                      <p className="text-[#10231C] italic">{order.note}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Payment summary */}
            <Card>
              <CardBody className="p-5">
                <h2 className="font-semibold text-[#10231C] mb-3">Tổng thanh toán</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#6B7A73]">
                    <span>Tạm tính</span>
                    <span className="text-[#10231C]">{fmtVND(order.total)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7A73]">
                    <span>Phí vận chuyển</span>
                    <span className="text-[#10231C]">0 ₫</span>
                  </div>
                  <div className="flex justify-between text-[#6B7A73]">
                    <span>VAT</span>
                    <span className="text-[#10231C]">0 ₫</span>
                  </div>
                  <div className="border-t border-[#E4EAE7] pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-[#10231C]">Thành tiền</span>
                    <span className="font-bold text-[#0F766E] text-base">{fmtVND(order.total)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end pt-2">
          {order.status === "pending" && (
            <button
              type="button"
              className="px-5 py-2.5 border border-red-400 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              Huỷ đơn
            </button>
          )}
          {order.status === "shipping" && (
            <button
              type="button"
              className="px-5 py-2.5 bg-[#0F766E] text-white text-sm font-medium rounded-xl hover:bg-[#0d6460] transition-colors cursor-pointer"
            >
              Xác nhận đã nhận hàng
            </button>
          )}
          <button
            type="button"
            className="px-5 py-2.5 border border-[#E4EAE7] text-[#10231C] text-sm font-medium rounded-xl hover:bg-[#F6F8F7] transition-colors cursor-pointer"
          >
            In đơn hàng
          </button>
        </div>

      </div>
    </div>
  );
}
