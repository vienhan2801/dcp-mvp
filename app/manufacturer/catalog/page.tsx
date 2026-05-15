"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Input } from "@/components/ui";

// ── Mock Data ────────────────────────────────────────────────
type TherapeuticCategory =
  | "Kháng sinh"
  | "Giảm đau / Hạ sốt"
  | "Tim mạch"
  | "Tiêu hóa"
  | "Hô hấp"
  | "Thần kinh"
  | "Nội tiết";

interface CatalogProduct {
  id: string;
  name: string;
  ingredients: string[];
  forms: string[];
  strengths: string[];
  category: TherapeuticCategory;
  certifications: string[];
  description: string;
  color: string;
  initial: string;
}

const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "CAT001",
    name: "Amoxicillin",
    ingredients: ["Amoxicillin trihydrate"],
    forms: ["Viên nang", "Bột pha hỗn dịch"],
    strengths: ["250mg", "500mg"],
    category: "Kháng sinh",
    certifications: ["GMP-WHO", "ISO 9001"],
    description: "Kháng sinh nhóm penicillin phổ rộng, hiệu quả với nhiều loại vi khuẩn gram dương và gram âm.",
    color: "#024430",
    initial: "AM",
  },
  {
    id: "CAT002",
    name: "Paracetamol",
    ingredients: ["Paracetamol"],
    forms: ["Viên nén", "Gói bột", "Dung dịch uống"],
    strengths: ["500mg", "650mg", "1000mg"],
    category: "Giảm đau / Hạ sốt",
    certifications: ["GMP-WHO", "ISO 9001", "ISO 14001"],
    description: "Thuốc giảm đau, hạ sốt không kê đơn an toàn và hiệu quả cho mọi lứa tuổi.",
    color: "#D92D20",
    initial: "PC",
  },
  {
    id: "CAT003",
    name: "Metformin",
    ingredients: ["Metformin hydrochloride"],
    forms: ["Viên nén", "Viên nén phóng thích kéo dài"],
    strengths: ["500mg", "850mg", "1000mg"],
    category: "Nội tiết",
    certifications: ["GMP-WHO", "ISO 9001"],
    description: "Thuốc điều trị đái tháo đường type 2, cơ chế ức chế sản xuất glucose tại gan.",
    color: "#1570EF",
    initial: "MF",
  },
  {
    id: "CAT004",
    name: "Atorvastatin",
    ingredients: ["Atorvastatin calcium"],
    forms: ["Viên nén bao phim"],
    strengths: ["10mg", "20mg", "40mg", "80mg"],
    category: "Tim mạch",
    certifications: ["GMP-WHO", "ISO 9001", "CE Mark"],
    description: "Statin thế hệ mới giúp kiểm soát mỡ máu, ngăn ngừa biến chứng tim mạch hiệu quả.",
    color: "#7F56D9",
    initial: "AV",
  },
  {
    id: "CAT005",
    name: "Omeprazole",
    ingredients: ["Omeprazole"],
    forms: ["Viên nang giải phóng bền kiềm"],
    strengths: ["20mg", "40mg"],
    category: "Tiêu hóa",
    certifications: ["GMP-WHO", "ISO 9001"],
    description: "Ức chế bơm proton mạnh, điều trị loét dạ dày, trào ngược thực quản và hội chứng Zollinger-Ellison.",
    color: "#F79009",
    initial: "OM",
  },
  {
    id: "CAT006",
    name: "Cetirizine",
    ingredients: ["Cetirizine dihydrochloride"],
    forms: ["Viên nén", "Siro uống"],
    strengths: ["5mg", "10mg"],
    category: "Hô hấp",
    certifications: ["GMP-WHO", "ISO 9001"],
    description: "Thuốc kháng histamine thế hệ 2 không gây buồn ngủ, điều trị dị ứng, mề đay hiệu quả.",
    color: "#0BA5EC",
    initial: "CT",
  },
  {
    id: "CAT007",
    name: "Azithromycin",
    ingredients: ["Azithromycin dihydrate"],
    forms: ["Viên nén", "Viên nang", "Gói bột pha"],
    strengths: ["250mg", "500mg"],
    category: "Kháng sinh",
    certifications: ["GMP-WHO", "ISO 9001", "ISO 14001"],
    description: "Kháng sinh macrolide phổ rộng, liệu trình ngắn (3–5 ngày), hiệu quả với nhiễm khuẩn hô hấp và sinh dục.",
    color: "#E31B54",
    initial: "AZ",
  },
  {
    id: "CAT008",
    name: "Salbutamol",
    ingredients: ["Salbutamol sulfate"],
    forms: ["Dung dịch khí dung", "Thuốc xịt định liều", "Dung dịch uống"],
    strengths: ["2mg/5ml", "100mcg/nhát"],
    category: "Hô hấp",
    certifications: ["GMP-WHO", "ISO 9001"],
    description: "Thuốc giãn phế quản tác dụng nhanh, điều trị cơn hen cấp và bệnh phổi tắc nghẽn mãn tính.",
    color: "#17B26A",
    initial: "SB",
  },
];

