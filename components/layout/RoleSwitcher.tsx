"use client";
import { useApp } from "@/lib/store";
import { UserRole } from "@/domain/models/evidence";
import { useRouter } from "next/navigation";

const ROLES: { key: UserRole; label: string; path: string; group: string }[] = [
  // Nhà cung cấp
  { key: "manufacturer_admin",      label: "NCC - Quản trị",    path: "/manufacturer/dashboard", group: "🏭 Nhà cung cấp" },
  { key: "manufacturer_logistics",  label: "NCC - Kho vận",     path: "/manufacturer/inventory", group: "🏭 Nhà cung cấp" },
  { key: "manufacturer_finance",    label: "NCC - Tài chính",   path: "/manufacturer/catalog",   group: "🏭 Nhà cung cấp" },
  // NPP
  { key: "supplier_admin",          label: "NPP - Quản trị",    path: "/supplier/dashboard",     group: "🚛 Nhà phân phối" },
  { key: "supplier_logistics",      label: "NPP - Kho vận",     path: "/supplier/drugs",         group: "🚛 Nhà phân phối" },
  { key: "supplier_finance",        label: "NPP - Tài chính",   path: "/supplier/payments",      group: "🚛 Nhà phân phối" },
  // Bệnh viện
  { key: "hospital_admin",          label: "BV - Quản trị",     path: "/hospital/dashboard",     group: "🏥 Bệnh viện" },
  { key: "hospital_buyer",          label: "BV - Mua hàng",     path: "/hospital/orders/new",    group: "🏥 Bệnh viện" },
  { key: "hospital_warehouse",      label: "BV - Kho vận",      path: "/hospital/orders",        group: "🏥 Bệnh viện" },
  { key: "hospital_finance",        label: "BV - Tài chính",    path: "/hospital/payments",      group: "🏥 Bệnh viện" },
  // Nhà thuốc
  { key: "pharmacy_admin",          label: "NT - Quản trị",     path: "/pharmacy/dashboard",     group: "💊 Nhà thuốc" },
  { key: "pharmacy_buyer",          label: "NT - Đặt hàng",     path: "/pharmacy/orders/new",    group: "💊 Nhà thuốc" },
  { key: "pharmacy_warehouse",      label: "NT - Kho vận",      path: "/pharmacy/orders",        group: "💊 Nhà thuốc" },
  { key: "pharmacy_finance",        label: "NT - Tài chính",    path: "/pharmacy/payments",      group: "💊 Nhà thuốc" },
];

// Group roles for optgroup
const GROUPS = [
  { label: "🏭 Nhà cung cấp",   keys: ["manufacturer_admin", "manufacturer_logistics", "manufacturer_finance"] },
  { label: "🚛 Nhà phân phối",  keys: ["supplier_admin", "supplier_logistics", "supplier_finance"] },
  { label: "🏥 Bệnh viện",      keys: ["hospital_admin", "hospital_buyer", "hospital_warehouse", "hospital_finance"] },
  { label: "💊 Nhà thuốc",      keys: ["pharmacy_admin", "pharmacy_buyer", "pharmacy_warehouse", "pharmacy_finance"] },
];

export default function RoleSwitcher() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  return (
    <select
      value={state.currentRole}
      aria-label="Chuyển vai trò"
      onChange={(e) => {
        const role = e.target.value as UserRole;
        dispatch({ type: "SET_ROLE", payload: role });
        const target = ROLES.find((r) => r.key === role);
        if (target) router.push(target.path);
      }}
      className="h-9 px-3 text-sm border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] text-[#10231C] outline-none focus:border-[#024430] transition-colors w-56"
    >
      {GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {ROLES.filter((r) => group.keys.includes(r.key)).map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
