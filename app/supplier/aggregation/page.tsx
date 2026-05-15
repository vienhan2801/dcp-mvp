"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip, Button, Progress } from "@/components/ui";
import { DonutChart, BarChart, LineChart, PieChart } from "@/components/Charts";
import { fmtNum, fmtDate } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHS = ["Th12", "Th1", "Th2", "Th3", "Th4", "Th5"];
const INBOUND = [420000, 380000, 450000, 510000, 390000, 480000];
const OUTBOUND = [395000, 410000, 430000, 488000, 405000, 460000];

interface ForecastItem {
  drug: string;
  currentStock: number;
  avgMonthlyDemand: number;
  forecastJun: number;
  forecastJul: number;
  forecastAug: number;
  confidence: number;
  stockoutRisk: "high" | "medium" | "low" | "safe";
  recommendedOrderQty: number;
  recommendedOrderDate: string;
  trend: "up" | "down" | "stable";
  trendPct: number;
}

const FORECAST_DATA: ForecastItem[] = [
  {
    drug: "Paracetamol 500mg",
    currentStock: 45000,
    avgMonthlyDemand: 38000,
    forecastJun: 41000,
    forecastJul: 43500,
    forecastAug: 40000,
    confidence: 94,
    stockoutRisk: "safe",
    recommendedOrderQty: 80000,
    recommendedOrderDate: "2026-07-15",
    trend: "up",
    trendPct: 8,
  },
  {
    drug: "Amoxicillin 500mg",
    currentStock: 8500,
    avgMonthlyDemand: 12000,
    forecastJun: 13500,
    forecastJul: 14000,
    forecastAug: 13000,
    confidence: 88,
    stockoutRisk: "high",
    recommendedOrderQty: 25000,
    recommendedOrderDate: "2026-06-05",
    trend: "up",
    trendPct: 12,
  },
  {
    drug: "Omeprazole 20mg",
    currentStock: 22000,
    avgMonthlyDemand: 9000,
    forecastJun: 9500,
    forecastJul: 9200,
    forecastAug: 8800,
    confidence: 91,
    stockoutRisk: "safe",
    recommendedOrderQty: 20000,
    recommendedOrderDate: "2026-08-01",
    trend: "stable",
    trendPct: 0,
  },
  {
    drug: "Vitamin C 1000mg",
    currentStock: 31000,
    avgMonthlyDemand: 11000,
    forecastJun: 14000,
    forecastJul: 18000,
    forecastAug: 15000,
    confidence: 82,
    stockoutRisk: "low",
    recommendedOrderQty: 30000,
    recommendedOrderDate: "2026-07-20",
    trend: "up",
    trendPct: 27,
  },
  {
    drug: "Azithromycin 250mg",
    currentStock: 3200,
    avgMonthlyDemand: 5500,
    forecastJun: 6000,
    forecastJul: 5800,
    forecastAug: 5200,
    confidence: 85,
    stockoutRisk: "high",
    recommendedOrderQty: 15000,
    recommendedOrderDate: "2026-06-01",
    trend: "stable",
    trendPct: 0,
  },
  {
    drug: "Metronidazole 250mg",
    currentStock: 18000,
    avgMonthlyDemand: 7000,
    forecastJun: 7200,
    forecastJul: 7500,
    forecastAug: 6800,
    confidence: 90,
    stockoutRisk: "safe",
    recommendedOrderQty: 20000,
    recommendedOrderDate: "2026-08-10",
    trend: "stable",
    trendPct: 0,
  },
  {
    drug: "Dexamethasone 0.5mg",
    currentStock: 0,
    avgMonthlyDemand: 3000,
    forecastJun: 3200,
    forecastJul: 3100,
    forecastAug: 2900,
    confidence: 87,
    stockoutRisk: "high",
    recommendedOrderQty: 10000,
    recommendedOrderDate: "2026-06-01",
    trend: "down",
    trendPct: -5,
  },
  {
    drug: "Cefuroxime 500mg",
    currentStock: 12000,
    avgMonthlyDemand: 6000,
    forecastJun: 6500,
    forecastJul: 7000,
    forecastAug: 6200,
    confidence: 86,
    stockoutRisk: "low",
    recommendedOrderQty: 15000,
    recommendedOrderDate: "2026-07-05",
    trend: "up",
    trendPct: 10,
  },
];

