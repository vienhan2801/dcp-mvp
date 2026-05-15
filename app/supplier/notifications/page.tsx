"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifType = "sla" | "order" | "contract" | "payment" | "system";
type Priority = "danger" | "warning" | "info" | "success";
type FilterKey = "all" | "unread" | "sla" | "order" | "contract";

interface Notification {
  id: number;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  type: NotifType;
  priority: Priority;
  unread: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: "⚠️",
    title: "SLA sắp vi phạm",
    description: "Đơn ORD-021 chờ phê duyệt 22/24h — còn 2 giờ trước khi vi phạm SLA",
    timestamp: "5 phút trước",
    type: "sla",
    priority: "warning",
    unread: true,
  },
  {
    id: 2,
    icon: "📋",
    title: "Đơn hàng mới",
    description: "BV ĐH Y Dược gửi ORD-022 — 15 dòng thuốc, tổng giá trị 1.2 tỷ VNĐ",
    timestamp: "12 phút trước",
    type: "order",
    priority: "info",
    unread: true,
  },
  {
    id: 3,
    icon: "✅",
    title: "Đơn đã xác nhận",
    description: "ORD-019 confirmed thành công — đang chuyển sang giai đoạn phân bổ kho",
    timestamp: "1 giờ trước",
    type: "order",
    priority: "success",
    unread: false,
  },
  {
    id: 4,
    icon: "⚠️",
    title: "SLA cảnh báo",
    description: "Giao hàng DSP-017 đã sử dụng quá 80% thời gian cho phép (38/48h)",
    timestamp: "2 giờ trước",
    type: "sla",
    priority: "warning",
    unread: true,
  },
  {
    id: 5,
    icon: "📄",
    title: "Hợp đồng sắp hết hạn",
    description: "CTR-PP-BVT-2026 còn 30 ngày hiệu lực — vui lòng gia hạn hoặc tái ký",
    timestamp: "3 giờ trước",
    type: "contract",
    priority: "warning",
    unread: false,
  },
  {
    id: 6,
    icon: "💰",
    title: "Thanh toán nhận được",
    description: "BV ĐH Y Dược đã thanh toán 580.000.000 VNĐ cho hợp đồng CTR-PP-BVD-2025",
    timestamp: "5 giờ trước",
    type: "payment",
    priority: "success",
    unread: false,
  },
  {
    id: 7,
    icon: "🚨",
    title: "SLA vi phạm",
    description: "Phân bổ kho ORD-018 đã quá hạn 2 giờ — cần xử lý ngay",
    timestamp: "7 giờ trước",
    type: "sla",
    priority: "danger",
    unread: false,
  },
  {
    id: 8,
    icon: "🔔",
    title: "Thông báo hệ thống",
    description: "Báo cáo tuần 21 đã sẵn sàng — bao gồm doanh thu, SLA và chất lượng",
    timestamp: "Hôm qua",
    type: "system",
    priority: "info",
    unread: false,
  },
];

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "sla", label: "Cảnh báo SLA" },
  { key: "order", label: "Đơn hàng" },
  { key: "contract", label: "Hợp đồng" },
];

const SLA_RULES = [
  { stage: "Phê duyệt đơn", time: "24h", warn: "80%", escalate: "Giám đốc kinh doanh", enabled: true },
  { stage: "Phân bổ kho", time: "4h", warn: "75%", escalate: "Quản lý kho", enabled: true },
  { stage: "Chuẩn bị xuất kho", time: "8h", warn: "80%", escalate: "Quản lý vận hành", enabled: true },
  { stage: "Giao hàng", time: "48h", warn: "80%", escalate: "Giám đốc vận hành", enabled: true },
  { stage: "Nghiệm thu", time: "72h", warn: "70%", escalate: "Chăm sóc khách hàng", enabled: false },
  { stage: "Thanh toán", time: "720h", warn: "90%", escalate: "Kế toán trưởng", enabled: true },
];

const NOTIF_CHANNELS = [
  { event: "SLA cảnh báo (80%)", inApp: true, email: true, sms: false },
  { event: "SLA vi phạm", inApp: true, email: true, sms: true },
  { event: "Đơn hàng mới", inApp: true, email: false, sms: false },
  { event: "Hợp đồng sắp hết hạn", inApp: true, email: true, sms: false },
];

