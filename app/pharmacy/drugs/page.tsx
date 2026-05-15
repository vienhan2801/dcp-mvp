"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Input, Button, Chip } from "@/components/ui";

// ─── Mock drug data ───────────────────────────────────────────────────────────
interface Drug {
  id: string;
  name: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  specification: string;
  manufacturer: string;
  origin: string;
  unitPrice: number;
  unit: string;
}

const MOCK_DRUGS: Drug[] = [
  {
    id: "d1",
    name: "Amoxicillin 500mg",
    activeIngredient: "Amoxicillin trihydrate",
    dosageForm: "Viên nang",
    strength: "500mg",
    specification: "Hộp 10 vỉ x 10 viên",
    manufacturer: "Công ty CP Dược Hậu Giang",
    origin: "Việt Nam",
    unitPrice: 2_800,
    unit: "Viên",
  },
  {
    id: "d2",
    name: "Paracetamol 500mg",
    activeIngredient: "Paracetamol",
    dosageForm: "Viên nén",
    strength: "500mg",
    specification: "Hộp 10 vỉ x 10 viên",
    manufacturer: "Công ty CP Dược Phẩm TW1",
    origin: "Việt Nam",
    unitPrice: 800,
    unit: "Viên",
  },
  {
    id: "d3",
    name: "Omeprazole 20mg",
    activeIngredient: "Omeprazole",
    dosageForm: "Viên nang",
    strength: "20mg",
    specification: "Hộp 3 vỉ x 10 viên",
    manufacturer: "Stada Vietnam",
    origin: "Việt Nam",
    unitPrice: 4_500,
    unit: "Viên",
  },
  {
    id: "d4",
    name: "Vitamin C 1000mg",
    activeIngredient: "Ascorbic acid",
    dosageForm: "Viên sủi",
    strength: "1000mg",
    specification: "Hộp 1 tuýp x 20 viên",
    manufacturer: "Bayer Vietnam",
    origin: "Đức",
    unitPrice: 8_200,
    unit: "Viên",
  },
  {
    id: "d5",
    name: "Cetirizine 10mg",
    activeIngredient: "Cetirizine hydrochloride",
    dosageForm: "Viên nén",
    strength: "10mg",
    specification: "Hộp 1 vỉ x 10 viên",
    manufacturer: "Domesco",
    origin: "Việt Nam",
    unitPrice: 3_200,
    unit: "Viên",
  },
  {
    id: "d6",
    name: "Azithromycin 250mg",
    activeIngredient: "Azithromycin dihydrate",
    dosageForm: "Viên nang",
    strength: "250mg",
    specification: "Hộp 1 vỉ x 6 viên",
    manufacturer: "Pfizer Vietnam",
    origin: "Hoa Kỳ",
    unitPrice: 18_500,
    unit: "Viên",
  },
];

const DOSAGE_COLORS: Record<string, { bg: string; text: string; initBg: string; initText: string }> = {
  "Viên nang": { bg: "bg-purple-100", text: "text-purple-700", initBg: "bg-purple-100", initText: "text-purple-700" },
  "Viên nén":  { bg: "bg-blue-100",   text: "text-blue-700",   initBg: "bg-blue-100",   initText: "text-blue-700" },
  "Viên sủi":  { bg: "bg-cyan-100",   text: "text-cyan-700",   initBg: "bg-cyan-100",   initText: "text-cyan-700" },
};

