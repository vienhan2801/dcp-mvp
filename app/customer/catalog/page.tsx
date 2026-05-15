"use client";
import { useState, useMemo } from "react";
import { fmtVND } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Input } from "@/components/ui";
import Link from "next/link";

const ACCENT = "#1D4ED8";

interface CatalogDrug {
  id: string;
  name: string;
  activeIngredient: string;
  dosageForm: string;
  specification: string;
  unit: string;
  unitPrice: number;
  customerStock: number;
  supplier: string;
  contractCode: string;
}

const CATALOG_DRUGS: CatalogDrug[] = [
  {
    id: "DRG-001",
    name: "Paracetamol 500mg",
    activeIngredient: "Paracetamol",
    dosageForm: "Viên nén",
    specification: "500mg",
    unit: "hộp",
    unitPrice: 35_000,
    customerStock: 850,
    supplier: "PhytoPharma",
    contractCode: "CTR-2026-001",
  },
  {
    id: "DRG-002",
    name: "Ibuprofen 400mg",
    activeIngredient: "Ibuprofen",
    dosageForm: "Viên nén bao phim",
    specification: "400mg",
    unit: "hộp",
    unitPrice: 48_000,
    customerStock: 320,
    supplier: "PhytoPharma",
    contractCode: "CTR-2026-001",
  },
  {
    id: "DRG-003",
    name: "Amoxicillin 500mg",
    activeIngredient: "Amoxicillin trihydrate",
    dosageForm: "Viên nang cứng",
    specification: "500mg",
    unit: "hộp",
    unitPrice: 65_000,
    customerStock: 120,
    supplier: "PhytoPharma",
    contractCode: "CTR-2026-001",
  },
  {
    id: "DRG-004",
    name: "Metformin 500mg",
    activeIngredient: "Metformin hydrochloride",
    dosageForm: "Viên nén",
    specification: "500mg",
    unit: "hộp",
    unitPrice: 28_000,
    customerStock: 540,
    supplier: "MedPharma",
    contractCode: "CTR-2026-002",
  },
  {
    id: "DRG-005",
    name: "Amlodipine 5mg",
    activeIngredient: "Amlodipine besylate",
    dosageForm: "Viên nén",
    specification: "5mg",
    unit: "hộp",
    unitPrice: 55_000,
    customerStock: 200,
    supplier: "MedPharma",
    contractCode: "CTR-2026-002",
  },
  {
    id: "DRG-006",
    name: "Atorvastatin 20mg",
    activeIngredient: "Atorvastatin calcium",
    dosageForm: "Viên nén bao phim",
    specification: "20mg",
    unit: "hộp",
    unitPrice: 72_000,
    customerStock: 180,
    supplier: "MedPharma",
    contractCode: "CTR-2026-002",
  },
  {
    id: "DRG-007",
    name: "Azithromycin 250mg",
    activeIngredient: "Azithromycin dihydrate",
    dosageForm: "Viên nén bao phim",
    specification: "250mg",
    unit: "hộp",
    unitPrice: 89_000,
    customerStock: 95,
    supplier: "PhytoPharma",
    contractCode: "CTR-2026-001",
  },
  {
    id: "DRG-008",
    name: "Omeprazole 20mg",
    activeIngredient: "Omeprazole",
    dosageForm: "Viên nang cứng",
    specification: "20mg",
    unit: "hộp",
    unitPrice: 42_000,
    customerStock: 460,
    supplier: "PhytoPharma",
    contractCode: "CTR-2026-001",
  },
];

export default function CustomerCatalogPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      CATALOG_DRUGS.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.activeIngredient.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div>
      <PageHeader
        title="Catalog thuốc"
        subtitle="Danh mục thuốc từ các hợp đồng hiệu lực"
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Tìm theo tên thuốc hoặc hoạt chất..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={<span className="text-[#6B7A73] text-sm">🔍</span>}
          classNames={{
            inputWrapper: "bg-white border border-[#E4EAE7] rounded-xl h-12",
          }}
        />
      </div>

      {/* Summary */}
      <p className="text-sm text-[#6B7A73] mb-4">
        Hiển thị <strong className="text-[#10231C]">{filtered.length}</strong> / {CATALOG_DRUGS.length} sản phẩm
      </p>

      {/* Drug grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((drug) => (
          <Card key={drug.id} className="border border-[#E4EAE7] hover:shadow-md transition-shadow">
            <CardBody className="p-5">
              {/* Drug name + contract */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[#10231C] text-base leading-tight">{drug.name}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#EFF6FF", color: ACCENT }}>
                    {drug.contractCode}
                  </span>
                </div>
                <p className="text-xs text-[#6B7A73]">Hoạt chất: {drug.activeIngredient}</p>
                <p className="text-xs text-[#6B7A73] mt-0.5">{drug.dosageForm} · {drug.specification}</p>
              </div>

              {/* Price + stock */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#F6F8F7] rounded-xl p-3 text-center">
                  <p className="text-[10px] text-[#6B7A73] mb-1">Đơn giá HĐ</p>
                  <p className="text-sm font-bold" style={{ color: ACCENT }}>
                    {fmtVND(drug.unitPrice)}/{drug.unit}
                  </p>
                </div>
                <div className={`rounded-xl p-3 text-center ${
                  drug.customerStock < 150 ? "bg-orange-50 border border-orange-100" : "bg-[#F6F8F7]"
                }`}>
                  <p className="text-[10px] text-[#6B7A73] mb-1">Tồn KH</p>
                  <p className={`text-sm font-bold ${
                    drug.customerStock < 150 ? "text-orange-700" : "text-[#10231C]"
                  }`}>
                    {drug.customerStock.toLocaleString("vi-VN")} {drug.unit}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#6B7A73] mb-3">NPP: <strong className="text-[#10231C]">{drug.supplier}</strong></p>

              {/* Order button */}
              <Link href={`/customer/orders/new?drugId=${drug.id}`} className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}>
                  🛒 Đặt hàng
                </span>
              </Link>
            </CardBody>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-[#6B7A73]">
            <p className="text-lg">Không tìm thấy thuốc</p>
            <p className="text-sm mt-1">Thử từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
}