const CATEGORIES: TherapeuticCategory[] = [
  "Kháng sinh", "Giảm đau / Hạ sốt", "Tim mạch", "Tiêu hóa", "Hô hấp", "Thần kinh", "Nội tiết",
];

const CERT_COLORS: Record<string, string> = {
  "GMP-WHO":    "bg-[#024430]/10 text-[#024430]",
  "ISO 9001":   "bg-blue-100 text-blue-700",
  "ISO 14001":  "bg-teal-100 text-teal-700",
  "CE Mark":    "bg-purple-100 text-purple-700",
};

export default function ManufacturerCatalogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");
  const [contactedId, setContactedId] = useState<string | null>(null);

  const filtered = CATALOG_PRODUCTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "Tất cả" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <PageHeader
        title="Danh mục sản phẩm giới thiệu"
        subtitle="Danh sách sản phẩm dành cho nhà phân phối — Việt Pharma Co., Ltd"
      />

      {/* Company Banner */}
      <div className="mb-6 p-5 bg-gradient-to-r from-[#024430] to-[#056246] rounded-2xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">VP</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">Công ty Cổ phần Dược phẩm Việt Pharma</h2>
            <p className="text-white/80 text-sm mt-0.5">
              Nhà sản xuất dược phẩm uy tín hàng đầu Việt Nam · GMP-WHO · ISO 9001:2015
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-white/70">
              <span>Thành lập: 2005</span>
              <span>·</span>
              <span>Hơn 50 sản phẩm lưu hành</span>
              <span>·</span>
              <span>Xuất khẩu 15 quốc gia</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-1.5">
            <button className="px-4 py-2 bg-white text-[#024430] rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors">
              Tải brochure
            </button>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          placeholder="Tìm theo tên, hoạt chất..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
          startContent={
            <svg className="w-4 h-4 text-[#6B7A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <div className="flex items-center gap-2 flex-wrap">
          {["Tất cả", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === c
                  ? "bg-[#024430] text-white"
                  : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#6B7A73] mb-4">{filtered.length} sản phẩm</p>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow group">
            <CardBody>
              {/* Photo placeholder */}
              <div
                className="w-full h-36 rounded-xl mb-4 flex items-center justify-center text-white text-3xl font-bold relative overflow-hidden"
                style={{ backgroundColor: product.color }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 16px)`,
                  }}
                />
                <span className="relative z-10 tracking-wider">{product.initial}</span>
                {/* Category badge */}
                <span className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 bg-black/30 rounded-full text-white">
                  {product.category}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-bold text-[#10231C] mb-1">{product.name}</h3>

              {/* Ingredients */}
              <p className="text-xs text-[#6B7A73] mb-3 line-clamp-2">{product.ingredients.join(", ")}</p>

              {/* Description */}
              <p className="text-xs text-[#10231C] mb-3 leading-relaxed line-clamp-3">{product.description}</p>

              {/* Forms */}
              <div className="mb-2">
                <p className="text-[10px] font-semibold text-[#6B7A73] mb-1">Dạng bào chế</p>
                <div className="flex flex-wrap gap-1">
                  {product.forms.map((f) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F6F8F7] border border-[#E4EAE7] text-[#10231C]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-[#6B7A73] mb-1">Hàm lượng</p>
                <div className="flex flex-wrap gap-1">
                  {product.strengths.map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[#024430]/8 text-[#024430] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-[#6B7A73] mb-1">Chứng nhận</p>
                <div className="flex flex-wrap gap-1">
                  {product.certifications.map((cert) => (
                    <span
                      key={cert}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${CERT_COLORS[cert] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              {contactedId === product.id ? (
                <div className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold text-center flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã gửi yêu cầu
                </div>
              ) : (
                <button
                  onClick={() => setContactedId(product.id)}
                  className="w-full py-2 rounded-xl bg-[#024430] text-white text-sm font-semibold hover:bg-[#056246] transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Liên hệ phân phối
                </button>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#6B7A73]">
          <svg className="w-12 h-12 mx-auto mb-3 text-[#E4EAE7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Không tìm thấy sản phẩm phù hợp</p>
        </div>
      )}
    </div>
  );
}
