"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Input } from "@/components/ui";
import { useApp } from "@/lib/store";
import { DrugMaster } from "@/domain/models/drug";
import { Button } from "@/components/ui";
import { fmtVND } from "@/lib/format";

const DOSAGE_COLORS: Record<string, { bg: string; text: string }> = {
  "Viên nén":       { bg: "bg-blue-100",   text: "text-blue-700" },
  "Viên nang":      { bg: "bg-purple-100",  text: "text-purple-700" },
  "Bột pha tiêm":   { bg: "bg-orange-100",  text: "text-orange-700" },
  "Dung dịch tiêm": { bg: "bg-red-100",     text: "text-red-700" },
  "Siro":           { bg: "bg-green-100",   text: "text-green-700" },
};

function getPriceRange(drug: DrugMaster) {
  if (!drug.priceHistory || drug.priceHistory.length === 0) return null;
  const prices = drug.priceHistory.map((p) => p.unitPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
}

function DrugThumbnail({ drug }: { drug: DrugMaster }) {
  const colors = DOSAGE_COLORS[drug.dosageForm] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const initials = drug.drugName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const imgUrl = drug.images?.[0];
  if (imgUrl) {
    return (
      <div className="w-full h-28 rounded-xl overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt={drug.drugName}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className={`absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 ${colors.text}`}>
          {drug.dosageForm}
        </span>
      </div>
    );
  }
  return (
    <div className={`w-full h-28 rounded-xl flex flex-col items-center justify-center gap-1 ${colors.bg}`}>
      <span className={`text-3xl font-black tracking-tight ${colors.text}`}>{initials}</span>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/60 ${colors.text}`}>
        {drug.dosageForm}
      </span>
    </div>
  );
}

function DrugCard({ drug }: { drug: DrugMaster }) {
  const priceRange = getPriceRange(drug);
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardBody className="flex flex-col gap-3">
        <DrugThumbnail drug={drug} />

        {/* Header */}
        <div>
          <h3 className="font-bold text-[#10231C] text-base leading-tight">{drug.drugName}</h3>
          <p className="text-sm text-[#6B7A73] mt-0.5">{drug.activeIngredient}</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-[#6B7A73] text-xs">Hàm lượng</span>
            <p className="text-[#10231C] font-medium">{drug.strength}</p>
          </div>
          <div>
            <span className="text-[#6B7A73] text-xs">Quy cách</span>
            <p className="text-[#10231C] font-medium">{drug.specification}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[#6B7A73] text-xs">Nhà sản xuất</span>
            <p className="text-[#10231C] font-medium">{drug.manufacturer}</p>
          </div>
        </div>

        {/* Price range */}
        {priceRange && (
          <div className="rounded-lg bg-[#F6F8F7] px-3 py-2">
            <p className="text-[10px] text-[#6B7A73] mb-0.5">Khoảng giá hợp đồng</p>
            {priceRange.min === priceRange.max ? (
              <p className="text-sm font-bold text-[#024430]">{fmtVND(priceRange.min)}</p>
            ) : (
              <p className="text-sm font-bold text-[#024430]">
                {fmtVND(priceRange.min)} – {fmtVND(priceRange.max)}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E4EAE7]">
          <span className="text-xs text-[#6B7A73]">
            {drug.linkedContractItemIds.length} hợp đồng
          </span>
          <Link href={`/hospital/drugs/${drug.id}`}>
            <Button size="sm" variant="flat">Xem chi tiết</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

type ViewMode = "grid3" | "grid4" | "table";

function DrugTableRow({ drug }: { drug: DrugMaster }) {
  const priceRange = getPriceRange(drug);
  const colors = DOSAGE_COLORS[drug.dosageForm] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const imgUrl = drug.images?.[0];
  return (
    <tr className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
      <td className="p-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt={drug.drugName} className="w-full h-full object-contain" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${colors.bg}`}>
              <span className={`text-sm font-bold ${colors.text}`}>{drug.drugName.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
      </td>
      <td className="p-3">
        <p className="font-semibold text-[#10231C] text-sm">{drug.drugName}</p>
        <p className="text-xs text-[#6B7A73]">{drug.activeIngredient}</p>
      </td>
      <td className="p-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{drug.dosageForm}</span>
      </td>
      <td className="p-3 text-sm text-[#10231C]">{drug.strength}</td>
      <td className="p-3 text-sm text-[#6B7A73]">{drug.manufacturer}</td>
      <td className="p-3">
        {priceRange ? (
          <p className="text-sm font-semibold text-[#024430]">
            {priceRange.min === priceRange.max ? fmtVND(priceRange.min) : `${fmtVND(priceRange.min)} – ${fmtVND(priceRange.max)}`}
          </p>
        ) : <span className="text-xs text-[#6B7A73]">—</span>}
        <p className="text-[10px] text-[#6B7A73]">/{drug.unit}</p>
      </td>
      <td className="p-3">
        <Link href={`/hospital/drugs/${drug.id}`}>
          <Button size="sm" variant="flat">Chi tiết</Button>
        </Link>
      </td>
    </tr>
  );
}

export default function HospitalDrugsPage() {
  const { state } = useApp();
  const [search, setSearch] = useState("");
  const [filterForm, setFilterForm] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid3");

  const dosageForms = Array.from(new Set(state.drugMasters.map((d) => d.dosageForm)));

  const filtered = state.drugMasters.filter((drug) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      drug.drugName.toLowerCase().includes(q) ||
      drug.activeIngredient.toLowerCase().includes(q) ||
      drug.manufacturer.toLowerCase().includes(q);
    const matchesForm = filterForm === "all" || drug.dosageForm === filterForm;
    return matchesSearch && matchesForm;
  });

  return (
    <div>
      <PageHeader
        title="Thư viện thuốc"
        subtitle="Tra cứu thông tin và giá các loại thuốc trong hợp đồng"
      />

      {/* Search + Dosage form filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Tìm theo tên thuốc, hoạt chất, nhà sản xuất..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Tìm kiếm thuốc"
          startContent={
            <svg className="w-4 h-4 text-[#6B7A73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          className="flex-1"
        />
        <div className="flex gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterForm("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterForm === "all"
                ? "bg-[#024430] text-white shadow-sm"
                : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
            }`}
          >
            Tất cả
          </button>
          {dosageForms.map((form) => (
            <button
              key={form}
              type="button"
              onClick={() => setFilterForm(form)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterForm === form
                  ? "bg-[#024430] text-white shadow-sm"
                  : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      {/* Count + View mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6B7A73]">
          Hiển thị <span className="font-semibold text-[#10231C]">{filtered.length}</span> / {state.drugMasters.length} thuốc
        </p>
        <div className="flex items-center gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1">
          {([
            { key: "grid3", title: "Lưới 3", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
            { key: "grid4", title: "Lưới 4", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3h3v3H3V3zm0 5h3v3H3V8zm0 5h3v3H3v-3zm5-10h3v3H8V3zm0 5h3v3H8V8zm0 5h3v3H8v-3zm5-10h3v3h-3V3zm0 5h3v3h-3V8zm0 5h3v3h-3v-3z"/></svg> },
            { key: "table", title: "Bảng", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg> },
          ] as { key: ViewMode; title: string; icon: React.ReactNode }[]).map((v) => (
            <button key={v.key} type="button" title={v.title} onClick={() => setViewMode(v.key)}
              className={`p-1.5 rounded-lg transition-all ${viewMode === v.key ? "bg-[#024430] text-white" : "text-[#6B7A73] hover:text-[#10231C]"}`}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Drug list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B7A73]">Không tìm thấy thuốc nào phù hợp.</div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-[#E4EAE7] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F6F8F7] text-xs text-[#6B7A73]">
              <tr>
                <th className="p-3 text-left w-16">Hình</th>
                <th className="p-3 text-left">Tên thuốc</th>
                <th className="p-3 text-left">Dạng bào chế</th>
                <th className="p-3 text-left">Hàm lượng</th>
                <th className="p-3 text-left">Nhà sản xuất</th>
                <th className="p-3 text-left">Khoảng giá</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((drug) => <DrugTableRow key={drug.id} drug={drug} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === "grid4" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {filtered.map((drug) => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      )}
    </div>
  );
}
