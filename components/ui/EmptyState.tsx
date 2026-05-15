import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-[#F6F8F7] flex items-center justify-center text-[#6B7A73] mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-[#10231C] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6B7A73] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
