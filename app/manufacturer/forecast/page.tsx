"use client";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";

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

function MiniBarChart({ data, max }: { data: number[]; max: number }) {
  return (
    <svg viewBox="0 0 100 36" className="w-full h-9">
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * 30);
        const x = 2 + i * 20;
        return <rect key={i} x={x} y={36 - h - 3} width={14} height={h} rx={2} fill="#024430" opacity={0.75} />;
      })}
    </svg>
  );
}

export default function ManufacturerForecastPage() {
  return (
    <div>
      <PageHeader title="Dự báo nhu cầu" subtitle="Dự báo sản xuất & nhập khẩu dựa trên lịch sử tiêu thụ" />

      {/* Summary alert */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-semibold text-amber-800 text-sm">2 sản phẩm cần bổ sung sản lượng khẩn cấp</p>
          <p className="text-xs text-amber-700 mt-0.5">Ceftriaxone 1g và Omeprazole 20mg dự kiến hết hàng trong &lt; 2 tháng tới</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {PRODUCTS.map((p, idx) => {
          const monthsLeft = p.monthlyAvg > 0 ? Math.floor(p.stock / p.monthlyAvg) : 99;
          const suggested = p.monthlyAvg * 3;
          const urgency = monthsLeft <= 1 ? "high" : monthsLeft <= 3 ? "medium" : "low";
          const colors = {
            high:   { bg: "bg-red-50 border-red-200",    badge: "bg-red-100 text-red-700",     label: "⚠️ Khẩn" },
            medium: { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", label: "📋 Theo dõi" },
            low:    { bg: "bg-white border-[#E4EAE7]",    badge: "bg-emerald-100 text-emerald-700", label: "✅ Ổn định" },
          }[urgency];
          const monthData = MONTHLY.map((m) => m.values[idx]);
          const maxMonth = Math.max(...monthData);
          return (
            <Card key={p.name} className={`border ${colors.bg}`}>
              <CardHeader className="flex items-center justify-between pb-2">
                <h3 className="font-semibold text-[#10231C]">{p.name}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{colors.label}</span>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div>
                    <p className="text-base font-bold text-[#10231C]">{p.stock.toLocaleString("vi-VN")}</p>
                    <p className="text-[10px] text-[#6B7A73]">Tồn kho ({p.unit})</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#024430]">{p.monthlyAvg.toLocaleString("vi-VN")}</p>
                    <p className="text-[10px] text-[#6B7A73]">TB/tháng</p>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${urgency === "high" ? "text-red-600" : urgency === "medium" ? "text-amber-600" : "text-emerald-700"}`}>
                      {monthsLeft} tháng
                    </p>
                    <p className="text-[10px] text-[#6B7A73]">Đủ dùng</p>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-[10px] text-[#6B7A73] mb-1">Tiêu thụ 5 tháng gần nhất ({p.unit})</p>
                  <div className="flex items-end gap-2">
                    <MiniBarChart data={monthData} max={maxMonth} />
                    <div className="flex gap-1">
                      {MONTHLY.map((m) => (
                        <span key={m.label} className="text-[9px] text-[#6B7A73] w-[14px] text-center">{m.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 p-2.5 bg-[#024430]/5 border border-[#024430]/15 rounded-lg">
                  <p className="text-xs text-[#024430] font-semibold">
                    💡 Đề xuất: Sản xuất/nhập khẩu thêm {suggested.toLocaleString("vi-VN")} {p.unit}
                  </p>
                  <p className="text-[10px] text-[#6B7A73] mt-0.5">
                    (đủ dùng 3 tháng · ≈ {((suggested * p.unitPrice) / 1e6).toFixed(1)}M ₫)
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
