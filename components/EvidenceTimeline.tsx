"use client";
import { EvidenceLog } from "@/lib/types";
import { actionTypeLabel, formatDateTime, roleLabel } from "@/lib/utils";
import {
  ShoppingCart, CheckCircle, Truck, PackageCheck, AlertTriangle, CreditCard, MessageSquare,
} from "lucide-react";
import { Chip } from "@/components/ui";

function getIcon(type: string) {
  const cls = "w-5 h-5";
  switch (type) {
    case "order_created": return <ShoppingCart className={cls} />;
    case "order_confirmed": return <CheckCircle className={cls} />;
    case "delivery_updated": return <Truck className={cls} />;
    case "receipt_confirmed": return <PackageCheck className={cls} />;
    case "issue_reported": return <AlertTriangle className={cls} />;
    case "payment_updated": return <CreditCard className={cls} />;
    case "message_sent": return <MessageSquare className={cls} />;
    default: return <CheckCircle className={cls} />;
  }
}

function getColor(type: string): string {
  switch (type) {
    case "order_created": return "bg-blue-100 text-blue-700";
    case "order_confirmed": return "bg-[#024430]/10 text-[#024430]";
    case "delivery_updated": return "bg-amber-100 text-amber-700";
    case "receipt_confirmed": return "bg-green-100 text-green-700";
    case "issue_reported": return "bg-red-100 text-red-700";
    case "payment_updated": return "bg-purple-100 text-purple-700";
    case "message_sent": return "bg-gray-100 text-gray-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function EvidenceTimeline({ logs }: { logs: EvidenceLog[] }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-[#E4EAE7]" />
      <div className="flex flex-col gap-6">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${getColor(log.actionType)}`}>
              {getIcon(log.actionType)}
            </div>
            <div className="flex-1 bg-white rounded-xl border border-[#E4EAE7] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="font-semibold text-sm text-[#10231C]">{log.title}</p>
                <span className="text-xs text-[#6B7A73] whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
              </div>
              <p className="text-sm text-[#6B7A73] mt-1">{log.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Chip size="sm" variant="flat" color="default" className="text-xs">{log.actorName}</Chip>
                <Chip size="sm" variant="flat" color="primary" className="text-xs">{roleLabel(log.actorRole)}</Chip>
                {log.orderId && <Chip size="sm" variant="flat" color="secondary" className="text-xs">{log.orderId}</Chip>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
