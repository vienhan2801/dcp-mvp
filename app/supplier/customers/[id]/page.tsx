"use client";
import { use, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { BarChart, DonutChart } from "@/components/Charts";

const ACCENT = "#024430";

const CUSTOMERS: Record<string, {
  id: string; name: string; type: string; city: string; address: string;
  taxCode: string; size: string; specialty: string;
  creditLimit: number; usedCredit: number;
  rank: string; status: string;
  contracts: { id: string; name: string; value: number; expiry: string }[];
  contacts: { name: string; title: string; dept: string; phone: string; email: string }[];
  recentOrders: { id: string; date: string; total: number; status: string }[];
  monthlyRevenue: { label: string; value: number }[];
}> = {
  "KH-001": {
    id: "KH-001", name: "Bệnh viện Chợ Rẫy", type: "Bệnh viện công", city: "TP.HCM",
    address: "201B Nguyễn Chí Thanh, Q.5, TP.HCM", taxCode: "0300686086",
    size: "1.800 giường", specialty: "Đa khoa",
    creditLimit: 5_000_000_000, usedCredit: 1_800_000_000,
    rank: "Platinum", status: "active",
    contracts: [
      { id: "CT-2026-001", name: "Cung cấp thuốc thiết yếu 2026", value: 2_800_000_000, expiry: "31/12/2026" },
      { id: "CT-2026-005", name: "Kháng sinh đặc biệt 2026",      value: 960_000_000,  expiry: "31/12/2026" },
    ],
    contacts: [
      { name: "GS.TS Nguyễn Văn An",   title: "Giám đốc",                  dept: "Ban Giám đốc",    phone: "0901 111 222", email: "nvgd@choray.vn" },
      { name: "ThS. Trần Thị Bình",    title: "Trưởng khoa Dược",          dept: "Khoa Dược",       phone: "0901 333 444", email: "ttb@choray.vn"  },
      { name: "CN. Lê Minh Cường",     title: "Phụ trách mua sắm",         dept: "Phòng Vật tư",   phone: "0901 555 666", email: "lmc@choray.vn"  },
      { name: "KS. Phạm Thu Hà",       title: "Kế toán trưởng",            dept: "Phòng Tài chính", phone: "0901 777 888", email: "pth@choray.vn"  },
    ],
    recentOrders: [
      { id: "ORD-2026-001", date: "02/05/2026", total: 240_000_000, status: "Đã giao" },
      { id: "ORD-2026-003", date: "10/05/2026", total: 180_000_000, status: "Đang giao" },
      { id: "ORD-2026-005", date: "14/05/2026", total: 95_000_000,  status: "Đang chuẩn bị" },
      { id: "ORD-2026-007", date: "08/04/2026", total: 320_000_000, status: "Đã giao" },
    ],
    monthlyRevenue: [
      { label: "T12", value: 280_000_000 }, { label: "T1", value: 310_000_000 },
      { label: "T2", value: 290_000_000 }, { label: "T3", value: 420_000_000 },
      { label: "T4", value: 380_000_000 }, { label: "T5", value: 515_000_000 },
    ],
  },
  "KH-002": {
    id: "KH-002", name: "BV Đại học Y Dược TP.HCM", type: "Bệnh viện công", city: "TP.HCM",
    address: "215 Hồng Bàng, Q.5, TP.HCM", taxCode: "0300560312",
    size: "1.000 giường", specialty: "Đa khoa, Nghiên cứu",
    creditLimit: 3_000_000_000, usedCredit: 780_000_000,
    rank: "Gold", status: "active",
    contracts: [
      { id: "CT-2026-002", name: "Cung cấp kháng sinh 2026", value: 1_200_000_000, expiry: "31/12/2026" },
    ],
    contacts: [
      { name: "PGS.TS Lê Văn Dũng",   title: "Giám đốc",          dept: "Ban Giám đốc", phone: "0902 111 222", email: "lvd@umc.edu.vn" },
      { name: "ThS. Nguyễn Thị Hoa",  title: "Trưởng khoa Dược",  dept: "Khoa Dược",    phone: "0902 333 444", email: "nth@umc.edu.vn" },
      { name: "CN. Trần Minh Khoa",   title: "Phụ trách mua sắm", dept: "Phòng Vật tư", phone: "0902 555 666", email: "tmk@umc.edu.vn" },
    ],
    recentOrders: [
      { id: "ORD-2026-004", date: "08/05/2026", total: 180_000_000, status: "Chờ phê duyệt" },
      { id: "ORD-2026-008", date: "15/04/2026", total: 220_000_000, status: "Đã giao" },
    ],
    monthlyRevenue: [
      { label: "T12", value: 120_000_000 }, { label: "T1", value: 145_000_000 },
      { label: "T2", value: 130_000_000 }, { label: "T3", value: 180_000_000 },
      { label: "T4", value: 165_000_000 }, { label: "T5", value: 180_000_000 },
    ],
  },
};

const RANK_COLORS: Record<string, string> = {
  Platinum: "bg-purple-100 text-purple-700",
  Gold:     "bg-amber-100 text-amber-700",
  Silver:   "bg-slate-100 text-slate-600",
  Bronze:   "bg-orange-100 text-orange-700",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  "Đã giao":        "bg-green-100 text-green-700",
  "Đang giao":      "bg-blue-100 text-blue-700",
  "Đang chuẩn bị":  "bg-orange-100 text-orange-700",
  "Chờ phê duyệt":  "bg-yellow-100 text-yellow-700",
};

function fmtVND(n: number) { return (n / 1e6).toFixed(0) + "M ₫"; }
function fmtB(n: number) { return n >= 1e9 ? (n / 1e9).toFixed(1) + " tỷ ₫" : (n / 1e6).toFixed(0) + "M ₫"; }

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<"info" | "contacts" | "history">("info");
  const customer = CUSTOMERS[id] ?? CUSTOMERS["KH-001"];
  const usedPct = Math.round((customer.usedCredit / customer.creditLimit) * 100);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Link href="/supplier/customers">
        <span className="text-xs text-[#6B7A73] hover:text-[#10231C] cursor-pointer">← Danh sách khách hàng</span>
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <PageHeader title={customer.name} subtitle={customer.type + " · " + customer.city} />
        <div className="flex gap-2 items-center">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${RANK_COLORS[customer.rank]}`}>{customer.rank}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${customer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {customer.status === "active" ? "Đang hoạt động" : "Tạm ngưng"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4EAE7]">
        {(["info","contacts","history"] as const).map(t => {
          const labels = { info: "Thông tin", contacts: "Đầu mối liên hệ", history: "Lịch sử giao dịch" };
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-[#024430] text-[#024430]" : "border-transparent text-[#6B7A73] hover:text-[#10231C]"}`}>
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Tab: Thông tin */}
      {tab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card>
              <CardHeader><h3 className="font-semibold text-[#10231C]">Thông tin cơ sở</h3></CardHeader>
              <CardBody className="pt-0 flex flex-col gap-3">
                {[
                  { label: "Địa chỉ",       value: customer.address },
                  { label: "Mã số thuế",     value: customer.taxCode },
                  { label: "Loại hình",      value: customer.type },
                  { label: "Quy mô",         value: customer.size },
                  { label: "Chuyên khoa",    value: customer.specialty },
                  { label: "Thành phố",      value: customer.city },
                ].map(r => (
                  <div key={r.label} className="flex gap-3">
                    <span className="text-xs text-[#6B7A73] w-28 flex-shrink-0 pt-0.5">{r.label}</span>
                    <span className="text-sm font-medium text-[#10231C]">{r.value}</span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-semibold text-[#10231C]">Hợp đồng hiện hành</h3></CardHeader>
              <CardBody className="pt-0 flex flex-col gap-2">
                {customer.contracts.map(c => (
                  <Link key={c.id} href={`/supplier/contracts/${c.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F8F7] border border-[#E4EAE7] hover:border-[#024430] transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-semibold text-[#10231C]">{c.name}</p>
                        <p className="text-xs text-[#6B7A73]">{c.id} · Hết hạn {c.expiry}</p>
                      </div>
                      <span className="text-sm font-bold text-[#024430]">{fmtVND(c.value)}</span>
                    </div>
                  </Link>
                ))}
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader><h3 className="font-semibold text-[#10231C]">Hạn mức tín dụng</h3></CardHeader>
              <CardBody className="pt-0">
                <div className="flex items-center gap-4">
                  <DonutChart value={customer.usedCredit} max={customer.creditLimit}
                    label={`${usedPct}%`} sublabel="đã dùng"
                    color={usedPct > 80 ? "#EF4444" : ACCENT} size={100} thickness={10} showPercent={false} />
                  <div className="flex flex-col gap-2">
                    <div><p className="text-[10px] text-[#6B7A73]">Hạn mức tổng</p><p className="text-sm font-bold">{fmtB(customer.creditLimit)}</p></div>
                    <div><p className="text-[10px] text-[#6B7A73]">Đã sử dụng</p><p className="text-sm font-bold text-orange-600">{fmtB(customer.usedCredit)}</p></div>
                    <div><p className="text-[10px] text-[#6B7A73]">Còn lại</p><p className="text-sm font-bold text-green-600">{fmtB(customer.creditLimit - customer.usedCredit)}</p></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-semibold text-[#10231C]">Ghi chú nội bộ</h3></CardHeader>
              <CardBody className="pt-0">
                <textarea className="w-full h-24 text-sm text-[#10231C] bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl p-3 resize-none outline-none focus:border-[#024430]"
                  placeholder="Thêm ghi chú về khách hàng..." />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Đầu mối liên hệ */}
      {tab === "contacts" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.contacts.map((c, i) => {
              const colors = ["bg-[#024430]","bg-blue-600","bg-violet-600","bg-teal-600"];
              return (
                <Card key={i}>
                  <CardBody>
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {c.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#10231C]">{c.name}</p>
                        <p className="text-xs text-[#6B7A73]">{c.title}</p>
                        <p className="text-xs text-[#6B7A73] mt-0.5">{c.dept}</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-xs text-[#10231C] flex items-center gap-1.5">📞 {c.phone}</p>
                          <p className="text-xs text-[#10231C] flex items-center gap-1.5">✉ {c.email}</p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
          <button className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl border-2 border-dashed border-[#E4EAE7] text-[#6B7A73] hover:border-[#024430] hover:text-[#024430] transition-colors w-full">
            + Thêm đầu mối liên hệ
          </button>
        </div>
      )}

      {/* Tab: Lịch sử giao dịch */}
      {tab === "history" && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Doanh thu 6 tháng</h3></CardHeader>
            <CardBody>
              <BarChart data={customer.monthlyRevenue} color={ACCENT} height={160}
                formatValue={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : `${(v/1e6).toFixed(0)}M`} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3></CardHeader>
            <CardBody className="pt-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7]">
                    {["Mã đơn","Ngày đặt","Giá trị","Trạng thái"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customer.recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-[#024430]">{o.id}</td>
                      <td className="py-3 pr-4 text-xs text-[#6B7A73]">{o.date}</td>
                      <td className="py-3 pr-4 font-semibold text-[#10231C]">{fmtVND(o.total)}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
