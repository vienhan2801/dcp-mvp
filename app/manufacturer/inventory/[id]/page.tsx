"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Chip } from "@/components/ui";
import PageHeader from "@/components/PageHeader";

// ── Types ──────────────────────────────────────────────────────
interface Certificate {
  name: string;
  number: string;
  issuedBy: string;
  date: string;
}

interface Transaction {
  date: string;
  type: string;
  qty: number;
  note: string;
}

interface LotData {
  product: string;
  lotNumber: string;
  form: string;
  strength: string;
  batchSize: number;
  manufactured: string;
  expiry: string;
  qcStatus: "passed" | "failed" | "pending";
  storageCondition: string;
  warehouse: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  certificates: Certificate[];
  transactions: Transaction[];
}

// ── Mock Data ──────────────────────────────────────────────────
const LOT_DATA: Record<string, LotData> = {
  "LOT-2026-001": {
    product: "Amoxicillin 500mg",
    lotNumber: "L2026-001",
    form: "Viên nang",
    strength: "500mg",
    batchSize: 50000,
    manufactured: "2026-01-15",
    expiry: "2027-01-14",
    qcStatus: "passed",
    storageCondition: "15–25°C, độ ẩm < 60%",
    warehouse: "Kho lạnh A, Kệ 3B",
    quantityOnHand: 36000,
    quantityReserved: 12000,
    quantityAvailable: 24000,
    certificates: [
      { name: "Certificate of Analysis", number: "COA-2026-001", issuedBy: "Phòng QC nội bộ", date: "2026-01-20" },
      { name: "Số đăng ký lưu hành", number: "VD-12345-20", issuedBy: "Cục Quản lý Dược", date: "2020-05-10" },
    ],
    transactions: [
      { date: "2026-05-02", type: "Xuất kho", qty: -12000, note: "PO-2026-001 → PhytoPharma" },
      { date: "2026-04-20", type: "Xuất kho", qty: -2000, note: "PO-2026-002 → MedDistrib Co." },
      { date: "2026-01-20", type: "Nhập kho", qty: 50000, note: "Nhập từ dây chuyền SX" },
    ],
  },
  "LOT-2026-002": {
    product: "Paracetamol 500mg",
    lotNumber: "L2026-002",
    form: "Viên nén",
    strength: "500mg",
    batchSize: 100000,
    manufactured: "2026-02-01",
    expiry: "2028-01-31",
    qcStatus: "passed",
    storageCondition: "Nhiệt độ phòng, < 30°C",
    warehouse: "Kho thường B, Kệ 1A",
    quantityOnHand: 90000,
    quantityReserved: 22000,
    quantityAvailable: 68000,
    certificates: [
      { name: "Certificate of Analysis", number: "COA-2026-002", issuedBy: "Phòng QC nội bộ", date: "2026-02-05" },
    ],
    transactions: [
      { date: "2026-05-05", type: "Xuất kho", qty: -10000, note: "PO-2026-001 → PhytoPharma" },
      { date: "2026-02-05", type: "Nhập kho", qty: 100000, note: "Nhập từ dây chuyền SX" },
    ],
  },
};

const FALLBACK_ID = "LOT-2026-001";

function fmtNum(n: number) {
  return Math.abs(n).toLocaleString("vi-VN");
}

const QC_STATUS_MAP = {
  passed: { label: "Đạt", color: "success" as const },
  failed: { label: "Không đạt", color: "danger" as const },
  pending: { label: "Đang kiểm tra", color: "warning" as const },
};

const TIMELINE_STEPS = [
  { icon: "🌿", label: "Nguyên liệu nhập" },
  { icon: "⚙️", label: "Sản xuất" },
  { icon: "🔬", label: "QC" },
  { icon: "📦", label: "Đóng gói" },
  { icon: "🏭", label: "Nhập kho" },
  { icon: "🚛", label: "Xuất kho giao NPP" },
];