const PRIORITY_DOT: Record<Priority, string> = {
  danger: "bg-red-500",
  warning: "bg-amber-400",
  info: "bg-blue-400",
  success: "bg-emerald-400",
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#024430]" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-[#024430] cursor-pointer"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sla">("inbox");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [slaRules, setSlaRules] = useState(SLA_RULES);
  const [channels, setChannels] = useState(NOTIF_CHANNELS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return n.unread;
    if (filter === "sla") return n.type === "sla";
    if (filter === "order") return n.type === "order";
    if (filter === "contract") return n.type === "contract";
    return true;
  });

  function markRead(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function toggleSlaRule(idx: number) {
    setSlaRules((prev) => prev.map((r, i) => (i === idx ? { ...r, enabled: !r.enabled } : r)));
  }

  function toggleChannel(rowIdx: number, channel: "inApp" | "email" | "sms") {
    setChannels((prev) =>
      prev.map((r, i) => (i === rowIdx ? { ...r, [channel]: !r[channel as keyof typeof r] } : r))
    );
  }

  return (
    <div>
      <PageHeader
        title="Trung tâm thông báo"
        subtitle="Quản lý thông báo và cấu hình SLA"
        actions={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="text-sm text-[#024430] font-medium hover:underline"
            >
              Đánh dấu tất cả đã đọc ({unreadCount})
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[#E4EAE7]">
        {[
          { key: "inbox" as const, label: "Thông báo" },
          { key: "sla" as const, label: "Cài đặt SLA" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? "border-[#024430] text-[#024430]"
                : "border-transparent text-[#6B7A73] hover:text-[#10231C]"
            }`}
          >
            {t.label}
            {t.key === "inbox" && unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Inbox ── */}
      {activeTab === "inbox" && (
        <div>
          {/* Filter pills */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {FILTER_PILLS.map((p) => (
              <button
                key={p.key}
                onClick={() => setFilter(p.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === p.key
                    ? "bg-[#024430] text-white"
                    : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Card>
            <CardBody className="p-0">
              <div className="divide-y divide-[#E4EAE7]">
                {filtered.length === 0 && (
                  <div className="py-12 text-center text-[#6B7A73] text-sm">
                    Không có thông báo nào
                  </div>
                )}
                {filtered.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-[#F6F8F7] transition-colors ${
                      n.unread ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {/* Priority dot */}
                    <div className="mt-2 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${PRIORITY_DOT[n.priority]}`} />
                    </div>

                    {/* Icon */}
                    <div className="text-xl flex-shrink-0 mt-0.5">{n.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold text-[#10231C] ${n.unread ? "" : "font-medium"}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-[#6B7A73]">{n.timestamp}</span>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#024430] flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[#6B7A73] mt-0.5 line-clamp-2">{n.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── Tab 2: SLA Monitor ── */}
      {activeTab === "sla" && (
        <div className="space-y-5">
          {/* SLA Rules table */}
          <Card>
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-semibold text-[#10231C]">Quy tắc SLA theo giai đoạn</h2>
              <p className="text-sm text-[#6B7A73] mt-0.5">Thời gian xử lý tối đa cho từng bước trong quy trình</p>
            </div>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                      {["Giai đoạn", "Thời gian", "Cảnh báo tại", "Escalate đến", "Trạng thái"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4EAE7]">
                    {slaRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[#F6F8F7] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#10231C]">{rule.stage}</td>
                        <td className="px-4 py-3 text-[#10231C]">{rule.time}</td>
                        <td className="px-4 py-3">
                          <span className="text-amber-600 font-medium">{rule.warn}</span>
                        </td>
                        <td className="px-4 py-3 text-[#6B7A73]">{rule.escalate}</td>
                        <td className="px-4 py-3">
                          <Toggle checked={rule.enabled} onChange={() => toggleSlaRule(idx)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Notification channels matrix */}
          <Card>
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-semibold text-[#10231C]">Kênh thông báo</h2>
              <p className="text-sm text-[#6B7A73] mt-0.5">Chọn kênh nhận thông báo cho từng sự kiện</p>
            </div>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">Sự kiện</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">In-app</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">Email</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73] uppercase tracking-wide">SMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4EAE7]">
                    {channels.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F6F8F7] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#10231C]">{row.event}</td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox checked={row.inApp} onChange={() => toggleChannel(i, "inApp")} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox checked={row.email} onChange={() => toggleChannel(i, "email")} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox checked={row.sms} onChange={() => toggleChannel(i, "sms")} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <button className="px-5 py-2.5 bg-[#024430] text-white text-sm font-medium rounded-xl hover:bg-[#013325] transition-colors">
              Lưu cấu hình
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
