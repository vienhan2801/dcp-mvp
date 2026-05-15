"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@/components/ui";
import { fmtVND, fmtNum } from "@/lib/format";

// ── Types ────────────────────────────────────────────────────
type DosageForm = "Viên nang" | "Viên nén" | "Bột tiêm" | "Dung dịch" | "Kem bôi";

interface Product {
  id: string;
  name: string;
  ingredient: string;
  form: DosageForm;
  strength: string;
  unit: string;
  moq: number;
  stock: number;
  reserved: number;
  priceNPP: number;
  listedInCatalog: boolean;
  nppOrdered: number;
  totalOrdered: number;
}

// ── Mock data ────────────────────────────────────────────────
const MY_PRODUCTS: Product[] = [
  { id: "MP001", name: "Amoxicillin 500mg",  ingredient: "Amoxicillin",  form: "Viên nang", strength: "500mg", unit: "Viên", moq: 1000, stock: 48_000,  reserved: 12_000, priceNPP: 1_200,  listedInCatalog: true,  nppOrdered: 3, totalOrdered: 42_000 },
  { id: "MP002", name: "Paracetamol 500mg",  ingredient: "Paracetamol",  form: "Viên nén",  strength: "500mg", unit: "Viên", moq: 5000, stock: 120_000, reserved: 30_000, priceNPP: 800,    listedInCatalog: true,  nppOrdered: 5, totalOrdered: 95_000 },
  { id: "MP003", name: "Ceftriaxone 1g",     ingredient: "Ceftriaxone",  form: "Bột tiêm",  strength: "1g",    unit: "Lọ",  moq: 100,  stock: 1_500,   reserved: 1_200,  priceNPP: 45_000, listedInCatalog: true,  nppOrdered: 2, totalOrdered: 3_800  },
  { id: "MP004", name: "Azithromycin 500mg", ingredient: "Azithromycin", form: "Viên nang", strength: "500mg", unit: "Viên", moq: 500,  stock: 20_000,  reserved: 5_000,  priceNPP: 3_500,  listedInCatalog: true,  nppOrdered: 1, totalOrdered: 9_000  },
  { id: "MP005", name: "Omeprazole 20mg",    ingredient: "Omeprazole",   form: "Viên nang", strength: "20mg",  unit: "Viên", moq: 1000, stock: 200,     reserved: 150,    priceNPP: 2_800,  listedInCatalog: false, nppOrdered: 0, totalOrdered: 0      },
];

const DOSAGE_FORMS: DosageForm[] = ["Viên nang", "Viên nén", "Bột tiêm", "Dung dịch", "Kem bôi"];

