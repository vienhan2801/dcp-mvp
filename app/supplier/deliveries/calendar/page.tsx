"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui";

const ACCENT = "#024430";

// ── Types ─────────────────────────────────────────────────────────────────────
type DeliveryEvent = {
  id: string; orderId: string; customer: string; drug: string;
  qty: string; date: string; /* YYYY-MM-DD */ status: "scheduled" | "confirmed" | "shipped" | "delivered" | "overdue";
};

const STATUS_CFG: Record<DeliveryEvent["status"], { label: string; dot: string; bg: string; text: string }> = {
  scheduled:  { label: "Lên kế hoạch", dot: "bg-gray-400",   bg: "bg-gray-50",   text: "text-gray-600"   },
  confirmed:  { label: "Đã xác nhận",  dot: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700"   },
  shipped:    { label: "Đang giao",    dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  delivered:  { label: "Đã giao",      dot: "bg-green-500",  bg: "bg-green-50",  text: "text-green-700"  },
  overdue:    { label: "Trễ hạn",      dot: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700"    },
};

// ── Mock delivery schedule (May 2026) ──────────────────────────────────────────
const EVENTS: DeliveryEvent[] = [
  { id: "DEL-2026-001", orderId: "ORD-2026-001", customer: "BV Chợ Rẫy",           drug: "Paracetamol 500mg × 5.000 + Amoxicillin × 2.000", qty: "7.000 đv", date: "2026-05-10", status: "delivered"  },
  { id: "DEL-2026-002", orderId: "ORD-2026-002", customer: "NT Phúc Khang",         drug: "Azithromycin 500mg × 500",                          qty: "500 viên",  date: "2026-05-12", status: "shipped"    },
  { id: "DEL-2026-003", orderId: "ORD-2026-003", customer: "BV ĐH Y Dược",          drug: "Ceftriaxone 1g × 200",                              qty: "200 lọ",    date: "2026-05-13", status: "overdue"    },
  { id: "DEL-2026-004", orderId: "ORD-2026-004", customer: "BV Nhân dân 115",       drug: "Paracetamol 500mg × 8.000",                         qty: "8.000 đv",  date: "2026-05-16", status: "confirmed"  },
  { id: "DEL-2026-005", orderId: "ORD-2026-005", customer: "BV Chợ Rẫy",           drug: "Amoxicillin 500mg × 3.000 + Omeprazole × 1.500",    qty: "4.500 đv",  date: "2026-05-18", status: "confirmed"  },
  { id: "DEL-2026-006", orderId: "ORD-2026-006", customer: "Pharmacity (chuỗi)",    drug: "Azithromycin 500mg × 1.200 + Paracetamol × 6.000",  qty: "7.200 đv",  date: "2026-05-20", status: "scheduled"  },
  { id: "DEL-2026-007", orderId: "ORD-2026-007", customer: "NT An Khang",           drug: "Amoxicillin 500mg × 800",                           qty: "800 viên",  date: "2026-05-21", status: "scheduled"  },
  { id: "DEL-2026-008", orderId: "ORD-2026-008", customer: "BV Tân Phú",            drug: "Ceftriaxone 1g × 500 + Azithromycin × 600",         qty: "1.100 đv",  date: "2026-05-23", status: "scheduled"  },
  { id: "DEL-2026-009", orderId: "ORD-2026-009", customer: "Phòng khám Bình Thạnh", drug: "Paracetamol 500mg × 2.000",                         qty: "2.000 đv",  date: "2026-05-26", status: "scheduled"  },
  { id: "DEL-2026-010", orderId: "ORD-2026-010", customer: "BV Mắt TP.HCM",        drug: "Omeprazole 20mg × 3.000",                           qty: "3.000 viên",date: "2026-05-28", status: "scheduled"  },
  { id: "DEL-2026-011", orderId: "ORD-2026-011", customer: "BV Nhân dân 115",       drug: "Paracetamol × 10.000 + Ceftriaxone × 300",          qty: "10.300 đv", date: "2026-06-02", status: "scheduled"  },
  { id: "DEL-2026-012", orderId: "ORD-2026-012", customer: "BV Chợ Rẫy",           drug: "Amoxicillin 500mg × 5.000",                         qty: "5.000 đv",  date: "2026-06-05", status: "scheduled"  },
];

// ── Calendar helpers ──────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
const MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const DAY_LABELS   = ["CN","T2","T3","T4","T5","T6","T7"];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DeliveryCalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(4); // 0-indexed, May = 4
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWeek = (getFirstDayOfWeek(year, month) + 6) % 7; // Mon-based
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // events indexed by date string
  const eventsByDate: Record<string, DeliveryEvent[]> = {};
  for (const ev of EVENTS) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDate(null); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDate(null); }

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  // KPI counts for current month
  const monthStr = `${year}-${String(month+1).padStart(2,"0")}`;
  const monthEvents = EVENTS.filter(e => e.date.startsWith(monthStr));
  const kpis = {
    total:     monthEvents.length,
    scheduled: monthEvents.filter(e => e.status === "scheduled").length,
    confirmed: monthEvents.filter(e => e.status === "confirmed").length,
    overdue:   monthEvents.filter(e => e.status === "overdue").length,
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-start justify-between">
        <PageHeader title="Lịch giao hàng" subtitle="Kế hoạch vận chuyển tháng / quý" />
        <div className="flex gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${view === "calendar" ? "text-white border-transparent" : "border-[#E4EAE7] text-[#6B7A73]"}`}
            style={view === "calendar" ? { backgroundColor: ACCENT } : {}}
          >📅 Lịch</button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${view === "list" ? "text-white border-transparent" : "border-[#E4EAE7] text-[#6B7A73]"}`}
            style={view === "list" ? { backgroundColor: ACCENT } : {}}
          >≡ Danh sách</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng kế hoạch tháng", value: kpis.total,     color: "bg-[#F0FDF4] border-green-200",  textColor: "text-[#024430]" },
          { label: "Đã xác nhận",         value: kpis.confirmed, color: "bg-blue-50 border-blue-200",     textColor: "text-blue-700"  },
          { label: "Chờ lên lịch",        value: kpis.scheduled, color: "bg-gray-50 border-gray-200",     textColor: "text-gray-700"  },
          { label: "Trễ hạn",             value: kpis.overdue,   color: "bg-red-50 border-red-200",       textColor: "text-red-700"   },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border-2 p-4 ${k.color}`}>
            <p className="text-xs font-medium text-[#6B7A73]">{k.label}</p>
            <p className={`text-3xl font-extrabold leading-none mt-1 ${k.textColor}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Calendar view ── */}
      {view === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-[#F6F8F7] flex items-center justify-center text-[#6B7A73] font-bold">‹</button>
                <h3 className="font-semibold text-[#10231C]">Tháng {month+1} / {year}</h3>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-[#F6F8F7] flex items-center justify-center text-[#6B7A73] font-bold">›</button>
              </CardHeader>
              <CardBody className="pt-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold text-[#6B7A73] py-1">{d}</div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month start */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day  = i + 1;
                    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const dayEvents = eventsByDate[dateStr] ?? [];
                    const isToday   = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const hasOverdue = dayEvents.some(e => e.status === "overdue");
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`relative rounded-lg p-1 min-h-[52px] flex flex-col transition-all text-left border-2 ${
                          isSelected  ? "border-[#024430] bg-[#F0FDF4]" :
                          isToday     ? "border-blue-300 bg-blue-50" :
                          dayEvents.length > 0 ? "border-[#E4EAE7] hover:border-[#024430] hover:bg-[#F6F8F7]" :
                          "border-transparent hover:bg-[#F6F8F7]"
                        }`}
                      >
                        <span className={`text-xs font-bold mb-1 ${isToday ? "text-blue-700" : "text-[#10231C]"}`}>{day}</span>
                        {dayEvents.slice(0, 2).map(ev => {
                          const cfg = STATUS_CFG[ev.status];
                          return (
                            <span key={ev.id} className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate w-full ${cfg.bg} ${cfg.text}`}>
                              {ev.customer.split(" ").slice(-1)[0]}
                            </span>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] text-[#6B7A73]">+{dayEvents.length - 2}</span>
                        )}
                        {hasOverdue && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#E4EAE7]">
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                    <span key={key} className="flex items-center gap-1.5 text-[10px] text-[#6B7A73]">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Selected day events */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[#10231C]">
                  {selectedDate
                    ? `Giao hàng ngày ${selectedDate.split("-").reverse().join("/")}`
                    : "Chọn ngày để xem chi tiết"}
                </h3>
              </CardHeader>
              <CardBody className="pt-0 flex flex-col gap-3">
                {!selectedDate && (
                  <p className="text-sm text-[#6B7A73] text-center py-8">← Nhấn vào ngày có lịch giao</p>
                )}
                {selectedDate && selectedEvents.length === 0 && (
                  <p className="text-sm text-[#6B7A73] text-center py-8">Không có lịch giao hàng</p>
                )}
                {selectedEvents.map(ev => {
                  const cfg = STATUS_CFG[ev.status];
                  return (
                    <Link key={ev.id} href={`/supplier/deliveries/${ev.id}`}>
                      <div className={`p-3 rounded-xl border border-[#E4EAE7] ${cfg.bg} hover:shadow-sm transition-shadow cursor-pointer`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-[#024430]">{ev.id}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border border-current border-opacity-20`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#10231C]">{ev.customer}</p>
                        <p className="text-xs text-[#6B7A73] truncate">{ev.drug}</p>
                        <p className="text-xs font-medium text-[#10231C] mt-1">SL: {ev.qty}</p>
                      </div>
                    </Link>
                  );
                })}
              </CardBody>
            </Card>

            {/* Upcoming 5 deliveries */}
            <Card className="mt-4">
              <CardHeader>
                <h3 className="font-semibold text-[#10231C]">Sắp tới</h3>
              </CardHeader>
              <CardBody className="pt-0 flex flex-col gap-2">
                {EVENTS.filter(e => e.date >= todayStr && e.status !== "delivered")
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 5)
                  .map(ev => {
                    const cfg = STATUS_CFG[ev.status];
                    const d = ev.date.split("-");
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-10 text-center">
                          <p className="text-[10px] font-semibold text-[#6B7A73]">Th{parseInt(d[1])}</p>
                          <p className="text-base font-black text-[#10231C] leading-none">{parseInt(d[2])}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#10231C] truncate">{ev.customer}</p>
                          <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
                        </div>
                      </div>
                    );
                  })}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7]">
                    {["Mã giao hàng", "Ngày giao", "Khách hàng", "Hàng hóa", "Số lượng", "Trạng thái", ""].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#6B7A73] pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...EVENTS].sort((a, b) => a.date.localeCompare(b.date)).map(ev => {
                    const cfg = STATUS_CFG[ev.status];
                    const d = ev.date.split("-").reverse().join("/");
                    return (
                      <tr key={ev.id} className={`border-b border-[#F3F4F6] last:border-0 ${ev.status === "overdue" ? "bg-red-50" : ""}`}>
                        <td className="py-3 pr-4 font-mono text-xs font-bold text-[#024430]">{ev.id}</td>
                        <td className="py-3 pr-4 text-xs text-[#10231C]">{d}</td>
                        <td className="py-3 pr-4 text-sm font-semibold text-[#10231C]">{ev.customer}</td>
                        <td className="py-3 pr-4 text-xs text-[#6B7A73] max-w-[200px] truncate">{ev.drug}</td>
                        <td className="py-3 pr-4 text-xs text-[#10231C]">{ev.qty}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <Link href={`/supplier/deliveries/${ev.id}`}>
                            <span className="text-xs font-medium text-[#024430] hover:underline cursor-pointer">Chi tiết →</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
