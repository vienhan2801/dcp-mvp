"use client";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Chip, Progress } from "@/components/ui";

// ─── Mock data ────────────────────────────────────────────────────────────────
interface ContractItem {
  id: string;
  name: string;
  unit: string;
  contractedQty: number;
  deliveredQty: number;
  unitPrice: number;
}

interface Contract {
  id: string;
  code: string;
  name: string;
  distributor: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  usedValue: number;
  status: "active" | "expired" | "pending";
  items: ContractItem[];
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "c1",
    code: "HĐ-NT-2026-002",
    name: "Hợp đồng mua thuốc Quý 2/2026",
    distributor: "Công ty TNHH Phân phối DCP",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    totalValue: 850_000_000,
    usedValue: 312_000_000,
    status: "active",
    items: [
      { id: "i1", name: "Amoxicillin 500mg", unit: "Viên", contractedQty: 5000, deliveredQty: 3800, unitPrice: 2_800 },
      { id: "i2", name: "Paracetamol 500mg", unit: "Viên", contractedQty: 8000, deliveredQty: 5200, unitPrice: 800 },
      { id: "i3", name: "Omeprazole 20mg",   unit: "Viên", contractedQty: 3000, deliveredQty: 2400, unitPrice: 4_500 },
      { id: "i4", name: "Vitamin C 1000mg",  unit: "Viên", contractedQty: 4000, deliveredQty: 1200, unitPrice: 8_200 },
    ],
  },
  {
    id: "c2",
    code: "HĐ-NT-2025-007",
    name: "Hợp đồng mua thuốc Quý 4/2025",
    distributor: "Công ty TNHH Phân phối DCP",
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    totalValue: 720_000_000,
    usedValue: 720_000_000,
    status: "expired",
    items: [
      { id: "i5", name: "Amoxicillin 500mg", unit: "Viên", contractedQty: 4000, deliveredQty: 4000, unitPrice: 2_600 },
      { id: "i6", name: "Paracetamol 500mg", unit: "Viên", contractedQty: 6000, deliveredQty: 6000, unitPrice: 780 },
      { id: "i7", name: "Cetirizine 10mg",   unit: "Viên", contractedQty: 2000, deliveredQty: 2000, unitPrice: 3_100 },
    ],
  },
];

function fmtVND(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ ₫`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} triệu ₫`;
  return v.toLocaleString("vi-VN") + " ₫";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "primary" | "success" | "warning" | "danger" }> = {
  active:  { label: "Đang hoạt động", color: "success" },
  expired: { label: "Đã hết hạn",     color: "default" },
  pending: { label: "Chờ hiệu lực",   color: "warning" },
};

function ContractCard({ contract }: { contract: Contract }) {
  const usedPct = pct(contract.usedValue, contract.totalValue);
  const cfg = STATUS_CONFIG[contract.status];
  const isActive = contract.status === "active";

  return (
    <Card className={`border-2 ${isActive ? "border-[#024430]/30" : "border-[#E4EAE7]"}`}>
      <CardHeader className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-[#10231C] text-base">{contract.name}</p>
            <Chip color={cfg.color} variant="flat" size="sm">{cfg.label}</Chip>
          </div>
          <p className="text-xs text-[#6B7A73]">{contract.code}</p>
          <p className="text-xs text-[#6B7A73] mt-0.5">
            Nhà phân phối: <span className="font-medium text-[#10231C]">{contract.distributor}</span>
          </p>
          <p className="text-xs text-[#6B7A73] mt-0.5">
            Hiệu lực: {fmtDate(contract.startDate)} → {fmtDate(contract.endDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[#024430]">{fmtVND(contract.totalValue)}</p>
          <p className="text-xs text-[#6B7A73]">Tổng giá trị hợp đồng</p>
          <p className="text-xs text-[#6B7A73] mt-0.5">
            Đã sử dụng: <span className="font-semibold text-[#10231C]">{fmtVND(contract.usedValue)}</span>
          </p>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        {/* Overall progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#6B7A73]">Tổng tiến độ thực hiện</span>
            <span className="font-semibold text-[#024430]">{usedPct}%</span>
          </div>
          <Progress value={usedPct} />
        </div>

        {/* Per-item progress */}
        <div className="border border-[#E4EAE7] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F6F8F7]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7A73]">Mặt hàng</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B7A73]">Hợp đồng</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B7A73]">Đã giao</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7A73] w-32">Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {contract.items.map((item) => {
                const itemPct = pct(item.deliveredQty, item.contractedQty);
                const isLow = itemPct >= 70 && itemPct < 90;
                const isFull = itemPct >= 90;
                return (
                  <tr key={item.id} className="border-t border-[#E4EAE7]">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-[#10231C] text-sm">{item.name}</p>
                      <p className="text-xs text-[#6B7A73]">{fmtVND(item.unitPrice)} / {item.unit}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-[#10231C]">
                      {item.contractedQty.toLocaleString("vi-VN")} {item.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-[#024430]">
                      {item.deliveredQty.toLocaleString("vi-VN")} {item.unit}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#E4EAE7] rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${
                              isFull ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-[#024430]"
                            }`}
                            style={{ width: `${Math.min(100, itemPct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#6B7A73] w-8 text-right">{itemPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {isActive && (
            <Link href="/pharmacy/orders/new">
              <span className="inline-flex items-center px-4 py-2 bg-[#024430] text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-[#056246]">
                Đặt hàng theo HĐ
              </span>
            </Link>
          )}
          <button
            type="button"
            className="px-4 py-2 border border-[#E4EAE7] text-sm font-medium text-[#10231C] rounded-xl hover:bg-[#F6F8F7]"
          >
            Xem chi tiết
          </button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function PharmacyContractsPage() {
  const activeContracts = MOCK_CONTRACTS.filter((c) => c.status === "active");
  const otherContracts = MOCK_CONTRACTS.filter((c) => c.status !== "active");

  return (
    <div>
      <PageHeader
        title="Hợp đồng của tôi"
        subtitle="Quản lý các hợp đồng mua thuốc với nhà phân phối"
      />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E4EAE7] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#024430]">{MOCK_CONTRACTS.length}</p>
          <p className="text-xs text-[#6B7A73] mt-1">Tổng hợp đồng</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{activeContracts.length}</p>
          <p className="text-xs text-[#6B7A73] mt-1">Đang hoạt động</p>
        </div>
        <div className="bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#6B7A73]">{otherContracts.length}</p>
          <p className="text-xs text-[#6B7A73] mt-1">Đã hết hạn</p>
        </div>
      </div>

      {/* Active contracts */}
      {activeContracts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">
            Đang hoạt động ({activeContracts.length})
          </h2>
          <div className="flex flex-col gap-4">
            {activeContracts.map((c) => (
              <ContractCard key={c.id} contract={c} />
            ))}
          </div>
        </div>
      )}

      {/* Other contracts */}
      {otherContracts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">
            Đã hết hạn ({otherContracts.length})
          </h2>
          <div className="flex flex-col gap-4">
            {otherContracts.map((c) => (
              <ContractCard key={c.id} contract={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
