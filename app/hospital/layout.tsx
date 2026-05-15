import AppShell from "@/components/layout/AppShell";
export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell type="hospital">{children}</AppShell>;
}
