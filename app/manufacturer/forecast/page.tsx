"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { BarChart } from "@/components/Charts";

// ── Existing Data Constants ───────────────────────────────────
const PRODUCTS = [
  { name: "Amoxicillin 500mg",  monthlyAvg: 8_500,  stock: 36_000, unitPrice: 1_200, unit: "Viên" },
  { name: "Paracetamol 500mg",  monthlyAvg: 22_000, stock: 90_000, unitPrice: 800,   unit: "Viên" },
  { name: "Ceftriaxone 1g",     monthlyAvg: 1_200,  stock: 1_500,  unitPrice: 45_000, unit: "Lọ" },
  { name: "Azithromycin 500mg", monthlyAvg: 4_800,  stock: 20_000, unitPrice: 3_500, unit: "Viên" },
  { name: "Omeprazole 20mg",    monthlyAvg: 6_200,  stock:   200,  unitPrice: 2_800, unit: "Viên" },
];

const MONTHLY = [
  { label: "T1", values: [7800, 20000, 1100, 4200, 5800] },
  { label: "T2", values: [8200, 21500, 1050, 4900, 6100] },
  { label: "T3", values: [9100, 23000, 1300, 5200, 6400] },
  { label: "T4", values: [8800, 22500, 1200, 4600, 6200] },
  { label: "T5", values: [8500, 22000, 1200, 4800, 6200] },
];

// Forecast months T6, T7 (distinct accent color via per-bar color)
const FORECAST = [
  { label: "T6", values: [9200, 23500, 1280, 5100, 6500] },
  { label: "T7", values: [9500, 24000, 1350, 5300, 6700] },
];

// ── Production Schedule ────────────────────────────────────────
type RunStatus = "completed" | "running" | "planned";

interface ProductionRun {
  product: string;
  batchSize: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: RunStatus;
}

const PRODUCTION_RUNS: ProductionRun[] = [
  { product: "Amoxicillin 500mg",  batchSize: 50000, unit: "Viên", startDate: "2026-04-01", endDate: "2026-04-12", status: "completed" },
  { product: "Paracetamol 500mg",  batchSize: 120000, unit: "Viên", startDate: "2026-04-08", endDate: "2026-04-18", status: "completed" },
  { product: "Omeprazole 20mg",    batchSize: 30000, unit: "Viên", startDate: "2026-05-05", endDate: "2026-05-18", status: "running"   },
  { product: "Ceftriaxone 1g",     batchSize: 5000,  unit: "Lọ",   startDate: "2026-05-10", endDate: "2026-05-28", status: "running"   },
  { product: "Azithromycin 500mg", batchSize: 25000, unit: "Viên", startDate: "2026-06-01", endDate: "2026-06-14", status: "planned"   },
  { product: "Paracetamol 500mg",  batchSize: 100000, unit: "Viên", startDate: "2026-06-10", endDate: "2026-06-22", status: "planned"   },
];

const RUN_STATUS_CFG: Record<RunStatus, { label: string; cls: string }> = {
  completed: { label: "Hoàn thành",   cls: "bg-emerald-100 text-emerald-700" },
  running:   { label: "Đang SX",      cls: "bg-blue-100 text-blue-700"       },
  planned:   { label: "Lên kế hoạch", cls: "bg-amber-100 text-amber-700"     },
};

// ── Stock Health ───────────────────────────────────────────────
type StockStatus = "ok" | "low" | "critical";

interface StockHealth {
  product: string;
  unit: string;
  currentStock: number;
  monthlyAvg: number;
  reorderPoint: number;
}

const STOCK_HEALTH: StockHealth[] = PRODUCTS.map((p) => ({
  product: p.name,
  unit: p.unit,
  currentStock: p.stock,
  monthlyAvg: p.monthlyAvg,
  reorderPoint: p.monthlyAvg * 2,
}));

function getStockStatus(h: StockHealth): StockStatus {
  const months = h.monthlyAvg > 0 ? h.currentStock / h.monthlyAvg : 99;
  if (months < 1) return "critical";
  if (months < 3) return "low";
  return "ok";
}

