"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Permission {
  key: string;
  label: string;
}

interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  locked: boolean;
  permissions: Record<string, boolean>;
}

// ─── Permission definitions ───────────────────────────────────────────────────
const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: "Tổng quan & Báo cáo",
    permissions: [
      { key: "dashboard.view", label: "Xem Dashboard" },
      { key: "reports.view", label: "Xem Báo cáo" },
      { key: "reports.export", label: "Xuất Báo cáo" },
      { key: "audit.view", label: "Xem Nhật ký" },
    ],
  },
  {
    group: "Đơn hàng",
    permissions: [
      { key: "orders.view", label: "Xem đơn hàng" },
      { key: "orders.create", label: "Tạo đơn hàng" },
      { key: "orders.approve", label: "Phê duyệt đơn" },
      { key: "orders.reject", label: "Từ chối đơn" },
    ],
  },
  {
    group: "Hợp đồng",
    permissions: [
      { key: "contracts.view", label: "Xem hợp đồng" },
      { key: "contracts.manage", label: "Quản lý hợp đồng" },
    ],
  },
  {
    group: "Kho vận",
    permissions: [
      { key: "inventory.view", label: "Xem tồn kho" },
      { key: "inventory.manage", label: "Quản lý kho" },
      { key: "dispatch.view", label: "Xem điều phối" },
      { key: "dispatch.manage", label: "Quản lý điều phối" },
    ],
  },
  {
    group: "Tài chính",
    permissions: [
      { key: "payments.view", label: "Xem thanh toán" },
      { key: "payments.manage", label: "Quản lý thanh toán" },
    ],
  },
  {
    group: "Gói thầu",
    permissions: [
      { key: "tenders.view", label: "Xem gói thầu" },
      { key: "tenders.manage", label: "Quản lý gói thầu" },
    ],
  },
  {
    group: "Cài đặt",
    permissions: [
      { key: "settings.users", label: "Quản lý người dùng" },
      { key: "settings.roles", label: "Quản lý phân quyền" },
    ],
  },
];

const ALL_PERMISSIONS: Record<string, boolean> = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => ({ [p.key]: true }))
).reduce((acc, cur) => ({ ...acc, ...cur }), {});

// ─── Mock roles ───────────────────────────────────────────────────────────────
const INITIAL_ROLES: Role[] = [
  {
    id: "admin",
    name: "Quản trị viên",
    description: "Toàn quyền truy cập hệ thống",
    userCount: 2,
    locked: true,
    permissions: { ...ALL_PERMISSIONS },
  },
  {
    id: "approver",
    name: "Người phê duyệt đơn",
    description: "Xem và phê duyệt đơn hàng, xem hợp đồng",
    userCount: 3,
    locked: false,
    permissions: {
      "dashboard.view": true,
      "orders.view": true,
      "orders.approve": true,
      "orders.reject": true,
      "contracts.view": true,
      "reports.view": true,
    },
  },
  {
    id: "contract_manager",
    name: "Quản lý Hợp đồng",
    description: "Quản lý hợp đồng và gói thầu",
    userCount: 2,
    locked: false,
    permissions: {
      "dashboard.view": true,
      "contracts.view": true,
      "contracts.manage": true,
      "tenders.view": true,
      "tenders.manage": true,
      "reports.view": true,
    },
  },
  {
    id: "warehouse",
    name: "Vận hành Kho",
    description: "Quản lý tồn kho và điều phối giao hàng",
    userCount: 4,
    locked: false,
    permissions: {
      "dashboard.view": true,
      "inventory.view": true,
      "inventory.manage": true,
      "dispatch.view": true,
      "dispatch.manage": true,
      "orders.view": true,
    },
  },
  {
    id: "accountant",
    name: "Kế toán",
    description: "Quản lý thanh toán và xuất báo cáo tài chính",
    userCount: 2,
    locked: false,
    permissions: {
      "dashboard.view": true,
      "payments.view": true,
      "payments.manage": true,
      "reports.view": true,
      "reports.export": true,
    },
  },
];

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${checked ? "bg-[#024430]" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

// ─── Permission group row (collapsible) ───────────────────────────────────────
function PermGroupSection({
  group,
  permissions,
  rolePerms,
  locked,
  onToggle,
}: {
  group: string;
  permissions: Permission[];
  rolePerms: Record<string, boolean>;
  locked: boolean;
  onToggle: (key: string, val: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const enabledCount = permissions.filter((p) => rolePerms[p.key]).length;

  return (
    <div className="border border-[#E4EAE7] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F6F8F7] hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#10231C]">{group}</span>
          <span className="text-xs text-[#6B7A73]">
            {enabledCount}/{permissions.length}
          </span>
        </div>
        <span className="text-[#6B7A73] text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="divide-y divide-[#E4EAE7]">
          {permissions.map((perm) => (
            <div
              key={perm.key}
              className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-[#F6F8F7]/50 transition-colors"
            >
              <span className="text-sm text-[#10231C]">{perm.label}</span>
              <div className="flex items-center gap-2">
                {locked && (
                  <span className="text-[#6B7A73] text-xs" title="Vai trò hệ thống — không thể chỉnh sửa">
                    🔒
                  </span>
                )}
                <Toggle
                  checked={!!rolePerms[perm.key]}
                  onChange={(v) => onToggle(perm.key, v)}
                  disabled={locked}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("admin");

  const selectedRole = roles.find((r) => r.id === selectedRoleId)!;

  function togglePermission(permKey: string, val: boolean) {
    if (selectedRole.locked) return;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRoleId
          ? { ...r, permissions: { ...r.permissions, [permKey]: val } }
          : r
      )
    );
  }

  return (
    <div>
      <PageHeader
        title="Phân quyền vai trò"
        subtitle="Cài đặt > Phân quyền"
        actions={
          !selectedRole.locked ? (
            <button className="px-4 py-2 bg-[#024430] text-white text-sm font-medium rounded-xl hover:bg-[#013325] transition-colors">
              Lưu thay đổi
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: Role list ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">
            Danh sách vai trò
          </p>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedRoleId === role.id
                  ? "border-[#024430] bg-[#024430]/5"
                  : "border-[#E4EAE7] bg-white hover:bg-[#F6F8F7]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {role.locked && <span className="text-xs">🔒</span>}
                  <span
                    className={`text-sm font-semibold ${
                      selectedRoleId === role.id ? "text-[#024430]" : "text-[#10231C]"
                    }`}
                  >
                    {role.name}
                  </span>
                </div>
                <span className="text-xs text-[#6B7A73] bg-[#F6F8F7] px-1.5 py-0.5 rounded-full border border-[#E4EAE7]">
                  {role.userCount} người
                </span>
              </div>
              <p className="text-xs text-[#6B7A73] mt-1 line-clamp-2">{role.description}</p>
            </button>
          ))}
        </div>

        {/* ── Right: Permission matrix ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    {selectedRole.locked && <span>🔒</span>}
                    <h2 className="text-base font-semibold text-[#10231C]">{selectedRole.name}</h2>
                  </div>
                  <p className="text-xs text-[#6B7A73] mt-0.5">{selectedRole.description}</p>
                </div>
                {selectedRole.locked && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    Vai trò hệ thống — chỉ đọc
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {PERMISSION_GROUPS.map((pg) => (
                  <PermGroupSection
                    key={pg.group}
                    group={pg.group}
                    permissions={pg.permissions}
                    rolePerms={selectedRole.permissions}
                    locked={selectedRole.locked}
                    onToggle={togglePermission}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
