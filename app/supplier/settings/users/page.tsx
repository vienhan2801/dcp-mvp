"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserStatus = "active" | "inactive";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  status: UserStatus;
  lastLogin: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Nguyễn Văn Minh",
    email: "minh.nguyen@pharma.vn",
    role: "supplier_admin",
    roleLabel: "Quản trị viên",
    status: "active",
    lastLogin: "15/05/2026 09:12",
  },
  {
    id: 2,
    name: "Trần Thị Hoa",
    email: "hoa.tran@pharma.vn",
    role: "supplier_admin",
    roleLabel: "Quản trị viên",
    status: "active",
    lastLogin: "14/05/2026 16:45",
  },
  {
    id: 3,
    name: "Lê Quang Hải",
    email: "hai.le@pharma.vn",
    role: "supplier_approver",
    roleLabel: "Người phê duyệt đơn",
    status: "active",
    lastLogin: "15/05/2026 08:30",
  },
  {
    id: 4,
    name: "Phạm Thị Lan",
    email: "lan.pham@pharma.vn",
    role: "supplier_approver",
    roleLabel: "Người phê duyệt đơn",
    status: "active",
    lastLogin: "13/05/2026 11:20",
  },
  {
    id: 5,
    name: "Hoàng Văn Tuấn",
    email: "tuan.hoang@pharma.vn",
    role: "supplier_contract",
    roleLabel: "Quản lý Hợp đồng",
    status: "active",
    lastLogin: "15/05/2026 07:55",
  },
  {
    id: 6,
    name: "Đỗ Thị Mai",
    email: "mai.do@pharma.vn",
    role: "supplier_logistics",
    roleLabel: "Vận hành Kho",
    status: "active",
    lastLogin: "15/05/2026 06:40",
  },
  {
    id: 7,
    name: "Vũ Đình Khoa",
    email: "khoa.vu@pharma.vn",
    role: "supplier_logistics",
    roleLabel: "Vận hành Kho",
    status: "inactive",
    lastLogin: "01/04/2026 14:10",
  },
  {
    id: 8,
    name: "Bùi Thanh Nga",
    email: "nga.bui@pharma.vn",
    role: "supplier_finance",
    roleLabel: "Kế toán",
    status: "active",
    lastLogin: "14/05/2026 17:00",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: UserStatus }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Đang hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Vô hiệu hóa
    </span>
  );
}

function RoleChip({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#F6F8F7] border border-[#E4EAE7] text-[#10231C]">
      {label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#024430] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [showAddModal, setShowAddModal] = useState(false);

  function toggleStatus(id: number) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  }

  const activeCount = users.filter((u) => u.status === "active").length;

  return (
    <div>
      <PageHeader
        title="Quản lý Người dùng"
        subtitle="Cài đặt > Người dùng"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#024430] text-white text-sm font-medium rounded-xl hover:bg-[#013325] transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Thêm người dùng
          </button>
        }
      />

      {/* Summary bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#6B7A73]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{activeCount} đang hoạt động</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[#6B7A73]">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span>{users.length - activeCount} vô hiệu hóa</span>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                  {["Tên", "Email", "Vai trò", "Trạng thái", "Đăng nhập lần cuối", "Hành động"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE7]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} />
                        <span className="font-medium text-[#10231C]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7A73]">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleChip label={user.roleLabel} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-[#6B7A73] text-xs">{user.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs font-medium text-[#024430] hover:underline">
                          Chỉnh sửa
                        </button>
                        <span className="text-[#E4EAE7]">|</span>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`text-xs font-medium hover:underline ${
                            user.status === "active" ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Simple add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-5 border-b border-[#E4EAE7]">
              <h2 className="text-base font-semibold text-[#10231C]">Thêm người dùng mới</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B7A73] mb-1">Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-[#E4EAE7] rounded-xl px-3 py-2 text-sm text-[#10231C] placeholder-[#6B7A73] focus:outline-none focus:ring-2 focus:ring-[#024430]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A73] mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@pharma.vn"
                  className="w-full border border-[#E4EAE7] rounded-xl px-3 py-2 text-sm text-[#10231C] placeholder-[#6B7A73] focus:outline-none focus:ring-2 focus:ring-[#024430]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A73] mb-1">Vai trò</label>
                <select className="w-full border border-[#E4EAE7] rounded-xl px-3 py-2 text-sm text-[#10231C] focus:outline-none focus:ring-2 focus:ring-[#024430]/30 bg-white">
                  <option value="">Chọn vai trò...</option>
                  <option value="supplier_admin">Quản trị viên</option>
                  <option value="supplier_approver">Người phê duyệt đơn</option>
                  <option value="supplier_contract">Quản lý Hợp đồng</option>
                  <option value="supplier_logistics">Vận hành Kho</option>
                  <option value="supplier_finance">Kế toán</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E4EAE7] flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#E4EAE7] rounded-xl text-sm text-[#6B7A73] hover:bg-[#F6F8F7] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#024430] text-white text-sm font-medium rounded-xl hover:bg-[#013325] transition-colors"
              >
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
