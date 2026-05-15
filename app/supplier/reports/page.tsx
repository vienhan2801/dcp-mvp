"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";
import { BarChart, LineChart, PieChart } from "@/components/Charts";
import { fmtVND, fmtNum } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportTab =
  | "revenue"
  | "contracts"
  | "orders"
  | "receivables"
  | "inventory"
  | "quality"
  | "tenders";

const TABS: { key: ReportTab; label: string }[] = [
  { key: "revenue", label: "Doanh thu" },
  { key: "contracts", label: "Hợp đồng" },
  { key: "orders", label: "Đơn hàng" },
  { key: "receivables", label: "Công nợ" },
  { key: "inventory", label: "Tồn kho" },
  { key: "quality", label: "Chất lượng" },
  { key: "tenders", label: "Gói thầu" },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MONTHLY_REVENUE = [
  { label: "T1", value: 2100000000 },
  { label: "T2", value: 2800000000 },
  { label: "T3", value: 3100000000 },
  { label: "T4", value: 2600000000 },
  { label: "T5", value: 3400000000 },
  { label: "T6", value: 4200000000 },
  { label: "T7", value: 3800000000 },
  { label: "T8", value: 4500000000 },
  { label: "T9", value: 3200000000 },
  { label: "T10", value: 3900000000 },
  { label: "T11", value: 4100000000 },
  { label: "T12", value: 4800000000 },
];

const REVENUE_BY_CATEGORY = [
  { label: "Kháng sinh", value: 35, color: "#024430" },
  { label: "Tim mạch", value: 25, color: "#047857" },
  { label: "Giảm đau", value: 20, color: "#10B981" },
  { label: "Khác", value: 20, color: "#6EE7B7" },
];

const CONTRACTS_BY_QUARTER = [
  { label: "Q1 2025", value: 8 },
  { label: "Q2 2025", value: 11 },
  { label: "Q3 2025", value: 9 },
  { label: "Q4 2025", value: 14 },
  { label: "Q1 2026", value: 12 },
];

const CONTRACT_TABLE = [
  { id: "CTR-PP-BVD-2025", hospital: "BV ĐH Y Dược", value: 12500000000, status: "active", expiry: "31/12/2026" },
  { id: "CTR-PP-BVT-2026", hospital: "BV Trưng Vương", value: 8200000000, status: "expiring", expiry: "14/06/2026" },
  { id: "CTR-PP-BVC-2025", hospital: "BV Chợ Rẫy", value: 15800000000, status: "active", expiry: "30/09/2026" },
  { id: "CTR-PP-BVB-2025", hospital: "BV Bình Dân", value: 6400000000, status: "active", expiry: "28/02/2027" },
  { id: "CTR-PP-BVN-2026", hospital: "BV Nhi Đồng 1", value: 9100000000, status: "pending", expiry: "31/12/2026" },
];

const ORDERS_BY_WEEK = [
  { label: "T4W1", value: 38 },
  { label: "T4W2", value: 42 },
  { label: "T4W3", value: 35 },
  { label: "T4W4", value: 48 },
  { label: "T5W1", value: 41 },
  { label: "T5W2", value: 44 },
  { label: "T5W3", value: 39 },
  { label: "T5W4", value: 37 },
];

const AGING_BUCKETS = [
  { label: "Dưới 30 ngày", amount: 580000000, pct: 61, color: "text-emerald-600", bg: "bg-emerald-100" },
  { label: "30–60 ngày", amount: 240000000, pct: 25, color: "text-blue-600", bg: "bg-blue-100" },
  { label: "60–90 ngày", amount: 85000000, pct: 9, color: "text-amber-600", bg: "bg-amber-100" },
  { label: "Trên 90 ngày", amount: 30000000, pct: 3, color: "text-orange-600", bg: "bg-orange-100" },
  { label: "Quá hạn", amount: 12000000, pct: 1, color: "text-red-600", bg: "bg-red-100" },
];

const INVENTORY_ITEMS = [
  { drug: "Amoxicillin 500mg", stock: 8500, min: 2000, status: "ok" },
  { drug: "Paracetamol 500mg", stock: 12400, min: 3000, status: "ok" },
  { drug: "Atorvastatin 20mg", stock: 980, min: 1000, status: "low" },
  { drug: "Omeprazole 20mg", stock: 3200, min: 1500, status: "ok" },
  { drug: "Metformin 850mg", stock: 450, min: 1000, status: "out" },
  { drug: "Amlodipine 5mg", stock: 5600, min: 2000, status: "ok" },
  { drug: "Ciprofloxacin 500mg", stock: 780, min: 1500, status: "low" },
  { drug: "Ceftriaxone 1g", stock: 2100, min: 500, status: "ok" },
];

const TENDERS_BY_YEAR = [
  { label: "2022", value: 12 },
  { label: "2023", value: 18 },
  { label: "2024", value: 22 },
  { label: "2025", value: 26 },
  { label: "2026", value: 14 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, subColor = "text-[#6B7A73]" }: {
  label: string; value: string; sub?: string; subColor?: string;
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-[#6B7A73] font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#10231C]">{value}</p>
        {sub && <p className={`text-xs mt-1 font-medium ${subColor}`}>{sub}</p>}
      </CardBody>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    expiring: "bg-amber-100 text-amber-700",
    pending: "bg-blue-100 text-blue-700",
  };
  const label: Record<string, string> = {
    active: "Hiệu lực",
    expiring: "Sắp hết hạn",
    pending: "Chờ ký",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </span>
  );
}

function InventoryStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    ok: "bg-emerald-100 text-emerald-700",
    low: "bg-amber-100 text-amber-700",
    out: "bg-red-100 text-red-700",
  };
  const label: Record<string, string> = {
    ok: "Đủ hàng",
    low: "Sắp hết",
    out: "Hết hàng",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");

  return (
    <div>
      <PageHeader
        title="Báo cáo & Phân tích"
        subtitle="Dữ liệu kinh doanh tổng hợp theo thời gian thực"
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E4EAE7] rounded-xl text-sm text-[#10231C] hover:bg-[#F6F8F7] transition-colors">
              <span>📊</span> Excel
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E4EAE7] rounded-xl text-sm text-[#10231C] hover:bg-[#F6F8F7] transition-colors">
              <span>📄</span> PDF
            </button>
          </div>
        }
      />

      {/* KPI alert bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <span className="text-red-500 text-lg">🚨</span>
          <div>
            <p className="text-xs font-semibold text-red-700">Vi phạm SLA</p>
            <p className="text-xs text-red-600">2 đơn hàng quá hạn xử lý</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="text-xs font-semibold text-amber-700">Tồn kho thấp</p>
            <p className="text-xs text-amber-600">3 mặt hàng dưới ngưỡng tối thiểu</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-blue-500 text-lg">ℹ️</span>
          <div>
            <p className="text-xs font-semibold text-blue-700">Hợp đồng sắp hết hạn</p>
            <p className="text-xs text-blue-600">1 hợp đồng hết hạn trong 30 ngày</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-[#E4EAE7] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeTab === t.key
                ? "border-[#024430] text-[#024430]"
                : "border-transparent text-[#6B7A73] hover:text-[#10231C]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Revenue ── */}
      {activeTab === "revenue" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Tổng doanh thu (YTD)" value="38,5 tỷ VNĐ" sub="▲ +12% so tháng trước" subColor="text-emerald-600" />
            <KpiCard label="Đơn hoàn thành" value="847" sub="Tháng này: 74 đơn" />
            <KpiCard label="Giá trị trung bình/đơn" value="45,5 triệu" sub="▲ +3.2% so quý trước" subColor="text-emerald-600" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <CardBody>
                <p className="text-sm font-semibold text-[#10231C] mb-3">Doanh thu theo tháng (tỷ VNĐ)</p>
                <LineChart data={MONTHLY_REVENUE} height={160} />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm font-semibold text-[#10231C] mb-3">Cơ cấu theo nhóm thuốc</p>
                <div className="flex justify-center mb-3">
                  <PieChart slices={REVENUE_BY_CATEGORY} size={120} />
                </div>
                <div className="space-y-1.5">
                  {REVENUE_BY_CATEGORY.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-[#10231C]">{s.label}</span>
                      </div>
                      <span className="font-semibold text-[#10231C]">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ── Contracts ── */}
      {activeTab === "contracts" && (
        <div className="space-y-5">
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-[#10231C] mb-3">Số hợp đồng ký mới theo quý</p>
              <BarChart data={CONTRACTS_BY_QUARTER} height={160} />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                    {["Mã hợp đồng", "Bệnh viện", "Giá trị", "Trạng thái", "Hết hạn"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EAE7]">
                  {CONTRACT_TABLE.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F6F8F7] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#10231C] font-medium">{c.id}</td>
                      <td className="px-4 py-3 text-[#10231C]">{c.hospital}</td>
                      <td className="px-4 py-3 font-semibold text-[#10231C]">{fmtVND(c.value)}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-[#6B7A73]">{c.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── Orders ── */}
      {activeTab === "orders" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Tổng đơn (YTD)" value={fmtNum(324)} sub="Tháng này: 37 đơn" />
            <KpiCard label="Tỷ lệ đúng hạn" value="89%" sub="Mục tiêu: 90%" subColor="text-amber-600" />
            <KpiCard label="Thời gian trung bình" value="2,3 ngày" sub="▼ -0.4 ngày so tháng trước" subColor="text-emerald-600" />
          </div>
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-[#10231C] mb-3">Số đơn hàng theo tuần (8 tuần gần nhất)</p>
              <BarChart data={ORDERS_BY_WEEK} height={160} />
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── Receivables / Aging ── */}
      {activeTab === "receivables" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Tổng công nợ" value="947 triệu VNĐ" />
            <KpiCard label="Quá hạn" value="12 triệu VNĐ" sub="1.3% tổng công nợ" subColor="text-red-600" />
            <KpiCard label="Dưới 30 ngày" value="580 triệu VNĐ" sub="61% tổng công nợ" subColor="text-emerald-600" />
          </div>
          <Card>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                    {["Nhóm tuổi nợ", "Số tiền", "Tỷ lệ"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EAE7]">
                  {AGING_BUCKETS.map((b) => (
                    <tr key={b.label} className="hover:bg-[#F6F8F7] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.bg} ${b.color}`}>
                          {b.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${b.color}`}>{fmtVND(b.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#E4EAE7] rounded-full max-w-[120px]">
                            <div className="h-2 rounded-full bg-[#024430]" style={{ width: `${b.pct}%` }} />
                          </div>
                          <span className="text-xs text-[#6B7A73] w-8">{b.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── Inventory ── */}
      {activeTab === "inventory" && (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                  {["Tên thuốc", "Tồn kho hiện tại", "Tồn kho tối thiểu", "Trạng thái"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE7]">
                {INVENTORY_ITEMS.map((item) => (
                  <tr key={item.drug} className="hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#10231C]">{item.drug}</td>
                    <td className="px-4 py-3 font-semibold text-[#10231C]">{fmtNum(item.stock)}</td>
                    <td className="px-4 py-3 text-[#6B7A73]">{fmtNum(item.min)}</td>
                    <td className="px-4 py-3"><InventoryStatus status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* ── Quality ── */}
      {activeTab === "quality" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Giao đúng hạn"
            value="94%"
            sub="Mục tiêu: 95%"
            subColor="text-amber-600"
          />
          <KpiCard
            label="Hàng đạt chất lượng"
            value="99,2%"
            sub="▲ +0.3% so quý trước"
            subColor="text-emerald-600"
          />
          <KpiCard
            label="Khiếu nại"
            value="3"
            sub="Giảm 2 so tháng trước"
            subColor="text-emerald-600"
          />
          <KpiCard
            label="NPS"
            value="87"
            sub="Excellent (>70)"
            subColor="text-emerald-600"
          />
        </div>
      )}

      {/* ── Tenders ── */}
      {activeTab === "tenders" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Tổng gói thầu tham gia" value="92" sub="Từ 2022 đến nay" />
            <KpiCard label="Tỷ lệ thắng thầu" value="71%" sub="Trên trung bình ngành (55%)" subColor="text-emerald-600" />
            <KpiCard label="Giá trị thắng thầu 2026" value="28,4 tỷ VNĐ" sub="14 gói đã xác nhận" />
          </div>
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-[#10231C] mb-3">Số gói thầu theo năm</p>
              <BarChart data={TENDERS_BY_YEAR} height={160} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
