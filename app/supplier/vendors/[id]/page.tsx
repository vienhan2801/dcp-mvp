"use client";
import { use, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { BarChart } from "@/components/Charts";

const ACCENT = "#024430";

const VENDORS: Record<string, {
  id: string; name: string; type: string; category: string; country: string; city: string;
  address: string; taxCode: string; registrationNumber: string; paymentTerms: string; rating: number; status: string;
  certs: { name: string; number: string; issuer: string; expiry: string; status: "valid"|"expiring"|"expired" }[];
  contacts: { name: string; title: string; phone: string; email: string }[];
  products: { name: string; form: string; unit: string; importPrice: number; stock: number }[];
  orders: { id: string; date: string; drug: string; qty: string; value: number; status: string }[];
  monthlyPurchase: { label: string; value: number }[];
}> = {
  "NCC-001": {
    id: "NCC-001", name: "VinPharma Corp", type: "Trong nước", category: "Sản xuất",
    country: "Việt Nam", city: "Hà Nội",
    address: "12 Đường Láng, Đống Đa, Hà Nội", taxCode: "0101234567",
    registrationNumber: "GP.VN-001/2020", paymentTerms: "Net 60", rating: 4.8, status: "active",
    certs: [
      { name: "GMP-WHO",   number: "GMP-2023-001", issuer: "Cục Quản lý Dược", expiry: "31/12/2026", status: "valid"    },
      { name: "GDP",       number: "GDP-2024-015", issuer: "Cục Quản lý Dược", expiry: "15/08/2026", status: "expiring" },
      { name: "ISO 9001",  number: "ISO-VN-4521",  issuer: "Bureau Veritas",    expiry: "01/03/2025", status: "expired"  },
    ],
    contacts: [
      { name: "Nguyễn Văn Thắng",  title: "Giám đốc kinh doanh", phone: "0911 222 333", email: "nvt@vinpharma.vn" },
      { name: "Trần Thị Lan",      title: "Phụ trách xuất nhập",  phone: "0911 444 555", email: "ttl@vinpharma.vn" },
    ],
    products: [
      { name: "Paracetamol 500mg",   form: "Viên nén",  unit: "Viên", importPrice: 750,    stock: 90_000 },
      { name: "Amoxicillin 500mg",   form: "Viên nang", unit: "Viên", importPrice: 1_100,  stock: 48_000 },
      { name: "Omeprazole 20mg",     form: "Viên nang", unit: "Viên", importPrice: 2_500,  stock: 200    },
      { name: "Azithromycin 500mg",  form: "Viên nang", unit: "Viên", importPrice: 3_200,  stock: 20_000 },
    ],
    orders: [
      { id: "PO-2026-001", date: "02/05/2026", drug: "Paracetamol + Amoxicillin", qty: "42.000 đv", value: 38_400_000, status: "Đang xử lý" },
      { id: "PO-2026-003", date: "05/04/2026", drug: "Paracetamol + Omeprazole",  qty: "33.000 đv", value: 42_400_000, status: "Hoàn thành" },
    ],
    monthlyPurchase: [
      { label: "T12", value: 180_000_000 }, { label: "T1", value: 220_000_000 },
      { label: "T2", value: 195_000_000 }, { label: "T3", value: 260_000_000 },
      { label: "T4", value: 240_000_000 }, { label: "T5", value: 280_000_000 },
    ],
  },
  "NCC-005": {
    id: "NCC-005", name: "EuroPharma GmbH", type: "FIE", category: "Nhập khẩu",
    country: "Đức", city: "Frankfurt",
    address: "Industriestr. 42, 60599 Frankfurt am Main, Germany", taxCode: "DE123456789",
    registrationNumber: "EU-PHARMA-2019-045", paymentTerms: "Net 90", rating: 4.9, status: "active",
    certs: [
      { name: "GMP-EU",    number: "EU-GMP-2022-007", issuer: "EMA",            expiry: "30/06/2027", status: "valid" },
      { name: "GDP",       number: "GDP-EU-2023-019",  issuer: "BfArM Germany",  expiry: "15/11/2026", status: "valid" },
      { name: "ISO 13485", number: "ISO-EU-9981",      issuer: "TÜV SÜD",        expiry: "20/04/2025", status: "expired" },
    ],
    contacts: [
      { name: "Hans Weber",       title: "Export Manager",     phone: "+49 69 1234 5678", email: "h.weber@europharma.de" },
      { name: "Anna Müller",      title: "Quality Assurance",  phone: "+49 69 1234 5679", email: "a.mueller@europharma.de" },
    ],
    products: [
      { name: "Ceftriaxone 1g",    form: "Bột tiêm",  unit: "Lọ",   importPrice: 42_000, stock: 1_500 },
      { name: "Insulin Glargine",  form: "Dung dịch", unit: "Lọ",   importPrice: 320_000, stock: 200  },
    ],
    orders: [
      { id: "PO-2026-002", date: "20/04/2026", drug: "Ceftriaxone 1g + Azithromycin", qty: "5.300 đv", value: 51_750_000, status: "Đã giao" },
    ],
    monthlyPurchase: [
      { label: "T12", value: 80_000_000 }, { label: "T1", value: 95_000_000 },
      { label: "T2", value: 88_000_000 }, { label: "T3", value: 110_000_000 },
      { label: "T4", value: 105_000_000 }, { label: "T5", value: 120_000_000 },
    ],
  },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"} style={{ fontSize: 14 }}>★</span>
      ))}
      <span className="text-sm font-bold text-[#10231C] ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

