"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";

const ACCENT = "#024430";

const VENDORS = [
  { id: "NCC-001", name: "VinPharma Corp",       type: "Trong nước", category: "Sản xuất",  country: "Việt Nam",  city: "Hà Nội",    certs: ["GMP-WHO","GDP","ISO 9001"], products: 12, revenue: 2_400_000_000, terms: "Net 60", status: "active",   rating: 4.8 },
  { id: "NCC-002", name: "PharmaChem Korea",      type: "FIE",        category: "Nhập khẩu", country: "Hàn Quốc", city: "Seoul",      certs: ["GMP-PIC/S","GDP"],          products: 8,  revenue: 1_800_000_000, terms: "Net 90", status: "active",   rating: 4.5 },
  { id: "NCC-003", name: "MediStar India Ltd",    type: "FIE",        category: "Nhập khẩu", country: "Ấn Độ",    city: "Mumbai",     certs: ["GMP-WHO","GDP"],            products: 15, revenue: 3_200_000_000, terms: "Net 90", status: "active",   rating: 4.2 },
  { id: "NCC-004", name: "BioLife Pharma",        type: "Trong nước", category: "Sản xuất",  country: "Việt Nam",  city: "TP.HCM",    certs: ["GMP-WHO","GSP"],            products: 6,  revenue: 850_000_000,  terms: "Net 45", status: "active",   rating: 4.6 },
  { id: "NCC-005", name: "EuroPharma GmbH",       type: "FIE",        category: "Nhập khẩu", country: "Đức",      city: "Frankfurt",  certs: ["GMP-EU","GDP","ISO 13485"], products: 4,  revenue: 980_000_000,  terms: "Net 90", status: "active",   rating: 4.9 },
  { id: "NCC-006", name: "GenPharma Vietnam",     type: "Trong nước", category: "Sản xuất",  country: "Việt Nam",  city: "Bình Dương", certs: ["GMP-ASEAN"],               products: 9,  revenue: 620_000_000,  terms: "Net 45", status: "probation",rating: 3.8 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"} style={{ fontSize: 12 }}>★</span>
      ))}
      <span className="text-xs text-[#6B7A73] ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function VendorsPage() {
  const [filter, setFilter] = useState<"all"|"fie"|"local">("all");
  const [search, setSearch] = useState("");

  const filtered = VENDORS.filter(v => {
    if (filter === "fie"   && v.type !== "FIE") return false;
    if (filter === "local" && v.type !== "Trong nước") return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = VENDORS.reduce((s, v) => s + v.revenue, 0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-start justify-between">
        <PageHeader title="Quản lý Nhà cung cấp" subtitle="Danh sách FIE và nhà sản xuất trong nước" />
        <button className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-[#024430] text-[#024430] hover:bg-[#F0FDF4] transition-colors">
          + Thêm nhà cung cấp
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng nhà cung cấp", value: VENDORS.length,                                color: "bg-[#F0FDF4] border-green-200 text-[#024430]" },
          { label: "FIE (nước ngoài)",  value: VENDORS.filter(v=>v.type==="FIE").length,      color: "bg-violet-50 border-violet-200 text-violet-700" },
          { label: "Trong nước",        value: VENDORS.filter(v=>v.type==="Trong nước").length,color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Tổng nhập hàng/năm",value: `${(totalRevenue/1e9).toFixed(1)} tỷ ₫`,     color: "bg-amber-50 border-amber-200 text-amber-700" },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border-2 p-4 ${k.color}`}>
            <p className="text-xs font-medium text-[#6B7A73]">{k.label}</p>
            <p className="text-2xl font-extrabold leading-none mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 border-b border-[#E4EAE7]">
          {([["all","Tất cả"],["fie","FIE"],["local","Trong nước"]] as const).map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${filter===key?"border-[#024430] text-[#024430]":"border-transparent text-[#6B7A73] hover:text-[#10231C]"}`}>
              {label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm nhà cung cấp..." className="text-sm border border-[#E4EAE7] rounded-xl px-3 py-2 outline-none focus:border-[#024430] bg-white" />
      </div>

      {/* Table */}
      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  {["Nhà cung cấp","Loại","Quốc gia","Chứng chỉ","SP","Nhập/năm","Đánh giá","Trạng thái",""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className={`border-b border-[#F3F4F6] last:border-0 ${v.status==="probation"?"bg-amber-50":""}`}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-[#10231C]">{v.name}</p>
                      <p className="text-xs text-[#6B7A73]">{v.city}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.type==="FIE"?"bg-violet-100 text-violet-700":"bg-green-100 text-green-700"}`}>{v.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#6B7A73]">{v.country}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {v.certs.slice(0,2).map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0FDF4] text-[#024430] font-medium border border-green-200">{c}</span>)}
                        {v.certs.length > 2 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F6F8F7] text-[#6B7A73] border border-[#E4EAE7]">+{v.certs.length-2}</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm font-semibold text-[#10231C]">{v.products}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-[#10231C]">{(v.revenue/1e9).toFixed(1)}B</td>
                    <td className="py-3 pr-4"><Stars rating={v.rating} /></td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${v.status==="active"?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}`}>
                        {v.status==="active"?"Hoạt động":"Thử nghiệm"}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href={`/supplier/vendors/${v.id}`}>
                        <span className="text-xs font-medium text-[#024430] hover:underline cursor-pointer">Chi tiết →</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
