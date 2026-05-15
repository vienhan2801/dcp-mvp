import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: string;
  valueColor?: string;
}

export default function KpiCard({
  title, value, sub, icon, trend, trendUp,
  accent = "#024430",
  valueColor,
}: KpiCardProps) {
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  const iconBg = `rgba(${r},${g},${b},0.10)`;

  return (
    <div className="bg-white border border-[#E4EAE7] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#6B7A73] font-medium uppercase tracking-wide mb-1.5">{title}</p>
          <p className="text-2xl font-black leading-tight truncate" style={{ color: valueColor ?? "#10231C" }}>
            {value}
          </p>
          {sub && <p className="text-xs text-[#6B7A73] mt-1 truncate">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1.5 font-semibold ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg, color: accent }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
