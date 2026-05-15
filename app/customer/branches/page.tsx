"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";

const ACCENT = "#1D4ED8";

interface Branch {
  id: string;
  name: string;
  address: string;
  contact: string;
  phone: string;
  ordersThisMonth: number;
  isMain: boolean;
  active: boolean;
}

const MOCK_BRANCHES: Branch[] = [
  {
    id: "BR-001",
    name: "BV ĐH Y Dược TP.HCM",
    address: "215 Hồng Bàng, Phường 11, Quận 5, TP.HCM",
    contact: "BS. Nguyễn Thị Hương",
    phone: "028 3855 4269",
    ordersThisMonth: 5,
    isMain: true,
    active: true,
  },
  {
    id: "BR-002",
    name: "Phòng khám Thủ Đức",
    address: "120 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM",
    contact: "DS. Trần Minh Tuấn",
    phone: "028 3722 1100",
    ordersThisMonth: 2,
    isMain: false,
    active: true,
  },
  {
    id: "BR-003",
    name: "Kho dược Quận 5",
    address: "56 Nguyễn Chí Thanh, Phường 3, Quận 5, TP.HCM",
    contact: "DS. Lê Thị Lan",
    phone: "028 3950 7788",
    ordersThisMonth: 1,
    isMain: false,
    active: true,
  },
  {
    id: "BR-004",
    name: "Nhà thuốc Nguyễn Trãi",
    address: "348 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM",
    contact: "DS. Phạm Văn Khoa",
    phone: "028 3836 0011",
    ordersThisMonth: 0,
    isMain: false,
    active: false,
  },
];

export default function CustomerBranchesPage() {
  const [branches, setBranches] = useState(MOCK_BRANCHES);
  const [showAddHint, setShowAddHint] = useState(false);

  const activeBranches = branches.filter((b) => b.active).length;
  const totalOrders = branches.reduce((s, b) => s + b.ordersThisMonth, 0);

  return (
    <div>
      <PageHeader
        title="Chi nhánh"
        subtitle="Quản lý chi nhánh mua hàng"
        actions={
          <button
            type="button"
            onClick={() => setShowAddHint(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: ACCENT }}>
            + Thêm chi nhánh
          </button>
        }
      />

      {showAddHint && (
        <div className="mb-4 p-4 rounded-xl flex items-center gap-3"
          style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <span className="text-lg">ℹ️</span>
          <p className="text-sm" style={{ color: ACCENT }}>
            Tính năng thêm chi nhánh đang được phát triển. Vui lòng liên hệ hỗ trợ để thêm chi nhánh mới.
          </p>
          <button onClick={() => setShowAddHint(false)} className="ml-auto text-xs font-medium hover:opacity-70"
            style={{ color: ACCENT }}>Đóng</button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Chi nhánh đang HĐ", value: activeBranches.toString(),      icon: "🏢" },
          { label: "Tổng chi nhánh",    value: branches.length.toString(),     icon: "📍" },
          { label: "Đơn hàng tháng này",value: totalOrders.toString(),          icon: "🛒" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#E4EAE7] rounded-2xl p-4 text-center">
            <p className="text-xl mb-1">{kpi.icon}</p>
            <p className="text-lg font-bold text-[#10231C]">{kpi.value}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Branch cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className={`border-2 hover:shadow-md transition-shadow ${
            branch.isMain ? "border-[#1D4ED8]/30" : branch.active ? "border-[#E4EAE7]" : "border-[#E4EAE7] opacity-60"
          }`}>
            <CardBody className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-[#10231C] text-base leading-tight">{branch.name}</h3>
                    {branch.isMain && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ backgroundColor: ACCENT }}>
                        Trụ sở chính
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  branch.active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {branch.active ? "Hoạt động" : "Tạm ngưng"}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0">📍</span>
                  <p className="text-xs text-[#6B7A73]">{branch.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">👤</span>
                  <p className="text-xs text-[#10231C] font-medium">{branch.contact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">📞</span>
                  <p className="text-xs text-[#6B7A73]">{branch.phone}</p>
                </div>
              </div>

              {/* Orders this month */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E4EAE7]">
                <p className="text-xs text-[#6B7A73]">Đơn hàng tháng này</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#10231C]">{branch.ordersThisMonth}</span>
                  <span className="text-xs text-[#6B7A73]">đơn</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setBranches((prev) =>
                      prev.map((b) =>
                        b.id === branch.id ? { ...b, active: !b.active } : b
                      )
                    )
                  }
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7] transition-colors"
                >
                  {branch.active ? "Tạm ngưng" : "Kích hoạt"}
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 text-xs font-semibold rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: ACCENT }}
                >
                  Xem chi tiết
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
