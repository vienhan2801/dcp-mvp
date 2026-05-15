"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Chip } from "@/components/ui";
import { BarChart, DonutChart } from "@/components/Charts";
import { fmtVND } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface ContractRow {
  id: string;
  customer: string;
  drug: string;
  unit: string;
  quota: number;
  ordered: number;
  remaining: number;
}

const CONTRACTS: ContractRow[] = [
  {
    id: "CT-BV-001",
    customer: "BV Chợ Rẫy",
    drug: "Paracetamol 500mg",
    unit: "viên",
    quota: 120000,
    ordered: 45000,
    remaining: 75000,
  },
  {
    id: "CT-BV-002",
    customer: "BV Đại học Y Dược",
    drug: "Amoxicillin 500mg",
    unit: "viên",
    quota: 60000,
    ordered: 22000,
    remaining: 38000,
  },
  {
    id: "CT-NT-003",
    customer: "Nhà thuốc Phúc Khang",
    drug: "Paracetamol 500mg",
    unit: "viên",
    quota: 36000,
    ordered: 8000,
    remaining: 28000,
  },
  {
    id: "CT-NT-004",
    customer: "Nhà thuốc An Khang",
    drug: "Azithromycin 500mg",
    unit: "viên",
    quota: 24000,
    ordered: 9500,
    remaining: 14500,
  },
  {
    id: "CT-KH-005",
    customer: "Bệnh viện Tân Phú",
    drug: "Ceftriaxone 1g",
    unit: "lọ",
    quota: 12000,
    ordered: 3200,
    remaining: 8800,
  },
];

const MONTHLY_HISTORY: Record<string, number[]> = {
  "Paracetamol 500mg": [8200, 9100, 10500, 11200, 13500],
  "Amoxicillin 500mg": [3500, 4200, 4800, 5100, 5500],
  "Azithromycin 500mg": [1800, 2100, 2300, 2500, 2700],
};

