import { Chip } from "@/components/ui";

interface StatusChipProps {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

export default function StatusChip({ label, color, size = "sm" }: StatusChipProps) {
  return (
    <Chip color={color} variant="flat" size={size} className="text-xs font-medium">
      {label}
    </Chip>
  );
}
