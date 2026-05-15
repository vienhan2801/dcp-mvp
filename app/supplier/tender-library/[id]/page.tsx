"use client";
import { use, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";

const ACCENT = "#024430";

// ── Mock tender detail data ───────────────────────────────────────────────────
const TENDER_DETAILS: Record<string, {
  id: string; name: string; openingUnit: string; value: number; status: string;
  awardDate: string; contractDeadline: string; code: string;
  items: { id: string; drug: string; ingredient: string; form: string; strength: string; unit: string; qty: number; unitPrice: number; totalValue: number; techReq: string; capable: boolean }[];
  checklist: { item: string; ok: boolean }[];
  vendors: { name: string; id: string; type: string; items: string }[];
}> = {
  "T001": {
    id: "T001", code: "GT-BV-2026-001",
    name: "Gói thầu Thuốc BV Chợ Rẫy 2026",
    openingUnit: "Bệnh viện Chợ Rẫy",
    value: 2_800_000_000, status: "active",
    awardDate: "15/01/2026", contractDeadline: "31/12/2026",
    items: [
      { id: "i1", drug: "Paracetamol 500mg",   ingredient: "Paracetamol",            form: "Viên nén",  strength: "500mg", unit: "Viên", qty: 200_000, unitPrice: 820,    totalValue: 164_000_000, techReq: "GMP-WHO, hạn dùng ≥ 18 tháng",           capable: true  },
      { id: "i2", drug: "Amoxicillin 500mg",   ingredient: "Amoxicillin trihydrate", form: "Viên nang", strength: "500mg", unit: "Viên", qty: 100_000, unitPrice: 1_250,  totalValue: 125_000_000, techReq: "GMP-WHO, không chứa gluten",              capable: true  },
      { id: "i3", drug: "Ceftriaxone 1g",      ingredient: "Ceftriaxone sodium",     form: "Bột tiêm",  strength: "1g",    unit: "Lọ",   qty: 20_000,  unitPrice: 48_000, totalValue: 960_000_000, techReq: "GMP-EU hoặc GMP-PIC/S",                   capable: true  },
      { id: "i4", drug: "Omeprazole 20mg",     ingredient: "Omeprazole",             form: "Viên nang", strength: "20mg",  unit: "Viên", qty: 80_000,  unitPrice: 2_900,  totalValue: 232_000_000, techReq: "GMP-WHO, bao phim kháng acid",             capable: false },
      { id: "i5", drug: "Azithromycin 500mg",  ingredient: "Azithromycin",           form: "Viên nang", strength: "500mg", unit: "Viên", qty: 50_000,  unitPrice: 3_600,  totalValue: 180_000_000, techReq: "GMP-ASEAN hoặc cao hơn",                  capable: true  },
    ],
    checklist: [
      { item: "Chứng chỉ GMP-WHO còn hiệu lực",                         ok: true  },
      { item: "Tồn kho đủ cho toàn bộ gói thầu",                        ok: true  },
      { item: "Hạn dùng ≥ 18 tháng tại thời điểm giao hàng",           ok: true  },
      { item: "Omeprazole 20mg bao phim kháng acid: chưa có dòng này",  ok: false },
      { item: "Hồ sơ pháp lý đầy đủ (SDK / CO / CQ)",                  ok: true  },
    ],
    vendors: [
      { id: "NCC-001", name: "VinPharma Corp",    type: "Trong nước", items: "Paracetamol 500mg, Amoxicillin 500mg, Azithromycin 500mg" },
      { id: "NCC-003", name: "MediStar India Ltd", type: "FIE",       items: "Ceftriaxone 1g, Omeprazole 20mg" },
    ],
  },
  "T002": {
    id: "T002", code: "GT-BV-2026-002",
    name: "Gói thầu Kháng sinh BV 115",
    openingUnit: "Bệnh viện Nhân dân 115",
    value: 1_400_000_000, status: "active",
    awardDate: "20/01/2026", contractDeadline: "31/12/2026",
    items: [
      { id: "i1", drug: "Amoxicillin 500mg",  ingredient: "Amoxicillin trihydrate", form: "Viên nang", strength: "500mg", unit: "Viên", qty: 80_000, unitPrice: 1_250, totalValue: 100_000_000, techReq: "GMP-WHO",         capable: true },
      { id: "i2", drug: "Ceftriaxone 1g",     ingredient: "Ceftriaxone sodium",     form: "Bột tiêm",  strength: "1g",    unit: "Lọ",   qty: 15_000, unitPrice: 48_000, totalValue: 720_000_000, techReq: "GMP-EU/PIC/S",   capable: true },
      { id: "i3", drug: "Azithromycin 500mg", ingredient: "Azithromycin",           form: "Viên nang", strength: "500mg", unit: "Viên", qty: 40_000, unitPrice: 3_600, totalValue: 144_000_000, techReq: "GMP-ASEAN trở lên", capable: true },
    ],
    checklist: [
      { item: "Chứng chỉ GMP-WHO còn hiệu lực",              ok: true },
      { item: "Tồn kho đủ cho toàn bộ gói thầu",             ok: true },
      { item: "Hạn dùng ≥ 18 tháng",                         ok: true },
      { item: "Hồ sơ pháp lý đầy đủ (SDK / CO / CQ)",       ok: true },
    ],
    vendors: [
      { id: "NCC-001", name: "VinPharma Corp",  type: "Trong nước", items: "Amoxicillin 500mg, Azithromycin 500mg" },
      { id: "NCC-005", name: "EuroPharma GmbH", type: "FIE",        items: "Ceftriaxone 1g" },
    ],
  },
};

function fmtN(n: number) { return n.toLocaleString("vi-VN"); }
function fmtVND(n: number) { return (n / 1e6).toFixed(0) + "M ₫"; }

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<"items"|"checklist"|"vendors">("items");
  const tender = TENDER_DETAILS[id] ?? TENDER_DETAILS["T001"];

  const total = tender.items.reduce((s, i) => s + i.totalValue, 0);
  const gapCount = tender.checklist.filter(c => !c.ok).length;
  const allOk = gapCount === 0;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Link href="/supplier/tender-library">
        <span className="text-xs text-[#6B7A73] hover:text-[#10231C] cursor-pointer">← Thư viện gói thầu</span>
      </Link>

      <PageHeader title={tender.name} subtitle={tender.openingUnit + " · " + tender.code} />

      {/* Header card */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Giá trị trúng thầu", value: (tender.value / 1e9).toFixed(2) + " tỷ ₫" },
              { label: "Ngày trúng thầu",    value: tender.awardDate },
              { label: "Hạn hợp đồng",       value: tender.contractDeadline },
              { label: "Trạng thái",          value: null },
            ].map((f, i) => (
              <div key={i}>
                <p className="text-xs text-[#6B7A73] mb-0.5">{f.label}</p>
                {f.value
                  ? <p className="font-bold text-[#10231C]">{f.value}</p>
                  : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">● Đang hiệu lực</span>
                }
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4EAE7]">
        {([["items","Danh mục mặt hàng"],["checklist","Checklist năng lực"],["vendors","Nhà cung cấp"]] as const).map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab===key?"border-[#024430] text-[#024430]":"border-transparent text-[#6B7A73] hover:text-[#10231C]"}`}>
            {label}
            {key==="checklist" && !allOk && <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 inline-block" />}
          </button>
        ))}
      </div>

      {/* Tab: Danh mục mặt hàng */}
      {tab==="items" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-2">
            <button className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-[#024430] text-[#024430] hover:bg-[#F0FDF4] transition-colors">
              Thông báo NCC
            </button>
            <button className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT }}>
              Tạo hợp đồng từ gói thầu →
            </button>
          </div>
          <Card>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E4EAE7]">
                      {["#","Thuốc","Hoạt chất","Dạng BC","Hàm lượng","ĐVT","SL","Đơn giá","Thành tiền","Yêu cầu KT","Năng lực"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tender.items.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-[#F3F4F6] last:border-0 ${!item.capable ? "bg-red-50" : ""}`}>
                        <td className="py-3 pr-3 text-xs text-[#6B7A73]">{idx+1}</td>
                        <td className="py-3 pr-3 font-semibold text-[#10231C] whitespace-nowrap">{item.drug}</td>
                        <td className="py-3 pr-3 text-xs text-[#6B7A73]">{item.ingredient}</td>
                        <td className="py-3 pr-3 text-xs text-[#6B7A73]">{item.form}</td>
                        <td className="py-3 pr-3 text-xs text-[#6B7A73]">{item.strength}</td>
                        <td className="py-3 pr-3 text-xs text-[#6B7A73]">{item.unit}</td>
                        <td className="py-3 pr-3 text-xs text-[#10231C]">{fmtN(item.qty)}</td>
                        <td className="py-3 pr-3 text-xs text-[#10231C]">{fmtN(item.unitPrice)} ₫</td>
                        <td className="py-3 pr-3 text-xs font-semibold text-[#10231C]">{fmtVND(item.totalValue)}</td>
                        <td className="py-3 pr-3 text-xs text-[#6B7A73] max-w-[160px]">{item.techReq}</td>
                        <td className="py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.capable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {item.capable ? "✓ Đủ" : "✗ Thiếu"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#E4EAE7] bg-[#F6F8F7]">
                      <td colSpan={8} className="py-3 pr-3 text-sm font-bold text-[#10231C] text-right">Tổng giá trị gói thầu:</td>
                      <td className="py-3 pr-3 text-sm font-black text-[#024430]">{(total/1e9).toFixed(2)} tỷ ₫</td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab: Checklist */}
      {tab==="checklist" && (
        <div className="flex flex-col gap-4">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${allOk ? "bg-green-50 border-2 border-green-200" : "bg-amber-50 border-2 border-amber-200"}`}>
            <span className="text-2xl">{allOk ? "✅" : "⚠️"}</span>
            <div>
              <p className={`font-bold ${allOk ? "text-green-800" : "text-amber-800"}`}>
                {allOk ? "Đủ năng lực đáp ứng 100% gói thầu" : `Cần bổ sung ${gapCount} hạng mục`}
              </p>
              <p className="text-xs text-[#6B7A73] mt-0.5">
                {tender.checklist.filter(c=>c.ok).length}/{tender.checklist.length} điều kiện đáp ứng
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {tender.checklist.map((c, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border-2 ${c.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${c.ok ? "bg-green-500" : "bg-red-500"}`}>
                  {c.ok ? "✓" : "✗"}
                </div>
                <p className={`text-sm font-medium pt-1 ${c.ok ? "text-green-800" : "text-red-800"}`}>{c.item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Nhà cung cấp */}
      {tab==="vendors" && (
        <div className="flex flex-col gap-4">
          {tender.vendors.map(v => (
            <Card key={v.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-2xl flex-shrink-0">
                      🏭
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#10231C]">{v.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.type==="FIE"?"bg-violet-100 text-violet-700":"bg-green-100 text-green-700"}`}>{v.type}</span>
                      </div>
                      <p className="text-xs text-[#6B7A73] mt-1">Cung cấp: {v.items}</p>
                    </div>
                  </div>
                  <Link href={`/supplier/vendors/${v.id}`}>
                    <button className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 rounded-lg border-2 border-[#024430] text-[#024430] hover:bg-[#F0FDF4] transition-colors">
                      Xem hồ sơ →
                    </button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