interface NCCSupply {
  nccName: string;
  drugs: string[];
  pendingQty: number;
  expectedDate: string;
  status: "on_time" | "delayed" | "early";
  reliability: number;
}

const NCC_SUPPLY: NCCSupply[] = [
  {
    nccName: "PhytoPharma Manufacturing",
    drugs: ["Paracetamol 500mg", "Amoxicillin 500mg", "Vitamin C 1000mg"],
    pendingQty: 80000,
    expectedDate: "2026-06-08",
    status: "on_time",
    reliability: 96,
  },
  {
    nccName: "MedPharm Co.",
    drugs: ["Omeprazole 20mg", "Metronidazole 250mg", "Dexamethasone 0.5mg"],
    pendingQty: 45000,
    expectedDate: "2026-06-15",
    status: "delayed",
    reliability: 78,
  },
  {
    nccName: "VietPharma",
    drugs: ["Azithromycin 250mg", "Ciprofloxacin 500mg", "Cefuroxime 500mg"],
    pendingQty: 30000,
    expectedDate: "2026-06-12",
    status: "on_time",
    reliability: 91,
  },
];

// Drug demand breakdown (BV + NT)
const DRUG_DEMAND = [
  { drug: "Paracetamol 500mg", bv: 175000, nt: 110000 },
  { drug: "Amoxicillin 500mg", bv: 82000, nt: 48000 },
  { drug: "Vitamin C 1000mg", bv: 54000, nt: 36000 },
  { drug: "Omeprazole 20mg", bv: 58000, nt: 32000 },
  { drug: "Cefuroxime 500mg", bv: 46000, nt: 24000 },
  { drug: "Metronidazole 250mg", bv: 40000, nt: 20000 },
  { drug: "Azithromycin 250mg", bv: 38000, nt: 18000 },
  { drug: "Dexamethasone 0.5mg", bv: 22000, nt: 12000 },
];

// Stockout prediction: days of stock remaining
function daysOfStock(item: ForecastItem): number {
  if (item.currentStock <= 0) return 0;
  const dailyDemand = item.avgMonthlyDemand / 30;
  return Math.floor(item.currentStock / dailyDemand);
}