const STOCK_STATUS_CFG: Record<StockStatus, { label: string; bg: string; border: string; badge: string; text: string }> = {
  ok:       { label: "Ổn định",       bg: "bg-emerald-50",  border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", text: "text-emerald-700" },
  low:      { label: "Sắp hết",       bg: "bg-amber-50",    border: "border-amber-200",   badge: "bg-amber-100 text-amber-700",     text: "text-amber-700"  },
  critical: { label: "Cần đặt hàng",  bg: "bg-red-50",      border: "border-red-200",     badge: "bg-red-100 text-red-700",         text: "text-red-700"    },
};

// ── Helpers ────────────────────────────────────────────────────
function fmtNum(n: number) { return n.toLocaleString("vi-VN"); }

// Build BarChart data for a product (historical + forecast with different colors)
function buildChartData(productIdx: number) {
  const histColor = "#6D28D9";
  const foreColor = "#A78BFA";
  const hist = MONTHLY.map((m) => ({ label: m.label, value: m.values[productIdx], color: histColor }));
  const fore = FORECAST.map((m) => ({ label: m.label, value: m.values[productIdx], color: foreColor, sublabel: "Dự báo" }));
  return [...hist, ...fore];
}

// ── Tab types ─────────────────────────────────────────────────
type Tab = "forecast" | "schedule" | "alerts";

export default function ManufacturerForecastPage() {
  const [activeTab, setActiveTab] = useState<Tab>("forecast");

  const tabs: { key: Tab; label: string }[] = [
    { key: "forecast", label: "Dự báo nhu cầu" },
    { key: "schedule", label: "Lịch SX" },
    { key: "alerts",   label: "Cảnh báo tồn kho" },
  ];

  return (
    <div>
      <PageHeader
        title="Dự báo & Kế hoạch SX"
        subtitle="Phân tích nhu cầu và lập lịch sản xuất"
      />

      {/* Alert banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-semibold text-amber-800 text-sm">2 sản phẩm cần bổ sung sản lượng khẩn cấp</p>
          <p className="text-xs text-amber-700 mt-0.5">Ceftriaxone 1g và Omeprazole 20mg dự kiến hết hàng trong &lt; 2 tháng tới</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#6D28D9] text-white shadow-sm"
                : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Forecast ─────────────────────────────────── */}
      {activeTab === "forecast" && (
        <div>
          {/* Per-product charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {PRODUCTS.map((p, idx) => {
              const chartData = buildChartData(idx);
              const nextMonthForecast = FORECAST[0].values[idx];
              const needed = Math.max(0, nextMonthForecast * 3 - p.stock);
              return (
                <Card key={p.name}>
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[#10231C] text-sm">{p.name}</h4>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#6D28D9] inline-block" />
                          Lịch sử
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#A78BFA] inline-block" />
                          Dự báo
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-1">
                    <BarChart
                      data={chartData}
                      height={130}
                      formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                    />
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Summary table */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-[#10231C]">Tóm tắt dự báo</h3>
            </CardHeader>
            <CardBody className="pt-0 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F6F8F7]">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Sản phẩm</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">TB/tháng</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Tháng tới (dự báo)</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Cần SX thêm</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p, idx) => {
                    const nextMonthForecast = FORECAST[0].values[idx];
                    const needed = Math.max(0, nextMonthForecast * 3 - p.stock);
                    const monthsLeft = p.monthlyAvg > 0 ? Math.floor(p.stock / p.monthlyAvg) : 99;
                    const urgency = monthsLeft <= 1 ? "critical" : monthsLeft <= 3 ? "low" : "ok";
                    const cfg = STOCK_STATUS_CFG[urgency];
                    return (
                      <tr key={p.name} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                        <td className="px-3 py-2.5 text-sm font-medium text-[#10231C]">{p.name}</td>
                        <td className="px-3 py-2.5 text-sm text-[#6B7A73]">{fmtNum(p.monthlyAvg)} {p.unit}</td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-[#6D28D9]">{fmtNum(nextMonthForecast)} {p.unit}</td>
                        <td className="px-3 py-2.5 text-sm">
                          {needed > 0
                            ? <span className="font-semibold text-amber-700">{fmtNum(needed)} {p.unit}</span>
                            : <span className="text-emerald-700 font-medium">—</span>
                          }
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── Tab 2: Production Schedule ──────────────────────── */}
      {activeTab === "schedule" && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-[#10231C]">Lịch sản xuất</h3>
            <p className="text-xs text-[#6B7A73] mt-0.5">6 batch hiện tại và kế hoạch</p>
          </CardHeader>
          <CardBody className="pt-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F6F8F7]">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Sản phẩm</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Batch size</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Ngày bắt đầu</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Ngày hoàn thành</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTION_RUNS.map((run, i) => {
                  const sc = RUN_STATUS_CFG[run.status];
                  return (
                    <tr key={i} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                      <td className="px-3 py-3 text-sm font-medium text-[#10231C]">{run.product}</td>
                      <td className="px-3 py-3 text-sm text-[#6B7A73]">{fmtNum(run.batchSize)} {run.unit}</td>
                      <td className="px-3 py-3 text-sm text-[#6B7A73]">{run.startDate}</td>
                      <td className="px-3 py-3 text-sm text-[#6B7A73]">{run.endDate}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* ── Tab 3: Stock Alerts ──────────────────────────────── */}
      {activeTab === "alerts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STOCK_HEALTH.map((h) => {
            const statusKey = getStockStatus(h);
            const cfg = STOCK_STATUS_CFG[statusKey];
            const monthsLeft = h.monthlyAvg > 0 ? (h.currentStock / h.monthlyAvg).toFixed(1) : "∞";
            const pct = Math.min(100, h.monthlyAvg > 0 ? (h.currentStock / (h.reorderPoint * 2)) * 100 : 100);
            return (
              <Card key={h.product} className={`border ${cfg.border} ${cfg.bg}`}>
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-[#10231C] text-sm pr-2">{h.product}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {/* Stock bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-white rounded-full border border-[#E4EAE7] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          statusKey === "ok" ? "bg-emerald-500" : statusKey === "low" ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-base font-bold text-[#10231C]">{fmtNum(h.currentStock)}</p>
                      <p className="text-[10px] text-[#6B7A73]">Tồn kho ({h.unit})</p>
                    </div>
                    <div>
                      <p className={`text-base font-bold ${cfg.text}`}>{monthsLeft} tháng</p>
                      <p className="text-[10px] text-[#6B7A73]">Đủ dùng</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#6B7A73]">{fmtNum(h.monthlyAvg)}</p>
                      <p className="text-[10px] text-[#6B7A73]">TB/tháng</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#6B7A73]">{fmtNum(h.reorderPoint)}</p>
                      <p className="text-[10px] text-[#6B7A73]">Điểm đặt hàng</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
