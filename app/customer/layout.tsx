import AppShell from "@/components/layout/AppShell";
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell type="customer">{children}</AppShell>;
}
