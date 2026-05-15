"use client";
import { useApp } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";

interface Message {
  id: string;
  from: "hospital" | "supplier";
  senderName: string;
  text: string;
  time: string;
  relatedOrder?: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    from: "supplier",
    senderName: "Trần Văn Minh (PhytoPharma)",
    text: "Chào Bệnh viện Đại học Y Dược, chúng tôi đã nhận đơn hàng ORD-2026-001 và đang tiến hành chuẩn bị hàng. Dự kiến xuất kho ngày 11/03/2026.",
    time: "10/03/2026 14:30",
    relatedOrder: "ORD-2026-001",
  },
  {
    id: "m2",
    from: "hospital",
    senderName: "Nguyễn Thị Hương (BV Đại học Y Dược)",
    text: "Cảm ơn PhytoPharma. Vui lòng đảm bảo hàng được giao trước ngày 17/03. Liên hệ kho trước 30 phút khi đến.",
    time: "10/03/2026 15:00",
    relatedOrder: "ORD-2026-001",
  },
  {
    id: "m3",
    from: "supplier",
    senderName: "Lê Thị Lan (PhytoPharma - Kho vận)",
    text: "Xe tải BS 51C-98765 đã xuất phát từ kho Bình Dương lúc 10:20. Dự kiến đến BV lúc 15:00 hôm nay.",
    time: "14/03/2026 10:20",
    relatedOrder: "ORD-2026-001",
  },
  {
    id: "m4",
    from: "hospital",
    senderName: "Nguyễn Thị Hương (BV Đại học Y Dược)",
    text: "Đã nhận hàng đầy đủ và đúng quy cách. Chất lượng tốt. Cảm ơn PhytoPharma.",
    time: "17/03/2026 16:00",
    relatedOrder: "ORD-2026-001",
  },
  {
    id: "m5",
    from: "supplier",
    senderName: "Trần Văn Minh (PhytoPharma)",
    text: "Về đơn hàng ORD-2026-002: Chúng tôi xin thông báo hiện kho chỉ còn 2.000 hộp Paracetamol 500mg. Chúng tôi sẽ bổ sung 1.000 hộp còn lại trong đợt giao hàng tháng tới.",
    time: "16/04/2026 09:30",
    relatedOrder: "ORD-2026-002",
  },
];

export default function HospitalMessagesPage() {
  const { state } = useApp();

  return (
    <div>
      <PageHeader
        title="Tin nhắn"
        subtitle={`Liên lạc với ${state.contract.supplierName}`}
      />

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-700">
          Đây là kênh liên lạc trực tiếp với nhà cung cấp. Tính năng gửi tin nhắn đang trong giai đoạn phát triển.
        </p>
      </div>

      <Card className="border border-[#E4EAE7]">
        <CardBody className="p-0">
          {/* Header */}
          <div className="p-4 border-b border-[#E4EAE7] bg-[#F6F8F7] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#024430] flex items-center justify-center text-white font-bold">
              P
            </div>
            <div>
              <p className="font-semibold text-[#10231C]">PhytoPharma</p>
              <p className="text-xs text-[#6B7A73]">Nhà cung cấp · Hợp đồng {state.contract.contractCode}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[480px] overflow-y-auto p-6 flex flex-col gap-5 bg-[#F6F8F7]/30">
            {MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "hospital" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-sm lg:max-w-lg ${msg.from === "hospital" ? "items-end" : "items-start"} flex flex-col`}>
                  <p className="text-[10px] text-[#6B7A73] mb-1 px-1">{msg.senderName}</p>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.from === "hospital"
                      ? "bg-[#024430] text-white rounded-br-sm"
                      : "bg-white text-[#10231C] border border-[#E4EAE7] rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.relatedOrder && (
                      <p className={`text-[10px] font-medium mb-1 ${msg.from === "hospital" ? "text-white/70" : "text-[#024430]"}`}>
                        Liên quan: {msg.relatedOrder}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.from === "hospital" ? "text-white/60" : "text-[#6B7A73]"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input placeholder */}
          <div className="border-t border-[#E4EAE7] p-4 bg-white">
            <div className="flex gap-3 items-center">
              <div className="flex-1 border border-[#E4EAE7] rounded-xl px-4 py-2.5 bg-[#F6F8F7] text-sm text-[#6B7A73]">
                Tính năng nhắn tin đang phát triển...
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E4EAE7] flex items-center justify-center text-[#6B7A73]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
