import { Card, CardBody } from "@/components/ui";
import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function KpiCard({ title, value, sub, icon, trend, trendUp }: KpiCardProps) {
  return (
    <Card className="bg-white border border-[#E4EAE7] shadow-sm">
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-[#6B7A73] font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-[#10231C]">{value}</p>
            {sub && <p className="text-xs text-[#6B7A73] mt-1">{sub}</p>}
            {trend && (
              <p className={`text-xs mt-1 font-medium ${trendUp ? "text-[#138A5B]" : "text-[#D92D20]"}`}>
                {trend}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#024430]/10 flex items-center justify-center text-[#024430]">
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
