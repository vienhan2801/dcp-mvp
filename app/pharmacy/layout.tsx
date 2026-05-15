import AppShell from "@/components/layout/AppShell";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell type="pharmacy">{children}</AppShell>;
}