function stockoutDate(item: ForecastItem): string {
  const days = daysOfStock(item);
  if (days > 90) return ">3 tháng";
  const d = new Date("2026-05-07");
  d.setDate(d.getDate() + days);
  return fmtDate(d.toISOString().split("T")[0]);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: ForecastItem["stockoutRisk"] }) {
  const map = {
    high: "bg-red-100 text-red-700 border border-red-200",
    medium: "bg-amber-100 text-amber-700 border border-amber-200",
    low: "bg-blue-100 text-blue-700 border border-blue-200",
    safe: "bg-green-100 text-green-700 border border-green-200",
  };
  const label = {
    high: "⚠ Cao",
    medium: "Trung bình",
    low: "Thấp",
    safe: "✓ An toàn",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${map[risk]}`}>
      {label[risk]}
    </span>
  );
}

function TrendBadge({ trend, pct }: { trend: ForecastItem["trend"]; pct: number }) {
  if (trend === "up") {
    return (
      <span className="text-green-600 font-semibold text-xs whitespace-nowrap">
        ↑ +{pct}%
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="text-red-500 font-semibold text-xs whitespace-nowrap">
        ↓ {pct}%
      </span>
    );
  }
  return <span className="text-[#6B7A73] font-semibold text-xs">→ Ổn định</span>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ForecastTab = "all" | "high" | "order";

export default function SupplierAggregationPage() {
  const [forecastTab, setForecastTab] = useState<ForecastTab>("all");

  const filteredForecast = FORECAST_DATA.filter((item) => {
    if (forecastTab === "high") return item.stockoutRisk === "high";
    if (forecastTab === "order") return item.recommendedOrderDate <= "2026-07-01";
    return true;
  });

  // Line chart data — two series interleaved as two separate datasets
  const inboundLine = MONTHS.map((label, i) => ({ label, value: INBOUND[i] }));
  const outboundLine = MONTHS.map((label, i) => ({ label, value: OUTBOUND[i] }));

  // Bar chart data for top drugs
  const barData = DRUG_DEMAND.map((d, i) => {
    const total = d.bv + d.nt;
    const color =
      i < 2 ? "#024430" : i < 6 ? "#D97706" : "#3B82F6";
    return { label: d.drug.split(" ")[0], value: total, color };
  });

  // Pie chart slices
  const pieSlices = [
    { label: "Bệnh viện (BV)", value: 285000, color: "#024430" },
    { label: "Nhà thuốc (NT)", value: 175000, color: "#34D399" },
  ];

  const tabs: { key: ForecastTab; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "high", label: "Rủi ro cao" },
    { key: "order", label: "Cần đặt hàng" },
  ];

  return (
    <div className="bg-[#F6F8F7] min-h-screen -m-6 p-6">
      <PageHeader
        title="DMS Forecasting & Analytics"
        subtitle="PhytoPharma NPP · Trung tâm phân tích dự báo nhu cầu AI · Cập nhật: 07/05/2026"
        actions={
          <span className="bg-gradient-to-r from-[#024430] to-[#0a6e54] text-white px-3 py-1 rounded-full text-xs font-semibold">
            🤖 AI DCP v2.4
          </span>
        }
      />

      {/* ── Section 1: Hero KPI strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Row 1 */}
        <Card className="border border-[#BBF7D0] bg-white">
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Tổng lưu thông tháng này
            </p>
            <p className="text-2xl font-bold text-[#024430]">460,000</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">đơn vị xuất kho</p>
            <span className="inline-block mt-2 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
              ↑ 13.6% so tháng trước
            </span>
          </CardBody>
        </Card>

        <Card className="border border-[#E4EAE7] bg-white">
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Giá trị hàng trong kho
            </p>
            <p className="text-2xl font-bold text-[#10231C]">8,4 tỷ</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">₫ tồn kho hiện tại</p>
            <span className="inline-block mt-2 text-xs text-[#6B7A73] bg-[#F6F8F7] px-2 py-0.5 rounded-full">
              Cập nhật hôm nay
            </span>
          </CardBody>
        </Card>

        <Card className="border border-[#E4EAE7] bg-white">
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Tỷ lệ phục vụ
            </p>
            <p className="text-2xl font-bold text-[#024430]">97,2%</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">đơn hàng đáp ứng đúng hạn</p>
            <div className="mt-2">
              <Progress value={97.2} size="sm" classNames={{ indicator: "bg-[#024430]" }} />
            </div>
          </CardBody>
        </Card>

        <Card className="border border-[#E4EAE7] bg-white">
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              Khách hàng đang đặt
            </p>
            <p className="text-2xl font-bold text-[#10231C]">40</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">đối tác hoạt động</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-[#024430]/10 text-[#024430] px-2 py-0.5 rounded-full font-medium">
                12 BV
              </span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                28 NT
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-red-100 bg-red-50">
          <CardBody className="p-4">
            <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wide mb-1">
              Mặt hàng cần bổ sung
            </p>
            <p className="text-2xl font-bold text-red-700">3 SKU</p>
            <p className="text-xs text-red-500 mt-0.5">tồn kho dưới ngưỡng an toàn</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">
              ⚡ KHẨN CẤP
            </span>
          </CardBody>
        </Card>

        <Card className="border border-[#E4EAE7] bg-white">
          <CardBody className="p-4">
            <p className="text-[10px] text-[#6B7A73] font-semibold uppercase tracking-wide mb-1">
              AI Độ chính xác dự báo
            </p>
            <p className="text-2xl font-bold text-[#024430]">89,4%</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">trung bình 3 tháng gần nhất</p>
            <div className="mt-2">
              <Progress value={89.4} size="sm" classNames={{ indicator: "bg-[#024430]" }} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Section 2: Luồng hàng hóa ── */}
      <div className="mb-2">
        <p className="text-sm font-bold text-[#10231C] uppercase tracking-wide mb-3">
          Luồng hàng hóa
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Line chart — wider */}
        <Card className="lg:col-span-2 border border-[#E4EAE7]">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#10231C]">Nhập kho vs Xuất kho</p>
              <div className="flex items-center gap-4 text-xs text-[#6B7A73]">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-0.5 bg-[#024430] rounded" />
                  Nhập kho
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-0.5 bg-[#3B82F6] rounded" />
                  Xuất kho
                </span>
              </div>
            </div>
            <div className="relative">
              <LineChart
                data={inboundLine}
                height={200}
                color="#024430"
                formatValue={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <div className="absolute inset-0 pointer-events-none">
                <LineChart
                  data={outboundLine}
                  height={200}
                  color="#3B82F6"
                  fillColor="#3B82F6"
                  formatValue={(v) => `${(v / 1000).toFixed(0)}k`}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#E4EAE7]">
              <div className="text-center">
                <p className="text-[10px] text-[#6B7A73]">Nhập TB/tháng</p>
                <p className="text-sm font-bold text-[#024430]">438k</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[#6B7A73]">Xuất TB/tháng</p>
                <p className="text-sm font-bold text-blue-600">431k</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[#6B7A73]">Tích lũy tồn</p>
                <p className="text-sm font-bold text-[#10231C]">+42k</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pie chart — narrower */}
        <Card className="border border-[#E4EAE7]">
          <CardBody className="p-5">
            <p className="text-sm font-semibold text-[#10231C] mb-4">Cơ cấu khách hàng</p>
            <div className="flex justify-center mb-4">
              <PieChart slices={pieSlices} size={130} />
            </div>
            <div className="space-y-2 pt-3 border-t border-[#E4EAE7]">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7A73]">Bệnh viện</span>
                <span className="font-semibold text-[#024430]">{fmtNum(285000)} đơn vị</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7A73]">Nhà thuốc</span>
                <span className="font-semibold text-blue-600">{fmtNum(175000)} đơn vị</span>
              </div>
              <div className="flex justify-between text-xs border-t border-[#E4EAE7] pt-2">
                <span className="font-medium text-[#10231C]">Tổng</span>
                <span className="font-bold text-[#10231C]">{fmtNum(460000)} đơn vị</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Section 3: AI Forecast ── */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-[#10231C] uppercase tracking-wide">
          Dự báo AI — Nhu cầu 3 tháng tới
        </p>
        <span className="bg-gradient-to-r from-[#024430] to-[#0a6e54] text-white px-3 py-1 rounded-full text-xs font-semibold">
          🤖 Được tính toán bởi DCP AI · Cập nhật hàng tuần
        </span>
      </div>

      <Card className="border border-[#E4EAE7] mb-6">
        <CardBody className="p-5">
          {/* Tab strip */}
          <div className="flex gap-1 mb-4 bg-[#F6F8F7] p-1 rounded-xl w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setForecastTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  forecastTab === t.key
                    ? "bg-[#024430] text-white shadow-sm"
                    : "text-[#6B7A73] hover:text-[#10231C] hover:bg-white"
                }`}
              >
                {t.label}
                {t.key === "high" && (
                  <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    3
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Forecast table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                  {[
                    "Thuốc",
                    "Tồn kho HT",
                    "Dự báo T6",
                    "Dự báo T7",
                    "Dự báo T8",
                    "Xu hướng",
                    "Độ tin cậy",
                    "Rủi ro",
                    "Đề xuất",
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left px-3 py-2.5 text-[11px] font-semibold text-[#6B7A73] uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredForecast.map((item) => (
                  <tr
                    key={item.drug}
                    className={`border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors ${
                      item.stockoutRisk === "high" ? "bg-red-50/40" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-[#10231C] whitespace-nowrap">
                        {item.drug}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p
                        className={`text-sm font-bold whitespace-nowrap ${
                          item.currentStock === 0
                            ? "text-red-600"
                            : item.currentStock < item.avgMonthlyDemand
                            ? "text-amber-600"
                            : "text-[#10231C]"
                        }`}
                      >
                        {item.currentStock === 0 ? (
                          <span className="text-red-600 font-bold">⚠ HẾT HÀNG</span>
                        ) : (
                          fmtNum(item.currentStock)
                        )}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-sm text-[#10231C] whitespace-nowrap">
                      {fmtNum(item.forecastJun)}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#10231C] whitespace-nowrap">
                      {fmtNum(item.forecastJul)}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#10231C] whitespace-nowrap">
                      {fmtNum(item.forecastAug)}
                    </td>
                    <td className="px-3 py-3">
                      <TrendBadge trend={item.trend} pct={item.trendPct} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <DonutChart
                          value={item.confidence}
                          max={100}
                          size={36}
                          thickness={4}
                          color="#024430"
                          showPercent={false}
                        />
                        <span className="text-xs font-semibold text-[#10231C]">
                          {item.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <RiskBadge risk={item.stockoutRisk} />
                    </td>
                    <td className="px-3 py-3">
                      {item.stockoutRisk === "safe" && item.recommendedOrderDate > "2026-07-15" ? (
                        <span className="text-xs text-[#6B7A73]">Đủ hàng</span>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-[#024430] whitespace-nowrap">
                            Đặt {fmtNum(item.recommendedOrderQty)} đơn vị
                          </p>
                          <p className="text-[10px] text-[#6B7A73] whitespace-nowrap">
                            trước {fmtDate(item.recommendedOrderDate)}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI summary */}
          <div className="mt-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-start gap-2">
            <span className="text-base flex-shrink-0">💡</span>
            <p className="text-xs text-[#024430] font-medium">
              AI đề xuất đặt hàng tổng cộng{" "}
              <span className="font-bold">195,000 đơn vị</span> trong tháng 6/2026 · Tiết
              kiệm ước tính <span className="font-bold">12%</span> so với đặt hàng thủ công
            </p>
          </div>
        </CardBody>
      </Card>

      {/* ── Section 4: NCC Supply Pipeline ── */}
      <div className="mb-3">
        <p className="text-sm font-bold text-[#10231C] uppercase tracking-wide">
          Pipeline từ Nhà sản xuất (NCC)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {NCC_SUPPLY.map((ncc) => (
          <Card
            key={ncc.nccName}
            className={`border ${
              ncc.status === "delayed"
                ? "border-amber-200 bg-amber-50/30"
                : "border-[#BBF7D0] bg-[#F0FDF4]/50"
            }`}
          >
            <CardBody className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-bold text-[#10231C] leading-tight">{ncc.nccName}</p>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                    ncc.status === "on_time"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {ncc.status === "on_time" ? "✓ Đúng hẹn" : "⚠ Trễ hẹn"}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {ncc.drugs.map((drug) => (
                  <Chip key={drug} color="primary" variant="flat" size="sm">
                    {drug.split(" ")[0]}
                  </Chip>
                ))}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7A73]">Đang vận chuyển</span>
                  <span className="font-bold text-[#10231C]">
                    {fmtNum(ncc.pendingQty)} đơn vị
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7A73]">ETA dự kiến</span>
                  <span className="font-semibold text-[#10231C]">
                    {fmtDate(ncc.expectedDate)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4EAE7]/60">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#6B7A73]">Độ tin cậy giao hàng</span>
                  <span
                    className={`font-bold ${
                      ncc.reliability >= 90
                        ? "text-green-600"
                        : ncc.reliability >= 80
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {ncc.reliability}%
                  </span>
                </div>
                <Progress
                  value={ncc.reliability}
                  size="sm"
                  classNames={{
                    indicator:
                      ncc.reliability >= 90
                        ? "bg-green-500"
                        : ncc.reliability >= 80
                        ? "bg-amber-500"
                        : "bg-red-500",
                  }}
                />
              </div>

              {ncc.status === "delayed" && (
                <div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded-lg">
                  <p className="text-[11px] text-amber-700 font-medium">
                    ⚠ Trễ hẹn — liên hệ NCC để xác nhận lịch giao lại
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ── Section 5: Drug demand bar chart ── */}
      <div className="mb-3">
        <p className="text-sm font-bold text-[#10231C] uppercase tracking-wide">
          Phân tích cầu theo mặt hàng
        </p>
      </div>
      <Card className="border border-[#E4EAE7] mb-6">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#10231C]">
              Top 8 mặt hàng — Nhu cầu tháng hiện tại
            </p>
            <div className="flex items-center gap-3 text-xs text-[#6B7A73]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#024430]" />
                Top 2
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" />
                Mid
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" />
                Khác
              </span>
            </div>
          </div>
          <BarChart
            data={barData}
            height={200}
            formatValue={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <div className="mt-3 pt-3 border-t border-[#E4EAE7] flex flex-wrap gap-x-6 gap-y-1">
            <p className="text-xs text-[#6B7A73]">
              📊 Paracetamol chiếm <span className="text-[#024430] font-semibold">21%</span> tổng nhu cầu
            </p>
            <p className="text-xs text-[#6B7A73]">
              📈 Amoxicillin tăng <span className="text-green-600 font-semibold">+12% MoM</span>
            </p>
            <p className="text-xs text-[#6B7A73]">
              ☀ Vitamin C tăng mạnh vào <span className="text-amber-600 font-semibold">mùa hè</span>
            </p>
          </div>
        </CardBody>
      </Card>

      {/* ── Section 6: Stockout prediction timeline ── */}
      <div className="mb-3">
        <p className="text-sm font-bold text-[#10231C] uppercase tracking-wide">
          Ngày dự kiến hết hàng
        </p>
      </div>
      <Card className="border border-[#E4EAE7] mb-6">
        <CardBody className="p-5">
          <div className="space-y-3">
            {FORECAST_DATA.map((item) => {
              const days = daysOfStock(item);
              const isOut = days === 0;
              const isCritical = days > 0 && days < 30;
              const isWarning = days >= 30 && days <= 60;
              const isSafe = days > 60;

              const barColor = isOut
                ? "bg-red-500"
                : isCritical
                ? "bg-red-400"
                : isWarning
                ? "bg-amber-400"
                : "bg-green-500";

              const textColor = isOut || isCritical
                ? "text-red-600"
                : isWarning
                ? "text-amber-600"
                : "text-green-600";

              const stockPct = Math.min(
                100,
                (item.currentStock / (item.avgMonthlyDemand * 3)) * 100
              );

              return (
                <div
                  key={item.drug}
                  className="grid grid-cols-[180px_1fr_160px_120px] items-center gap-4"
                >
                  <p className="text-sm font-medium text-[#10231C] truncate">{item.drug}</p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#E4EAE7] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#6B7A73] whitespace-nowrap w-16 text-right">
                      {fmtNum(item.currentStock)} đv
                    </span>
                  </div>

                  <div className={`text-xs font-semibold ${textColor} whitespace-nowrap`}>
                    {isOut ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                        ĐÃ HẾT HÀNG
                      </span>
                    ) : isSafe ? (
                      "Đủ hàng >3 tháng"
                    ) : (
                      `Hết hàng: ${stockoutDate(item)}`
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isOut || isCritical
                          ? "bg-red-100 text-red-700"
                          : isWarning
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isOut ? "0 ngày" : isSafe ? ">90 ngày" : `${days} ngày`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E4EAE7] flex items-center gap-6 text-xs text-[#6B7A73]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              {"Hết hàng / <30 ngày"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              30–60 ngày
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              {">"}60 ngày
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Footer action bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#E4EAE7] rounded-2xl">
        <div>
          <p className="text-sm font-semibold text-[#10231C]">
            Xuất báo cáo & Đặt hàng tự động
          </p>
          <p className="text-xs text-[#6B7A73] mt-0.5">
            AI đề xuất 3 đơn đặt hàng khẩn cấp cần xử lý ngay
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="bordered" size="sm">
            Xuất PDF
          </Button>
          <Button variant="solid" color="primary" size="sm">
            Tạo đơn đặt hàng AI
          </Button>
        </div>
      </div>
    </div>
  );
}
