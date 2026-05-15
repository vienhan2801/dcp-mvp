"use client";
import { useApp } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";

const roles: { key: UserRole; label: string; path: string }[] = [
  { key: "hospital_buyer", label: "Bệnh viện - Mua hàng", path: "/hospital/dashboard" },
  { key: "supplier_admin", label: "NCC - Quản trị", path: "/supplier/dashboard" },
  { key: "supplier_logistics", label: "NCC - Kho vận", path: "/supplier/deliveries" },
  { key: "supplier_finance", label: "NCC - Tài chính", path: "/supplier/payments" },
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
        const target = roles.find((r) => r.key === role);
        if (target) router.push(target.path);
      }}
      className="h-9 px-3 text-sm border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] text-[#10231C] outline-none focus:border-[#024430] transition-colors w-52"
    >
      {roles.map((r) => (
        <option key={r.key} value={r.key}>{r.label}</option>
      ))}
    </select>
  );
}