const MONTHS = ["T1", "T2", "T3", "T4", "T5"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usagePct(ordered: number, quota: number): number {
  if (!quota) return 0;
  return Math.round((ordered / quota) * 100);
}

function contractStatus(remaining: number, quota: number): "normal" | "warning" | "danger" {
  const pct = remaining / quota;
  if (pct <= 0) return "danger";
  if (pct < 0.3) return "warning";
  return "normal";
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

function momPct(history: number[]): number {
  if (history.length < 2) return 0;
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  if (!prev) return 0;
  return Math.round(((last - prev) / prev) * 100);
}

// ─── Group by drug ────────────────────────────────────────────────────────────

interface DrugGroup {
  drug: string;
  contracts: number;
  totalQuota: number;
  totalOrdered: number;
  totalRemaining: number;
  unit: string;
}

function groupByDrug(contracts: ContractRow[]): DrugGroup[] {
  const map = new Map<string, DrugGroup>();
  for (const c of contracts) {
    const existing = map.get(c.drug);
    if (existing) {
      existing.contracts += 1;
      existing.totalQuota += c.quota;
      existing.totalOrdered += c.ordered;
      existing.totalRemaining += c.remaining;
    } else {
      map.set(c.drug, {
        drug: c.drug,
        contracts: 1,
        totalQuota: c.quota,
        totalOrdered: c.ordered,
        totalRemaining: c.remaining,
        unit: c.unit,
      });
    }
  }
  return Array.from(map.values());
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabKey = "contracts" | "products" | "trend";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChipLocal({ status }: { status: "normal" | "warning" | "danger" }) {
  if (status === "normal") {
    return (
      <Chip color="success" variant="flat" size="sm">
        Bình thường
      </Chip>
    );
  }
  if (status === "warning") {
    return (
      <Chip color="warning" variant="flat" size="sm">
        Gần hết
      </Chip>
    );
  }
  return (
    <Chip color="danger" variant="flat" size="sm">
      Hết hạn mức
    </Chip>
  );
}

// ─── Tab 1: Theo hợp đồng ────────────────────────────────────────────────────

function TabContracts() {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse border border-[#E4EAE7] rounded-xl">
        <thead>
          <tr className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
            {[
              "Hợp đồng",
              "Khách hàng",
              "Sản phẩm",
              "Hạn mức",
              "Đã đặt",
              "Còn lại",
              "% Sử dụng",
              "Trạng thái",
            ].map((col) => (
              <th
                key={col}
                className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73] whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CONTRACTS.map((c) => {
            const pct = usagePct(c.ordered, c.quota);
            const st = contractStatus(c.remaining, c.quota);
            return (
              <tr
                key={c.id}
                className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors"
              >
                <td className="px-3 py-3 text-sm font-mono font-semibold text-[#024430] whitespace-nowrap">
                  {c.id}
                </td>
                <td className="px-3 py-3 text-sm text-[#10231C] whitespace-nowrap">
                  {c.customer}
                </td>
                <td className="px-3 py-3 text-sm text-[#10231C] whitespace-nowrap">{c.drug}</td>
                <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                  {fmtNum(c.quota)} {c.unit}
                </td>
                <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                  {fmtNum(c.ordered)}
                </td>
                <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                  {fmtNum(c.remaining)}
                </td>
                <td className="px-3 py-3 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#E4EAE7] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          st === "danger"
                            ? "bg-red-500"
                            : st === "warning"
                            ? "bg-amber-400"
                            : "bg-[#024430]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#10231C] w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <StatusChipLocal status={st} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab 2: Theo sản phẩm ────────────────────────────────────────────────────

function TabProducts() {
  const groups = groupByDrug(CONTRACTS);
  // Donut for Paracetamol
  const para = groups.find((g) => g.drug === "Paracetamol 500mg");

  return (
    <div className="mt-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse border border-[#E4EAE7] rounded-xl">
          <thead>
            <tr className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
              {[
                "Sản phẩm",
                "Số HĐ",
                "Tổng hạn mức",
                "Tổng đã đặt",
                "Tổng còn lại",
                "Khuyến nghị SX",
              ].map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const rec = g.totalRemaining > 50000 ? "Lên kế hoạch SX" : "Đủ tồn kho";
              return (
                <tr
                  key={g.drug}
                  className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors"
                >
                  <td className="px-3 py-3 text-sm font-medium text-[#10231C] whitespace-nowrap">
                    {g.drug}
                  </td>
                  <td className="px-3 py-3 text-sm text-[#10231C] text-center">{g.contracts}</td>
                  <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                    {fmtNum(g.totalQuota)} {g.unit}
                  </td>
                  <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                    {fmtNum(g.totalOrdered)}
                  </td>
                  <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                    {fmtNum(g.totalRemaining)}
                  </td>
                  <td className="px-3 py-3">
                    <Chip
                      color={rec === "Lên kế hoạch SX" ? "primary" : "success"}
                      variant="flat"
                      size="sm"
                    >
                      {rec}
                    </Chip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Donut chart for Paracetamol */}
      {para && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-[#10231C] pb-2">
              Paracetamol 500mg — Tỷ lệ sử dụng hạn mức
            </p>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center gap-8">
              <DonutChart
                value={para.totalOrdered}
                max={para.totalQuota}
                label={`${usagePct(para.totalOrdered, para.totalQuota)}%`}
                sublabel="đã đặt"
                color="#024430"
                size={140}
                thickness={14}
                showPercent={false}
              />
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#6B7A73]">Tổng hạn mức</p>
                  <p className="text-lg font-bold text-[#10231C]">
                    {fmtNum(para.totalQuota)} viên/năm
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Đã đặt</p>
                  <p className="text-base font-semibold text-[#024430]">
                    {fmtNum(para.totalOrdered)} viên
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Còn lại</p>
                  <p className="text-base font-semibold text-[#10231C]">
                    {fmtNum(para.totalRemaining)} viên
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ─── Tab 3: Xu hướng ─────────────────────────────────────────────────────────

function TabTrend() {
  const drugs = Object.entries(MONTHLY_HISTORY);
  const colors = ["#024430", "#3B82F6", "#D97706"];

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {drugs.map(([drug, history], idx) => (
          <Card key={drug}>
            <CardHeader>
              <p className="text-sm font-semibold text-[#10231C] pb-2 truncate">{drug}</p>
            </CardHeader>
            <CardBody className="pt-0">
              <BarChart
                data={history.map((v, i) => ({
                  label: MONTHS[i],
                  value: v,
                  color: colors[idx],
                }))}
                height={160}
                color={colors[idx]}
                formatValue={(v) => `${(v / 1000).toFixed(1)}k`}
              />
            </CardBody>
          </Card>
        ))}
      </div>

      {/* MoM growth table */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-[#10231C] pb-2">
            Tốc độ tăng trưởng tháng (MoM %)
          </p>
        </CardHeader>
        <CardBody className="pt-0 overflow-x-auto">
          <table className="w-full border-collapse border border-[#E4EAE7] rounded-xl min-w-[480px]">
            <thead>
              <tr className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">
                  Sản phẩm
                </th>
                {MONTHS.slice(1).map((m, i) => (
                  <th
                    key={m}
                    className="text-right px-3 py-2.5 text-xs font-semibold text-[#6B7A73] whitespace-nowrap"
                  >
                    {m} vs {MONTHS[i]}
                  </th>
                ))}
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-[#6B7A73] whitespace-nowrap">
                  MoM tháng gần nhất
                </th>
              </tr>
            </thead>
            <tbody>
              {drugs.map(([drug, history]) => {
                const momValues = history.slice(1).map((v, i) => {
                  const prev = history[i];
                  if (!prev) return 0;
                  return Math.round(((v - prev) / prev) * 100);
                });
                const lastMom = momPct(history);
                return (
                  <tr
                    key={drug}
                    className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors"
                  >
                    <td className="px-3 py-3 text-sm font-medium text-[#10231C] whitespace-nowrap">
                      {drug}
                    </td>
                    {momValues.map((m, i) => (
                      <td
                        key={i}
                        className={`px-3 py-3 text-sm text-right font-semibold whitespace-nowrap ${
                          m > 0 ? "text-green-600" : m < 0 ? "text-red-600" : "text-[#6B7A73]"
                        }`}
                      >
                        {m > 0 ? "+" : ""}
                        {m}%
                      </td>
                    ))}
                    <td
                      className={`px-3 py-3 text-sm text-right font-bold whitespace-nowrap ${
                        lastMom > 0
                          ? "text-green-600"
                          : lastMom < 0
                          ? "text-red-600"
                          : "text-[#6B7A73]"
                      }`}
                    >
                      {lastMom > 0 ? "+" : ""}
                      {lastMom}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "contracts", label: "Theo hợp đồng" },
  { key: "products", label: "Theo sản phẩm" },
  { key: "trend", label: "Xu hướng" },
];

export default function SupplierAggregationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("contracts");

  return (
    <div className="bg-[#F6F8F7] min-h-screen -m-6 p-6">
      <PageHeader
        title="Tổng hợp nhu cầu"
        subtitle="Phân tích nhu cầu đặt hàng theo hợp đồng"
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Tổng hợp đồng hoạt động
            </p>
            <p className="text-2xl font-bold text-[#024430]">5</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">hợp đồng</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Tổng giá trị đặt hàng tháng này
            </p>
            <p className="text-2xl font-bold text-[#10231C]">187,5 tr</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">₫ trong tháng</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Mức sử dụng hạn mức TB
            </p>
            <p className="text-2xl font-bold text-[#024430]">34%</p>
            <div className="mt-2 h-1.5 bg-[#E4EAE7] rounded-full overflow-hidden">
              <div className="h-full bg-[#024430] rounded-full" style={{ width: "34%" }} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Khách hàng có đơn tháng này
            </p>
            <p className="text-2xl font-bold text-[#10231C]">4</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">/ 5 khách hàng</p>
          </CardBody>
        </Card>
      </div>

      {/* Tab navigation */}
      <Card>
        <CardBody>
          {/* Tab strip */}
          <div className="flex gap-1 bg-[#F6F8F7] p-1 rounded-xl w-fit mb-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-[#024430] text-white shadow-sm"
                    : "text-[#6B7A73] hover:text-[#10231C] hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "contracts" && <TabContracts />}
          {activeTab === "products" && <TabProducts />}
          {activeTab === "trend" && <TabTrend />}
        </CardBody>
      </Card>
    </div>
  );
}