export default function LotDetailPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const lotId = LOT_DATA[rawId] ? rawId : FALLBACK_ID;
  const lot = LOT_DATA[lotId];
  const qcInfo = QC_STATUS_MAP[lot.qcStatus];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/manufacturer/inventory"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7A73] hover:text-[#10231C] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại kho hàng
        </Link>
      </div>

      {/* Page header + QC badge */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title={lot.lotNumber}
          subtitle={lot.product}
        />
        <Chip color={qcInfo.color} size="lg" variant="flat">
          {qcInfo.label}
        </Chip>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-[#6B7A73] mb-1">Tồn kho khả dụng</p>
            <p className="text-2xl font-bold text-emerald-600">{fmtNum(lot.quantityAvailable)}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">viên</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[#6B7A73] mb-1">Đã đặt trước</p>
            <p className="text-2xl font-bold text-amber-500">{fmtNum(lot.quantityReserved)}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">viên</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-[#6B7A73] mb-1">Tổng lô sản xuất</p>
            <p className="text-2xl font-bold text-[#10231C]">{fmtNum(lot.batchSize)}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">viên</p>
          </CardBody>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lot info card */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-[#10231C]">Thông tin lô hàng</h2>
            </CardHeader>
            <CardBody>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Sản phẩm", lot.product],
                    ["Dạng bào chế", lot.form],
                    ["Hàm lượng", lot.strength],
                    ["Ngày SX", lot.manufactured],
                    ["Hạn dùng", lot.expiry],
                    ["Điều kiện bảo quản", lot.storageCondition],
                    ["Vị trí kho", lot.warehouse],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-[#E4EAE7] last:border-0">
                      <td className="py-2.5 pr-4 text-[#6B7A73] font-medium w-44 whitespace-nowrap">{label}</td>
                      <td className="py-2.5 text-[#10231C]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Transaction history card */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-[#10231C]">Lịch sử giao dịch</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {["Ngày", "Loại", "Số lượng", "Ghi chú"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-xs font-semibold text-[#6B7A73] bg-[#F6F8F7] border-b border-[#E4EAE7] whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lot.transactions.map((tx, i) => (
                      <tr key={i} className="border-b border-[#E4EAE7] last:border-0 hover:bg-[#F6F8F7] transition-colors">
                        <td className="px-5 py-3 text-[#10231C] whitespace-nowrap">{tx.date}</td>
                        <td className="px-5 py-3 text-[#10231C]">{tx.type}</td>
                        <td className={`px-5 py-3 font-semibold tabular-nums ${tx.qty > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                          {tx.qty > 0 ? "+" : "-"}{fmtNum(tx.qty)}
                        </td>
                        <td className="px-5 py-3 text-[#6B7A73]">{tx.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">
          {/* Certificates card */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-[#10231C]">Chứng từ &amp; Kiểm nghiệm</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {lot.certificates.map((cert, i) => (
                <div key={i} className="border border-[#E4EAE7] rounded-xl p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold text-base leading-none">✓</span>
                      <p className="text-sm font-semibold text-[#10231C] leading-snug">{cert.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7A73]">Số: <span className="font-medium text-[#10231C]">{cert.number}</span></p>
                  <p className="text-xs text-[#6B7A73]">Cấp bởi: <span className="font-medium text-[#10231C]">{cert.issuedBy}</span></p>
                  <p className="text-xs text-[#6B7A73]">Ngày: {cert.date}</p>
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    onClick={() => {}}
                    className="mt-1 w-full text-violet-700 bg-violet-50 hover:bg-violet-100"
                  >
                    Xem
                  </Button>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Inventory summary card */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-[#10231C]">Tóm tắt tồn kho</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10231C] flex-shrink-0" />
                <div className="flex-1 flex justify-between">
                  <span className="text-sm text-[#6B7A73]">Tổng SX</span>
                  <span className="text-sm font-semibold text-[#10231C]">{fmtNum(lot.batchSize)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="flex-1 flex justify-between">
                  <span className="text-sm text-[#6B7A73]">Đã xuất</span>
                  <span className="text-sm font-semibold text-amber-600">
                    -{fmtNum(lot.batchSize - lot.quantityOnHand)}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#E4EAE7] pt-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="flex-1 flex justify-between">
                  <span className="text-sm text-[#6B7A73]">Còn lại</span>
                  <span className="text-sm font-bold text-emerald-600">{fmtNum(lot.quantityOnHand)}</span>
                </div>
              </div>
              {/* Visual bar */}
              <div className="w-full bg-[#E4EAE7] rounded-full h-2 mt-1">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.round((lot.quantityOnHand / lot.batchSize) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#6B7A73] text-right">
                {Math.round((lot.quantityOnHand / lot.batchSize) * 100)}% còn trong kho
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Traceability timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[#10231C]">Truy xuất nguồn gốc</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-0 flex-wrap">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-[#F6F8F7] border-2 border-[#6D28D9] flex items-center justify-center text-base">
                    {step.icon}
                  </div>
                  <span className="text-[10px] text-[#6B7A73] text-center max-w-[64px] leading-tight">{step.label}</span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className="w-8 h-0.5 bg-[#6D28D9]/30 mb-4 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
