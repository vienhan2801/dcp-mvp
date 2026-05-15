"use client";
import { use, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";

const ACCENT = "#0F766E";

// ── Mock contract data ────────────────────────────────────────────────────────
const CONTRACTS: Record<string, {
  id: string; name: string; npp: string; value: number;
  startDate: string; endDate: string; status: string;
  items: { id: string; drug: string; ingredient: string; form: string; strength: string; unit: string; unitPrice: number; maxQty: number; ordered: number }[];
  orders: { id: string; date: string; total: number; status: string }[];
}> = {
  "CT-NT-2026-001": {
    id: "CT-NT-2026-001",
    name: "Hợp đồng cung cấp thuốc 2026",
    npp: "DCP Pharma (PhytoPharma)",
    value: 156_000_000,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    status: "Đang hiệu lực",
    items: [
      { id: "i1", drug: "Paracetamol 500mg",    ingredient: "Paracetamol",             form: "Viên nén",  strength: "500mg", unit: "Viên", unitPrice: 800,   maxQty: 36_000, ordered: 8_000  },
      { id: "i2", drug: "Amoxicillin 500mg",    ingredient: "Amoxicillin trihydrate",  form: "Viên nang", strength: "500mg", unit: "Viên", unitPrice: 1_200, maxQty: 12_000, ordered: 3_600  },
      { id: "i3", drug: "Omeprazole 20mg",      ingredient: "Omeprazole",              form: "Viên nang", strength: "20mg",  unit: "Viên", unitPrice: 2_800, maxQty: 6_000,  ordered: 1_200  },
      { id: "i4", drug: "Azithromycin 500mg",   ingredient: "Azithromycin",            form: "Viên nang", strength: "500mg", unit: "Viên", unitPrice: 3_500, maxQty: 4_800,  ordered: 2_100  },
    ],
    orders: [
      { id: "ORD-NT-001", date: "15/03/2026", total: 3_840_000, status: "Đã nhận hàng" },
      { id: "ORD-NT-002", date: "01/04/2026", total: 2_160_000, status: "Đã nhận hàng" },
      { id: "ORD-NT-003", date: "20/04/2026", total: 5_600_000, status: "Đang giao"    },
      { id: "ORD-NT-004", date: "05/05/2026", total: 4_200_000, status: "Đang chuẩn bị" },
    ],
  },
  "CT-NT-2026-002": {
    id: "CT-NT-2026-002",
    name: "Hợp đồng bổ sung Q2/2026",
    npp: "MedDistrib Co.",
    value: 48_000_000,
    startDate: "01/04/2026",
    endDate: "30/09/2026",
    status: "Đang hiệu lực",
    items: [
      { id: "i1", drug: "Ceftriaxone 1g",       ingredient: "Ceftriaxone sodium",      form: "Bột tiêm",  strength: "1g",    unit: "Lọ",   unitPrice: 45_000, maxQty: 400,    ordered: 80     },
      { id: "i2", drug: "Metformin 500mg",       ingredient: "Metformin HCl",           form: "Viên nén",  strength: "500mg", unit: "Viên", unitPrice: 650,    maxQty: 12_000, ordered: 2_000  },
    ],
    orders: [
      { id: "ORD-NT-005", date: "10/04/2026", total: 4_650_000, status: "Đã nhận hàng" },
      { id: "ORD-NT-006", date: "02/05/2026", total: 2_900_000, status: "Đang giao"    },
    ],
  },
};

const STATUS_ORDER_COLORS: Record<string, string> = {
  "Đã nhận hàng": "bg-green-100 text-green-700",
  "Đang giao":    "bg-blue-100 text-blue-700",
  "Đang chuẩn bị":"bg-orange-100 text-orange-700",
};

function fmtVND(n: number) { return n.toLocaleString("vi-VN") + " ₫"; }
function fmtNum(n: number) { return n.toLocaleString("vi-VN"); }
function pct(ordered: number, max: number) { return Math.round((ordered / max) * 100); }

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PharmacyContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"drugs" | "allocation" | "history">("drugs");

  const contract = CONTRACTS[id] ?? CONTRACTS["CT-NT-2026-001"];

  const tabs = [
    { key: "drugs",      label: "Danh mục thuốc" },
    { key: "allocation", label: "Phân bổ hạn mức" },
    { key: "history",    label: "Lịch sử đặt hàng" },
  ] as const;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Back */}
      <div>
        <Link href="/pharmacy/contracts">
          <span className="inline-flex items-center gap-1 text-xs text-[#6B7A73] hover:text-[#10231C] cursor-pointer">
            ← Danh sách hợp đồng
          </span>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <PageHeader title={contract.id} subtitle={contract.name} />
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/pharmacy/orders/new">
            <button className="text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT }}>
              Đặt hàng theo HĐ
            </button>
          </Link>
          <button className="text-sm font-semibold px-4 py-2 rounded-xl border-2 hover:bg-teal-50 transition-colors"
            style={{ borderColor: ACCENT, color: ACCENT }}>
            Tải HĐ (PDF)
          </button>
        </div>
      </div>

      {/* Contract header */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[#6B7A73] mb-0.5">Nhà phân phối</p>
              <p className="text-sm font-semibold text-[#10231C]">{contract.npp}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A73] mb-0.5">Giá trị HĐ</p>
              <p className="text-sm font-bold text-[#10231C]">{fmtVND(contract.value)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A73] mb-0.5">Thời hạn</p>
              <p className="text-sm font-semibold text-[#10231C]">{contract.startDate} – {contract.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A73] mb-0.5">Trạng thái</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                ● {contract.status}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4EAE7]">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? "border-current text-[#0F766E]"
                : "border-transparent text-[#6B7A73] hover:text-[#10231C]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1 — Drug catalog */}
      {activeTab === "drugs" && (
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7]">
                    {["Tên thuốc", "Hoạt chất", "Dạng bào chế", "Hàm lượng", "Đơn vị", "Đơn giá HĐ", "Số lượng tối đa/năm"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="py-3 pr-4 font-semibold text-[#10231C]">{item.drug}</td>
                      <td className="py-3 pr-4 text-[#6B7A73]">{item.ingredient}</td>
                      <td className="py-3 pr-4 text-[#6B7A73]">{item.form}</td>
                      <td className="py-3 pr-4 text-[#6B7A73]">{item.strength}</td>
                      <td className="py-3 pr-4 text-[#6B7A73]">{item.unit}</td>
                      <td className="py-3 pr-4 font-medium text-[#10231C]">{fmtVND(item.unitPrice)}</td>
                      <td className="py-3 text-[#10231C]">{fmtNum(item.maxQty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab 2 — Allocation */}
      {activeTab === "allocation" && (
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7]">
                    {["Thuốc", "Hạn mức HĐ", "Đã đặt", "Còn lại", "% Đã dùng", "Dự kiến hết"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.items.map((item) => {
                    const remaining = item.maxQty - item.ordered;
                    const p = pct(item.ordered, item.maxQty);
                    const color = p > 80 ? "#EF4444" : p > 50 ? "#F59E0B" : ACCENT;
                    // months to exhaust at current rate (simple estimate)
                    const monthsLeft = item.ordered > 0 ? Math.round((remaining / (item.ordered / 5)) * 10) / 10 : 99;
                    return (
                      <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0">
                        <td className="py-3 pr-4 font-semibold text-[#10231C]">{item.drug}</td>
                        <td className="py-3 pr-4 text-[#10231C]">{fmtNum(item.maxQty)} {item.unit}</td>
                        <td className="py-3 pr-4 text-[#10231C]">{fmtNum(item.ordered)}</td>
                        <td className="py-3 pr-4 font-semibold" style={{ color }}>{fmtNum(remaining)}</td>
                        <td className="py-3 pr-4 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#E4EAE7] rounded-full overflow-hidden">
                              <div className="h-1.5 rounded-full" style={{ width: `${p}%`, backgroundColor: color }} />
                            </div>
                            <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{p}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-xs text-[#6B7A73]">
                          {monthsLeft > 12 ? "Đến hết HĐ" : `~${monthsLeft} tháng`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab 3 — Order history */}
      {activeTab === "history" && (
        <Card>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  {["Mã đơn", "Ngày đặt", "Tổng tiền", "Trạng thái"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contract.orders.map((o) => (
                  <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs font-bold" style={{ color: ACCENT }}>{o.id}</td>
                    <td className="py-3 pr-4 text-[#6B7A73]">{o.date}</td>
                    <td className="py-3 pr-4 font-semibold text-[#10231C]">{fmtVND(o.total)}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_ORDER_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