function fmtVND(v: number) {
  return v.toLocaleString("vi-VN") + " ₫";
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

type ViewMode = "grid3" | "grid4" | "table";

function DrugThumbnail({ drug }: { drug: Drug }) {
  const c = DOSAGE_COLORS[drug.dosageForm] ?? { initBg: "bg-gray-100", initText: "text-gray-600" };
  return (
    <div className={`w-full h-28 rounded-xl flex flex-col items-center justify-center gap-1 ${c.initBg}`}>
      <span className={`text-3xl font-black tracking-tight ${c.initText}`}>{getInitials(drug.name)}</span>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/60 ${c.initText}`}>
        {drug.dosageForm}
      </span>
    </div>
  );
}

function DrugCard({ drug }: { drug: Drug }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardBody className="flex flex-col gap-3">
        <DrugThumbnail drug={drug} />
        <div>
          <h3 className="font-bold text-[#10231C] text-base leading-tight">{drug.name}</h3>
          <p className="text-sm text-[#6B7A73] mt-0.5">{drug.activeIngredient}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-[#6B7A73] text-xs">Hàm lượng</span>
            <p className="text-[#10231C] font-medium">{drug.strength}</p>
          </div>
          <div>
            <span className="text-[#6B7A73] text-xs">Quy cách</span>
            <p className="text-[#10231C] font-medium text-xs">{drug.specification}</p>
          </div>
          <div className="col-span-2">
            <span className="text-[#6B7A73] text-xs">Nhà sản xuất</span>
            <p className="text-[#10231C] font-medium text-sm">{drug.manufacturer}</p>
          </div>
          <div>
            <span className="text-[#6B7A73] text-xs">Xuất xứ</span>
            <p className="text-[#10231C] font-medium">{drug.origin}</p>
          </div>
        </div>
        <div className="rounded-lg bg-[#F6F8F7] px-3 py-2">
          <p className="text-[10px] text-[#6B7A73] mb-0.5">Đơn giá hợp đồng</p>
          <p className="text-sm font-bold text-[#024430]">{fmtVND(drug.unitPrice)} / {drug.unit}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function DrugTableRow({ drug }: { drug: Drug }) {
  const c = DOSAGE_COLORS[drug.dosageForm] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <tr className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
      <td className="p-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.bg}`}>
          <span className={`text-xs font-bold ${c.text}`}>{getInitials(drug.name)}</span>
        </div>
      </td>
      <td className="p-3">
        <p className="font-semibold text-[#10231C] text-sm">{drug.name}</p>
        <p className="text-xs text-[#6B7A73]">{drug.activeIngredient}</p>
      </td>
      <td className="p-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{drug.dosageForm}</span>
      </td>
      <td className="p-3 text-sm text-[#10231C]">{drug.strength}</td>
      <td className="p-3 text-sm text-[#6B7A73]">{drug.manufacturer}</td>
      <td className="p-3">
        <p className="text-sm font-semibold text-[#024430]">{fmtVND(drug.unitPrice)}</p>
        <p className="text-[10px] text-[#6B7A73]">/ {drug.unit}</p>
      </td>
    </tr>
  );
}

export default function PharmacyDrugsPage() {
  const [search, setSearch] = useState("");
  const [filterForm, setFilterForm] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid3");

  const dosageForms = Array.from(new Set(MOCK_DRUGS.map((d) => d.dosageForm)));

  const filtered = MOCK_DRUGS.filter((drug) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      drug.name.toLowerCase().includes(q) ||
      drug.activeIngredient.toLowerCase().includes(q) ||
      drug.manufacturer.toLowerCase().includes(q);
    const matchForm = filterForm === "all" || drug.dosageForm === filterForm;
    return matchSearch && matchForm;
  });

  return (
    <div>
      <PageHeader
        title="Danh mục thuốc"
        subtitle="Tra cứu thông tin và giá các loại thuốc trong hợp đồng"
      />

      {/* Search + filter */}
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
              filterForm === "all" ? "bg-[#024430] text-white shadow-sm" : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
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
                filterForm === form ? "bg-[#024430] text-white shadow-sm" : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      {/* Count + view toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6B7A73]">
          Hiển thị <span className="font-semibold text-[#10231C]">{filtered.length}</span> / {MOCK_DRUGS.length} thuốc
        </p>
        <div className="flex items-center gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1">
          {(
            [
              {
                key: "grid3" as ViewMode,
                title: "Lưới 3",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ),
              },
              {
                key: "grid4" as ViewMode,
                title: "Lưới 4",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3h3v3H3V3zm0 5h3v3H3V8zm0 5h3v3H3v-3zm5-10h3v3H8V3zm0 5h3v3H8V8zm0 5h3v3H8v-3zm5-10h3v3h-3V3zm0 5h3v3h-3V8zm0 5h3v3h-3v-3z" />
                  </svg>
                ),
              },
              {
                key: "table" as ViewMode,
                title: "Bảng",
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                  </svg>
                ),
              },
            ] as { key: ViewMode; title: string; icon: React.ReactNode }[]
          ).map((v) => (
            <button
              key={v.key}
              type="button"
              title={v.title}
              onClick={() => setViewMode(v.key)}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === v.key ? "bg-[#024430] text-white" : "text-[#6B7A73] hover:text-[#10231C]"
              }`}
            >
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
                <th className="p-3 text-left w-14"></th>
                <th className="p-3 text-left">Tên thuốc</th>
                <th className="p-3 text-left">Dạng bào chế</th>
                <th className="p-3 text-left">Hàm lượng</th>
                <th className="p-3 text-left">Nhà sản xuất</th>
                <th className="p-3 text-left">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((drug) => (
                <DrugTableRow key={drug.id} drug={drug} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            viewMode === "grid4"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filtered.map((drug) => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      )}
    </div>
  );
}