// ── Dosage form badge ────────────────────────────────────────
function FormBadge({ form }: { form: DosageForm }) {
  const styles: Record<DosageForm, string> = {
    "Viên nang":  "bg-[#F5F3FF] text-[#6D28D9]",
    "Viên nén":   "bg-blue-50 text-blue-700",
    "Bột tiêm":   "bg-orange-50 text-orange-700",
    "Dung dịch":  "bg-cyan-50 text-cyan-700",
    "Kem bôi":    "bg-pink-50 text-pink-700",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[form] ?? "bg-gray-100 text-gray-600"}`}>
      {form}
    </span>
  );
}

// ── Toggle switch ────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Blank form state ─────────────────────────────────────────
const BLANK_FORM = {
  name: "",
  ingredient: "",
  form: "Viên nén" as DosageForm,
  strength: "",
  unit: "Viên",
  priceNPP: "",
  stock: "",
  moq: "",
};

// ── Page ─────────────────────────────────────────────────────
export default function ManufacturerProductsPage() {
  const [products, setProducts] = useState<Product[]>(MY_PRODUCTS);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState(BLANK_FORM);

  // Derived stats
  const totalListed = products.filter((p) => p.listedInCatalog).length;
  const totalOrders = products.reduce((s, p) => s + p.nppOrdered, 0);

  // Toggle catalog visibility
  function toggleCatalog(id: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, listedInCatalog: !p.listedInCatalog } : p))
    );
  }

  // Add product
  function handleAdd() {
    if (!form.name || !form.ingredient || !form.strength || !form.priceNPP) return;
    const newId = `MP${String(products.length + 1).padStart(3, "0")}`;
    const newProduct: Product = {
      id: newId,
      name: form.name,
      ingredient: form.ingredient,
      form: form.form,
      strength: form.strength,
      unit: form.unit || "Viên",
      moq: parseInt(form.moq) || 0,
      stock: parseInt(form.stock) || 0,
      reserved: 0,
      priceNPP: parseInt(form.priceNPP) || 0,
      listedInCatalog: true,
      nppOrdered: 0,
      totalOrdered: 0,
    };
    setProducts((prev) => [...prev, newProduct]);
    setForm(BLANK_FORM);
    onClose();
  }

  function handleOpenModal() {
    setForm(BLANK_FORM);
    onOpen();
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Sản phẩm của tôi"
        subtitle="Quản lý danh mục sản phẩm đưa lên sàn DCP"
        actions={
          <Button
            onPress={handleOpenModal}
            className="bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
            startContent={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Đăng ký sản phẩm mới
          </Button>
        }
      />

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] px-4 py-3">
        <span className="text-base mt-0.5">💡</span>
        <p className="text-xs text-[#6D28D9] leading-relaxed">
          Sản phẩm được đăng ký sẽ xuất hiện trong danh mục thuốc của nhà phân phối (PhytoPharma).
          Nhà phân phối có thể đặt hàng trực tiếp từ đây.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Sản phẩm đã đăng ký"
          value={String(products.length)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          label="Đang hiển thị trong catalog NPP"
          value={String(totalListed)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          accent
        />
        <StatCard
          label="Tổng đơn đã nhận"
          value={String(totalOrders)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Product table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  {[
                    "Sản phẩm",
                    "Dạng bào chế",
                    "Giá bán NPP",
                    "Tồn kho",
                    "Đặt chỗ",
                    "Khả dụng",
                    "Hiển thị catalog",
                    "Đơn đã nhận",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A73] bg-[#F6F8F7] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const available = p.stock - p.reserved;
                  const stockRatio = p.stock > 0 ? available / p.stock : 1;
                  const stockLow = stockRatio < 0.1;

                  return (
                    <tr
                      key={p.id}
                      className="border-t border-[#E4EAE7] hover:bg-[#FAFAFF] transition-colors"
                    >
                      {/* Sản phẩm */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-[#10231C] leading-tight">{p.name}</p>
                        <p className="text-xs text-[#6B7A73] mt-0.5">{p.ingredient}</p>
                      </td>

                      {/* Dạng bào chế */}
                      <td className="px-4 py-3">
                        <FormBadge form={p.form} />
                      </td>

                      {/* Giá bán NPP */}
                      <td className="px-4 py-3 text-sm text-[#10231C] whitespace-nowrap">
                        {fmtVND(p.priceNPP)}/{p.unit}
                      </td>

                      {/* Tồn kho */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-medium ${stockLow ? "text-red-600" : "text-[#10231C]"}`}>
                          {fmtNum(p.stock)}
                        </span>
                      </td>

                      {/* Đặt chỗ */}
                      <td className="px-4 py-3 text-sm text-[#6B7A73] whitespace-nowrap">
                        {fmtNum(p.reserved)}
                      </td>

                      {/* Khả dụng */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {fmtNum(available)}
                        </span>
                      </td>

                      {/* Hiển thị catalog */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={p.listedInCatalog}
                            onChange={() => toggleCatalog(p.id)}
                          />
                          <span className={`text-xs font-medium ${p.listedInCatalog ? "text-green-600" : "text-[#6B7A73]"}`}>
                            {p.listedInCatalog ? "Hiện" : "Ẩn"}
                          </span>
                        </div>
                      </td>

                      {/* Đơn đã nhận */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#10231C]">{p.nppOrdered} đơn</p>
                        <p className="text-xs text-[#6B7A73]">{fmtNum(p.totalOrdered)} {p.unit}</p>
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 items-center">
                          <button className="text-xs px-2.5 py-1 rounded-lg bg-[#F5F3FF] text-[#6D28D9] hover:bg-[#DDD6FE] font-medium transition-colors whitespace-nowrap">
                            Chỉnh sửa
                          </button>
                          <button className="text-xs px-2.5 py-1 rounded-lg border border-[#DDD6FE] text-[#6D28D9] hover:bg-[#F5F3FF] font-medium transition-colors whitespace-nowrap">
                            Xem đơn
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Add product modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Đăng ký sản phẩm mới</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Tên sản phẩm *"
                placeholder="VD: Amoxicillin 500mg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Hoạt chất *"
                placeholder="VD: Amoxicillin"
                value={form.ingredient}
                onChange={(e) => setForm({ ...form, ingredient: e.target.value })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#6B7A73]">Dạng bào chế *</label>
                <select
                  value={form.form}
                  onChange={(e) => setForm({ ...form, form: e.target.value as DosageForm })}
                  className="border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] px-3 h-10 text-sm text-[#10231C] outline-none focus:border-[#6D28D9]"
                >
                  {DOSAGE_FORMS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Hàm lượng *"
                  placeholder="VD: 500mg"
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                />
                <Input
                  label="Đơn vị *"
                  placeholder="VD: Viên"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
              <Input
                label="Giá bán NPP (VNĐ) *"
                type="number"
                placeholder="VD: 1200"
                value={form.priceNPP}
                onChange={(e) => setForm({ ...form, priceNPP: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tồn kho ban đầu *"
                  type="number"
                  placeholder="VD: 10000"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
                <Input
                  label="MOQ min đặt *"
                  type="number"
                  placeholder="VD: 500"
                  value={form.moq}
                  onChange={(e) => setForm({ ...form, moq: e.target.value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose}>
              Hủy
            </Button>
            <Button
              className="bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
              onPress={handleAdd}
            >
              Đăng ký
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

// ── Stat card helper ─────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[#6B7A73] font-medium mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent ? "text-[#6D28D9]" : "text-[#10231C]"}`}>
              {value}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-[#F5F3FF] text-[#6D28D9]" : "bg-[#F6F8F7] text-[#6B7A73]"}`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
