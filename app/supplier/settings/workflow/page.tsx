"use client";
import { useState } from "react";
import { Card, CardBody, Button, Chip } from "@/components/ui";
import PageHeader from "@/components/PageHeader";
import {
  GitBranch,
  Cog,
  ArrowRight,
  CheckCircle2,
  Save,
  Users,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalMode = "auto" | "single" | "double" | "committee";

interface WorkflowStage {
  id: string;
  name: string;
  trigger: string;
  outcome: string;
  approvalMode: ApprovalMode;
  approvers: string[];
  autoConditions?: string;
  timeoutHours: number;
  escalateTo: string;
}

const MODE_LABELS: Record<ApprovalMode, { label: string; color: string }> = {
  auto:      { label: "Tự động",      color: "bg-blue-100 text-blue-700" },
  single:    { label: "1 người duyệt", color: "bg-emerald-100 text-emerald-700" },
  double:    { label: "2 người duyệt", color: "bg-purple-100 text-purple-700" },
  committee: { label: "Hội đồng",     color: "bg-orange-100 text-orange-700" },
};

const ROLE_LABELS: Record<string, string> = {
  supplier_admin:     "Quản trị viên",
  supplier_approver:  "Người phê duyệt",
  supplier_logistics: "Kho vận",
  supplier_finance:   "Kế toán",
  customer_receiver:  "Người nhận hàng (KH)",
  customer_admin:     "Quản trị KH",
};

const initialStages: WorkflowStage[] = [
  {
    id: "WF-001",
    name: "Auto-validate khi đơn gửi",
    trigger: "pending_check",
    outcome: "pending_approval",
    approvalMode: "auto",
    approvers: [],
    autoConditions: "Kiểm tra: tín dụng KH ≥ 0, mặt hàng trong danh mục HĐ, quota còn đủ",
    timeoutHours: 1,
    escalateTo: "supplier_admin",
  },
  {
    id: "WF-002",
    name: "Phê duyệt đơn hàng (NPP)",
    trigger: "pending_approval",
    outcome: "confirmed / partially_confirmed / rejected",
    approvalMode: "single",
    approvers: ["supplier_approver", "supplier_admin"],
    timeoutHours: 24,
    escalateTo: "supplier_admin",
  },
  {
    id: "WF-003",
    name: "Phân bổ kho (FEFO)",
    trigger: "confirmed",
    outcome: "holding_inventory",
    approvalMode: "auto",
    approvers: [],
    autoConditions: "Phân bổ theo FEFO tự động nếu tồn đủ hàng",
    timeoutHours: 4,
    escalateTo: "supplier_logistics",
  },
  {
    id: "WF-004",
    name: "Chuẩn bị & Xuất kho",
    trigger: "holding_inventory",
    outcome: "preparing_delivery → dispatching",
    approvalMode: "single",
    approvers: ["supplier_logistics"],
    timeoutHours: 8,
    escalateTo: "supplier_admin",
  },
  {
    id: "WF-005",
    name: "Xác nhận giao hàng",
    trigger: "dispatching",
    outcome: "delivered",
    approvalMode: "auto",
    approvers: [],
    autoConditions: "Tài xế ghi nhận giao hàng thành công qua app",
    timeoutHours: 48,
    escalateTo: "supplier_logistics",
  },
  {
    id: "WF-006",
    name: "Nghiệm thu (KH xác nhận)",
    trigger: "delivered",
    outcome: "received_confirmed / issue_reported",
    approvalMode: "single",
    approvers: ["customer_receiver", "customer_admin"],
    timeoutHours: 72,
    escalateTo: "supplier_admin",
  },
];

const STATE_PIPELINE = [
  "draft", "pending_check", "pending_approval",
  "confirmed", "holding_inventory", "preparing_delivery",
  "dispatching", "delivered", "received_confirmed",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkflowSettingsPage() {
  const [stages, setStages] = useState(initialStages);
  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const updateMode = (id: string, mode: ApprovalMode) =>
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, approvalMode: mode } : s)));

  const updateTimeout = (id: string, val: number) =>
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, timeoutHours: val } : s)));

  return (
    <div>
      <PageHeader
        title="Cấu hình Workflow Phê duyệt"
        subtitle="Định nghĩa từng bước trong quy trình 11 trạng thái: ai duyệt, timeout bao lâu"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#6B7A73] mb-5">
        <Link href="/supplier/settings/users" className="hover:text-[#10231C]">Cài đặt</Link>
        <span>/</span>
        <span className="text-[#10231C] font-medium">Workflow phê duyệt</span>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 text-sm text-[#6B7A73]">
          <GitBranch size={16} className="text-[#024430]" />
          <span>{stages.length} giai đoạn được cấu hình</span>
        </div>
        <Button
          className="bg-[#024430] text-white text-sm px-4 py-2 rounded-xl flex items-center gap-1.5"
          onClick={() => setSaved(true)}
        >
          <Save size={15} /> Lưu cấu hình
        </Button>
      </div>

      {/* Saved notice */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 size={15} className="shrink-0" />
          Workflow đã lưu thành công.
          <button className="ml-auto text-xs underline" onClick={() => setSaved(false)}>Đóng</button>
        </div>
      )}

      {/* State machine visualizer */}
      <Card className="mb-5">
        <CardBody>
          <p className="text-xs font-bold text-[#10231C] mb-3">Sơ đồ quy trình trạng thái</p>
          <div className="flex overflow-x-auto gap-1.5 pb-1">
            {STATE_PIPELINE.map((state, i) => (
              <div key={state} className="flex items-center gap-1 shrink-0">
                <div className="rounded-lg bg-[#024430]/10 border border-[#024430]/20 px-2.5 py-1.5">
                  <p className="text-[10px] font-bold text-[#024430] whitespace-nowrap">
                    {state.replace(/_/g, " ")}
                  </p>
                </div>
                {i < STATE_PIPELINE.length - 1 && (
                  <ArrowRight size={12} className="text-[#6B7A73]" />
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Stage cards */}
      <div className="flex flex-col gap-3">
        {stages.map((stage, i) => {
          const isOpen = editing === stage.id;
          return (
            <Card key={stage.id}>
              <CardBody className="p-0">
                {/* Header row — click to expand */}
                <button
                  onClick={() => setEditing(isOpen ? null : stage.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F6F8F7] transition-colors rounded-xl"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#024430] text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#10231C]">{stage.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${MODE_LABELS[stage.approvalMode].color}`}>
                        {MODE_LABELS[stage.approvalMode].label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7A73] mt-0.5">
                      <code className="font-mono bg-[#F6F8F7] px-1 rounded">{stage.trigger}</code>
                      {" → "}
                      <code className="font-mono bg-[#F6F8F7] px-1 rounded">{stage.outcome}</code>
                      {" · "}Timeout: {stage.timeoutHours}h
                    </p>
                  </div>
                  <Cog
                    size={16}
                    className={`shrink-0 text-[#6B7A73] transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded config panel */}
                {isOpen && (
                  <div className="border-t border-[#E4EAE7] px-5 py-4 space-y-4 bg-[#F6F8F7] rounded-b-xl">
                    {stage.autoConditions && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                        <strong>Điều kiện tự động:</strong> {stage.autoConditions}
                      </div>
                    )}

                    {/* Approval mode */}
                    <div>
                      <p className="text-xs font-semibold text-[#10231C] mb-2">Chế độ phê duyệt</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(MODE_LABELS) as ApprovalMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => updateMode(stage.id, mode)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              stage.approvalMode === mode
                                ? "border-[#024430] bg-[#024430] text-white"
                                : "border-[#E4EAE7] bg-white text-[#6B7A73] hover:border-[#024430]"
                            }`}
                          >
                            {MODE_LABELS[mode].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Approvers */}
                    {stage.approvers.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#10231C] mb-2 flex items-center gap-1">
                          <Users size={13} /> Vai trò có quyền phê duyệt
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {stage.approvers.map((role) => (
                            <span
                              key={role}
                              className="rounded-full border border-[#E4EAE7] bg-white px-3 py-1 text-xs font-medium text-[#10231C]"
                            >
                              {ROLE_LABELS[role] ?? role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeout */}
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[#10231C] mb-1.5">
                          Timeout trước khi escalate (giờ)
                        </p>
                        <input
                          type="number"
                          value={stage.timeoutHours}
                          min={1}
                          onChange={(e) => updateTimeout(stage.id, Number(e.target.value))}
                          className="w-24 rounded-xl border border-[#E4EAE7] bg-white px-3 py-2 text-sm text-center text-[#10231C] focus:border-[#024430] focus:outline-none"
                        />
                      </div>
                      <div className="pb-2">
                        <p className="text-xs text-[#6B7A73]">
                          Escalate đến:{" "}
                          <strong className="text-[#10231C]">
                            {ROLE_LABELS[stage.escalateTo] ?? stage.escalateTo}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
