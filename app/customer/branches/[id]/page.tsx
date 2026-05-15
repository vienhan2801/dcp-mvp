"use client";
import { use } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { DonutChart } from "@/components/Charts";

const ACCENT = "#1D4ED8";

// ── Mock branch data ──────────────────────────────────────────────────────────
const BRANCHES: Record<string, {
  id: string; name: string; type: string; address: string; contact: string; manager: string;
  creditLimit: number; usedCredit: number; status: string;
  deliveryAddresses: { label: string; address: string }[];
  orders: { id: string; date: string; total: number; status: string }[];
}> = {
  "BR-001": {
    id: "BR-001",
    name: "Bệnh viện Trung tâm (Trụ sở chính)",
    type: "Trụ sở chính",
    address: "201B Nguyễn Chí Thanh, Phường 12, Q.5, TP.HCM",
    contact: "0901 234 567",
    manager: "Nguyễn Thị Mai",
    creditLimit: 2_000_000_000,
    usedCredit: 780_000_000,
    status: "Đang hoạt động",
    deliveryAddresses: [
      { label: "Kho dược chính", address: "201B Nguyễn Chí Thanh, Tầng B1, Q.5, TP.HCM" },
      { label: "Kho vật tư y tế", address: "201B Nguyễn Chí Thanh, Tầng B2, Q.5, TP.HCM" },
    ],
    orders: [
      { id: "ORD-2026-001", date: "02/05/2026", total: 240_000_000, status: "Đã nhận hàng" },
      { id: "ORD-2026-003", date: "10/05/2026", total: 180_000_000, status: "Đang giao"    },
      { id: "ORD-2026-005", date: "14/05/2026", total: 95_000_000,  status: "Đang chuẩn bị" },
    ],
  },
  "BR-002": {
    id: "BR-002",
    name: "Chi nhánh Quận 7",
    type: "Chi nhánh",
    address: "50 Nguyễn Thị Thập, Phường Tân Hưng, Q.7, TP.HCM",
    contact: "0901 765 432",
    manager: "Trần Văn Bình",
    creditLimit: 800_000_000,
    usedCredit: 320_000_000,
    status: "Đang hoạt động",
    deliveryAddresses: [
      { label: "Kho dược chi nhánh", address: "50 Nguyễn Thị Thập, Tầng 1, Q.7, TP.HCM" },
    ],
    orders: [
      { id: "ORD-2026-007", date: "08/05/2026", total: 120_000_000, status: "Đã nhận hàng" },
      { id: "ORD-2026-008", date: "12/05/2026", total: 85_000_000,  status: "Đang giao"    },
    ],
  },
  "BR-003": {
    id: "BR-003",
    name: "Phòng khám Đa khoa Q.Bình Thạnh",
    type: "Phòng khám",
    address: "72 Bạch Đằng, Phường 2, Q.Bình Thạnh, TP.HCM",
    contact: "0908 123 456",
    manager: "Lê Thị Hoa",
    creditLimit: 500_000_000,
    usedCredit: 110_000_000,
    status: "Đang hoạt động",
    deliveryAddresses: [
      { label: "Kho dược phòng khám", address: "72 Bạch Đằng, Tầng trệt, Q.Bình Thạnh, TP.HCM" },
    ],
    orders: [
      { id: "ORD-2026-009", date: "05/05/2026", total: 60_000_000,  status: "Đã nhận hàng" },
      { id: "ORD-2026-010", date: "13/05/2026", total: 50_000_000,  status: "Đang chuẩn bị" },
    ],
  },
};

const STATUS_ORDER_COLORS: Record<string, string> = {
  "Đã nhận hàng":  "bg-green-100 text-green-700",
  "Đang giao":     "bg-blue-100 text-blue-700",
  "Đang chuẩn bị": "bg-orange-100 text-orange-700",
};

function fmtVND(n: number) { return (n / 1e6).toFixed(0) + "M ₫"; }

export default function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const branch = BRANCHES[id] ?? BRANCHES["BR-001"];

  const remaining = branch.creditLimit - branch.usedCredit;
  const usedPct = Math.round((branch.usedCredit / branch.creditLimit) * 100);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Back */}
      <div>
        <Link href="/customer/branches">
          <span className="inline-flex items-center gap-1 text-xs text-[#6B7A73] hover:text-[#10231C] cursor-pointer">
            ← Danh sách chi nhánh
          </span>
        </Link>
      </div>

      <PageHeader title={branch.name} subtitle={branch.type} />

      {/* Top two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Info card */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[#10231C]">Thông tin chi nhánh</h3>
          </CardHeader>
          <CardBody className="pt-0 flex flex-col gap-3">
            {[
              { label: "Địa chỉ",      value: branch.address },
              { label: "Liên hệ",      value: branch.contact },
              { label: "Người quản lý",value: branch.manager },
              { label: "Loại đơn vị",  value: branch.type },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <span className="text-xs text-[#6B7A73] w-28 flex-shrink-0 pt-0.5">{row.label}</span>
                <span className="text-sm font-medium text-[#10231C] flex-1">{row.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6B7A73] w-28 flex-shrink-0">Trạng thái</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                ● {branch.status}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Credit limit card */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[#10231C]">Hạn mức tín dụng</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="flex items-center gap-6">
              <DonutChart
                value={branch.usedCredit}
                max={branch.creditLimit}
                label={`${usedPct}%`}
                sublabel="đã dùng"
                color={usedPct > 80 ? "#EF4444" : ACCENT}
                size={110}
                thickness={12}
                showPercent={false}
              />
              <div className="flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-[10px] text-[#6B7A73]">Hạn mức tổng</p>
                  <p className="text-base font-bold text-[#10231C]">{(branch.creditLimit / 1e9).toFixed(1)} tỷ ₫</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-[#6B7A73]">Đã sử dụng</p>
                    <p className="text-sm font-bold text-blue-700">{fmtVND(branch.usedCredit)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7A73]">Còn khả dụng</p>
                    <p className="text-sm font-bold text-green-700">{fmtVND(remaining)}</p>
                  </div>
                </div>
                {/* progress bar */}
                <div className="w-full h-2 bg-[#E4EAE7] rounded-full overflow-hidden">
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${usedPct}%`, backgroundColor: usedPct > 80 ? "#EF4444" : ACCENT }} />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3>
          <Link href="/customer/orders">
            <span className="text-xs font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>Xem tất cả →</span>
          </Link>
        </CardHeader>
        <CardBody className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4EAE7]">
                {["Mã đơn", "Ngày đặt", "Giá trị", "Trạng thái"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branch.orders.map((o) => (
                <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs font-bold" style={{ color: ACCENT }}>{o.id}</td>
                  <td className="py-3 pr-4 text-[#6B7A73]">{o.date}</td>
                  <td className="py-3 pr-4 font-semibold text-[#10231C]">{fmtVND(o.total)}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_ORDER_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Delivery addresses */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Địa chỉ giao hàng</h3>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-3">
          {branch.deliveryAddresses.map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F6F8F7] border border-[#E4EAE7]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: ACCENT + "18" }}>
                📦
              </div>
              <div>
                <p className="text-sm font-semibold text-[#10231C]">{a.label}</p>
                <p className="text-xs text-[#6B7A73] mt-0.5">{a.address}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