const CERT_STATUS = {
  valid:    { label: "Còn hiệu lực", cls: "bg-green-100 text-green-700"  },
  expiring: { label: "Sắp hết hạn",  cls: "bg-amber-100 text-amber-700"  },
  expired:  { label: "Hết hạn",      cls: "bg-red-100 text-red-700"      },
};

const PO_STATUS_COLORS: Record<string, string> = {
  "Đang xử lý": "bg-orange-100 text-orange-700",
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đã giao":    "bg-blue-100 text-blue-700",
};

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<"info"|"certs"|"products"|"orders">("info");
  const v = VENDORS[id] ?? VENDORS["NCC-001"];

  const hasIssue = v.certs.some(c => c.status !== "valid");

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Link href="/supplier/vendors">
        <span className="text-xs text-[#6B7A73] hover:text-[#10231C] cursor-pointer">← Danh sách nhà cung cấp</span>
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <PageHeader title={v.name} subtitle={v.category + " · " + v.country} />
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.type==="FIE"?"bg-violet-100 text-violet-700":"bg-green-100 text-green-700"}`}>{v.type}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.status==="active"?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}`}>
            {v.status==="active"?"Hoạt động":"Thử nghiệm"}
          </span>
        </div>
      </div>

      {hasIssue && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <span>⚠️</span>
          <p className="text-sm font-medium text-amber-800">
            {v.certs.filter(c=>c.status==="expired").length > 0 && "Có chứng chỉ đã hết hạn. "}
            {v.certs.filter(c=>c.status==="expiring").length > 0 && "Có chứng chỉ sắp hết hạn trong 6 tháng. "}
            Cần cập nhật để tránh gián đoạn nhập hàng.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4EAE7]">
        {([["info","Thông tin"],["certs","Chứng chỉ"],["products","Sản phẩm cung cấp"],["orders","Lịch sử đặt hàng"]] as const).map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab===key?"border-[#024430] text-[#024430]":"border-transparent text-[#6B7A73] hover:text-[#10231C]"}`}>
            {label}
            {key==="certs" && hasIssue && <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500 inline-block" />}
          </button>
        ))}
      </div>

      {/* Tab: Thông tin */}
      {tab==="info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Thông tin công ty</h3></CardHeader>
            <CardBody className="pt-0 flex flex-col gap-3">
              {[
                { label: "Địa chỉ",        value: v.address },
                { label: "Mã số thuế",     value: v.taxCode },
                { label: "Số đăng ký",     value: v.registrationNumber },
                { label: "Quốc gia",       value: v.country },
                { label: "Điều khoản TT",  value: v.paymentTerms },
              ].map(r => (
                <div key={r.label} className="flex gap-3">
                  <span className="text-xs text-[#6B7A73] w-28 flex-shrink-0 pt-0.5">{r.label}</span>
                  <span className="text-sm font-medium text-[#10231C]">{r.value}</span>
                </div>
              ))}
              <div className="flex gap-3 items-center pt-1 border-t border-[#E4EAE7]">
                <span className="text-xs text-[#6B7A73] w-28">Đánh giá</span>
                <Stars rating={v.rating} />
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader><h3 className="font-semibold text-[#10231C]">Giá trị đặt hàng 6 tháng</h3></CardHeader>
              <CardBody>
                <BarChart data={v.monthlyPurchase} color={ACCENT} height={130}
                  formatValue={val => val>=1e9?`${(val/1e9).toFixed(1)}B`:`${(val/1e6).toFixed(0)}M`} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader><h3 className="font-semibold text-[#10231C]">Đầu mối liên hệ</h3></CardHeader>
              <CardBody className="pt-0 flex flex-col gap-3">
                {v.contacts.map((c,i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#024430] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.name.split(" ").pop()?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#10231C]">{c.name}</p>
                      <p className="text-xs text-[#6B7A73]">{c.title}</p>
                      <p className="text-xs text-[#10231C]">📞 {c.phone}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Chứng chỉ */}
      {tab==="certs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {v.certs.map((c,i) => {
            const cfg = CERT_STATUS[c.status];
            return (
              <Card key={i}>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-xl">
                      {c.status==="valid"?"✅":c.status==="expiring"?"⚠️":"❌"}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <p className="font-bold text-[#10231C]">{c.name}</p>
                  <p className="text-xs text-[#6B7A73] mt-1">Số: {c.number}</p>
                  <p className="text-xs text-[#6B7A73]">Cấp bởi: {c.issuer}</p>
                  <p className={`text-xs font-semibold mt-2 ${c.status==="expired"?"text-red-600":c.status==="expiring"?"text-amber-600":"text-[#6B7A73]"}`}>
                    Hết hạn: {c.expiry}
                  </p>
                  <button className="mt-3 text-xs font-semibold text-[#024430] hover:underline">Xem tài liệu →</button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab: Sản phẩm */}
      {tab==="products" && (
        <Card>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  {["Tên sản phẩm","Dạng bào chế","Đơn vị","Đơn giá nhập","Tồn kho hiện tại"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.products.map((p,i)=>(
                  <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-3 pr-4 font-semibold text-[#10231C]">{p.name}</td>
                    <td className="py-3 pr-4 text-[#6B7A73]">{p.form}</td>
                    <td className="py-3 pr-4 text-[#6B7A73]">{p.unit}</td>
                    <td className="py-3 pr-4 font-semibold text-[#10231C]">{p.importPrice.toLocaleString("vi-VN")} ₫</td>
                    <td className={`py-3 font-semibold ${p.stock < 500?"text-red-600":"text-green-700"}`}>
                      {p.stock.toLocaleString("vi-VN")} {p.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Tab: Lịch sử đặt hàng */}
      {tab==="orders" && (
        <Card>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  {["Mã PO","Ngày đặt","Hàng hóa","Số lượng","Giá trị","Trạng thái"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.orders.map(o=>(
                  <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs font-bold text-[#024430]">{o.id}</td>
                    <td className="py-3 pr-4 text-xs text-[#6B7A73]">{o.date}</td>
                    <td className="py-3 pr-4 text-xs text-[#6B7A73] max-w-[180px] truncate">{o.drug}</td>
                    <td className="py-3 pr-4 text-sm text-[#10231C]">{o.qty}</td>
                    <td className="py-3 pr-4 font-semibold text-[#10231C]">{(o.value/1e6).toFixed(1)}M ₫</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PO_STATUS_COLORS[o.status]??"bg-gray-100 text-gray-700"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
