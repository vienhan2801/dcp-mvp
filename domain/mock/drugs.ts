import { DrugMaster, SupplierDrugProfile, ContractDrugItem } from "@/domain/models/drug";

// ─────────────────────────────────────────────────────────
// MOCK DRUG CATALOG
// 3 drugs matching contract items ITEM-001, ITEM-002, ITEM-003
// Each drug has: master profile + supplier profile + contract references
// ─────────────────────────────────────────────────────────

export const mockDrugMasters: DrugMaster[] = [
  // ── DRUG-001: Paracetamol 500mg ────────────────────────
  {
    id: "DRUG-001",
    drugName: "Paracetamol 500mg",
    activeIngredient: "Paracetamol",
    dosageForm: "Viên nén",
    strength: "500mg",
    specification: "Hộp 10 vỉ × 10 viên (100 viên/hộp)",
    unit: "Hộp",
    manufacturer: "PhytoPharma",
    origin: "Việt Nam",
    supplierId: "SUP-001",
    supplierName: "PhytoPharma",
    sourceType: "contract_derived",
    matchStatus: "exact_match",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=contain&w=600&q=80&bg=white"],
    description: "Paracetamol 500mg là thuốc giảm đau, hạ sốt thông dụng, được sản xuất tại nhà máy đạt chuẩn GMP-WHO. Phù hợp điều trị đau đầu, đau răng, đau cơ, hạ sốt do cảm cúm.",
    indications: "Giảm đau nhẹ đến vừa (đau đầu, đau răng, đau cơ, đau khớp, đau bụng kinh). Hạ sốt do cảm cúm, viêm họng.",
    contraindications: "Mẫn cảm với Paracetamol. Suy gan nặng. Không dùng đồng thời với các thuốc có chứa Paracetamol khác.",
    dosageUsage: "Người lớn: 1-2 viên/lần, 3-4 lần/ngày. Tối đa 4g/ngày. Trẻ em > 12 tuổi: 1 viên/lần.",
    storageCondition: "Bảo quản nơi khô ráo, thoáng mát. Nhiệt độ dưới 30°C, tránh ánh sáng trực tiếp.",
    registrationNumber: "VD-12345-19",
    certificates: ["GMP-WHO", "ISO 9001:2015", "Số đăng ký: VD-12345-19"],
    documents: ["Tờ hướng dẫn sử dụng", "Phiếu kiểm nghiệm lô BATCH-PARA-0826", "Giấy phép lưu hành"],
    linkedContractItemIds: ["ITEM-001"],
    linkedTenderPackageIds: ["GT-2026-001"],
    priceHistory: [
      {
        contractId: "CTR-2026-001",
        contractCode: "HD-PP-UMC-2026-001",
        contractName: "Hợp đồng cung ứng thuốc generic nhóm 1 năm 2026",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        unitPrice: 18_000,
        effectiveDate: "2026-01-01",
        expiryDate: "2026-12-31",
      },
      {
        contractId: "CTR-2025-002",
        contractCode: "HD-PP-UMC-2025-002",
        contractName: "Hợp đồng cung ứng thuốc generic nhóm 1 năm 2025",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        unitPrice: 17_500,
        effectiveDate: "2025-01-01",
        expiryDate: "2025-12-31",
      },
      {
        contractId: "CTR-2025-010",
        contractCode: "HD-PP-BND-2025-010",
        contractName: "Hợp đồng cung ứng thuốc BV Bình Dân 2025",
        hospitalName: "BV Bình Dân TP.HCM",
        unitPrice: 17_800,
        effectiveDate: "2025-03-01",
        expiryDate: "2025-12-31",
      },
    ],
    transactionHistory: [
      {
        orderId: "ORD-2026-001",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-03-10",
        requestedQty: 9_000,
        confirmedQty: 9_000,
        deliveredQty: 9_000,
        orderStatus: "received_confirmed",
        paymentStatus: "partially_paid",
        lineAmount: 162_000_000,
      },
      {
        orderId: "ORD-2026-002",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-04-15",
        requestedQty: 3_000,
        confirmedQty: 2_000,
        deliveredQty: 0,
        orderStatus: "partially_confirmed",
        paymentStatus: "not_invoiced",
        lineAmount: 36_000_000,
      },
      {
        orderId: "ORD-2026-003",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-05-01",
        requestedQty: 500,
        confirmedQty: 0,
        deliveredQty: 0,
        orderStatus: "pending_confirmation",
        paymentStatus: "not_invoiced",
        lineAmount: 9_000_000,
      },
    ],
    createdAt: "2026-01-05T08:00:00",
    updatedAt: "2026-04-16T09:15:00",
  },

  // ── DRUG-002: Amoxicillin 500mg ─────────────────────────
  {
    id: "DRUG-002",
    drugName: "Amoxicillin 500mg",
    activeIngredient: "Amoxicillin trihydrate",
    dosageForm: "Viên nang",
    strength: "500mg",
    specification: "Hộp 10 vỉ × 10 viên (100 viên/hộp)",
    unit: "Hộp",
    manufacturer: "Mekophar",
    origin: "Việt Nam",
    supplierId: "SUP-001",
    supplierName: "PhytoPharma",
    sourceType: "contract_derived",
    matchStatus: "exact_match",
    images: ["https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=contain&w=600&q=80&bg=white"],
    description: "Amoxicillin 500mg là kháng sinh phổ rộng thuộc nhóm penicillin bán tổng hợp. Hiệu quả với nhiều vi khuẩn gram dương và gram âm. Sản xuất bởi Mekophar, đạt tiêu chuẩn GMP-ASEAN.",
    indications: "Nhiễm khuẩn đường hô hấp (viêm phổi, viêm phế quản, viêm xoang). Nhiễm khuẩn tiết niệu. Nhiễm khuẩn da và mô mềm.",
    contraindications: "Mẫn cảm với Amoxicillin, Ampicillin hoặc bất kỳ kháng sinh penicillin nào.",
    dosageUsage: "Người lớn: 500mg/lần × 3 lần/ngày. Trẻ em > 10 tuổi: tương tự người lớn. Dùng trước hoặc sau bữa ăn.",
    storageCondition: "Bảo quản dưới 25°C, tránh ẩm và ánh sáng.",
    registrationNumber: "VD-23456-20",
    certificates: ["GMP-ASEAN", "Số đăng ký: VD-23456-20"],
    documents: ["Tờ hướng dẫn sử dụng", "Phiếu kiểm nghiệm lô BATCH-AMOX-0626"],
    linkedContractItemIds: ["ITEM-002"],
    linkedTenderPackageIds: ["GT-2026-001"],
    priceHistory: [
      {
        contractId: "CTR-2026-001",
        contractCode: "HD-PP-UMC-2026-001",
        contractName: "Hợp đồng cung ứng thuốc generic nhóm 1 năm 2026",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        unitPrice: 42_000,
        effectiveDate: "2026-01-01",
        expiryDate: "2026-12-31",
      },
      {
        contractId: "CTR-2025-002",
        contractCode: "HD-PP-UMC-2025-002",
        contractName: "Hợp đồng cung ứng thuốc generic nhóm 1 năm 2025",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        unitPrice: 40_000,
        effectiveDate: "2025-01-01",
        expiryDate: "2025-12-31",
      },
    ],
    transactionHistory: [
      {
        orderId: "ORD-2026-001",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-03-10",
        requestedQty: 9_000,
        confirmedQty: 9_000,
        deliveredQty: 9_000,
        orderStatus: "received_confirmed",
        paymentStatus: "partially_paid",
        lineAmount: 378_000_000,
      },
      {
        orderId: "ORD-2026-002",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-04-15",
        requestedQty: 1_000,
        confirmedQty: 1_000,
        deliveredQty: 0,
        orderStatus: "partially_confirmed",
        paymentStatus: "not_invoiced",
        lineAmount: 42_000_000,
      },
    ],
    createdAt: "2026-01-05T08:00:00",
    updatedAt: "2026-04-16T09:15:00",
  },

  // ── DRUG-003: Ceftriaxone 1g ────────────────────────────
  {
    id: "DRUG-003",
    drugName: "Ceftriaxone 1g",
    activeIngredient: "Ceftriaxone natri",
    dosageForm: "Bột pha tiêm",
    strength: "1g",
    specification: "Hộp 10 lọ × 1g",
    unit: "Hộp",
    manufacturer: "Tecoland (Ấn Độ)",
    origin: "Ấn Độ",
    supplierId: "SUP-001",
    supplierName: "PhytoPharma",
    sourceType: "contract_derived",
    matchStatus: "exact_match",
    images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=contain&w=600&q=80&bg=white"],
    description: "Ceftriaxone 1g là kháng sinh cephalosporin thế hệ 3, được nhập khẩu từ Ấn Độ qua nhà phân phối PhytoPharma. Hiệu quả mạnh với nhiều vi khuẩn gram âm, phổ biến trong điều trị nội trú.",
    indications: "Nhiễm khuẩn nặng: viêm phổi, nhiễm khuẩn huyết, viêm màng não, nhiễm khuẩn ổ bụng, nhiễm khuẩn hậu phẫu.",
    contraindications: "Mẫn cảm với cephalosporin hoặc penicillin. Trẻ sơ sinh vàng da.",
    dosageUsage: "Người lớn: 1-2g/lần, tiêm tĩnh mạch hoặc tiêm bắp 1-2 lần/ngày. Pha loãng với NaCl 0.9% hoặc Glucose 5%.",
    storageCondition: "Bảo quản dưới 25°C, tránh ánh sáng. Sau khi pha: dùng ngay trong 6 giờ.",
    registrationNumber: "VN-34567-21",
    certificates: ["WHO-PQ", "GMP EU", "Số đăng ký: VN-34567-21"],
    documents: ["Tờ hướng dẫn sử dụng", "Giấy phép nhập khẩu", "Phiếu kiểm nghiệm lô BATCH-CEF-0326", "Certificate of Analysis"],
    linkedContractItemIds: ["ITEM-003"],
    linkedTenderPackageIds: ["GT-2026-001"],
    priceHistory: [
      {
        contractId: "CTR-2026-001",
        contractCode: "HD-PP-UMC-2026-001",
        contractName: "Hợp đồng cung ứng thuốc generic nhóm 1 năm 2026",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        unitPrice: 135_000,
        effectiveDate: "2026-01-01",
        expiryDate: "2026-12-31",
      },
      {
        contractId: "CTR-2025-002",
        contractCode: "HD-PP-UMC-2025-002",
        contractName: "Hợp đồng cung ứng thuốc generic nhóm 1 năm 2025",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        unitPrice: 128_000,
        effectiveDate: "2025-01-01",
        expiryDate: "2025-12-31",
      },
      {
        contractId: "CTR-2025-015",
        contractCode: "HD-PP-CHR-2025-015",
        contractName: "Hợp đồng cung ứng kháng sinh BV Chợ Rẫy 2025",
        hospitalName: "BV Chợ Rẫy TP.HCM",
        unitPrice: 130_000,
        effectiveDate: "2025-06-01",
        expiryDate: "2025-12-31",
      },
    ],
    transactionHistory: [
      {
        orderId: "ORD-2026-001",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-03-10",
        requestedQty: 5_000,
        confirmedQty: 5_000,
        deliveredQty: 5_000,
        orderStatus: "received_confirmed",
        paymentStatus: "partially_paid",
        lineAmount: 675_000_000,
      },
      {
        orderId: "ORD-2026-002",
        contractId: "CTR-2026-001",
        hospitalName: "BV Đại học Y Dược TP.HCM",
        orderDate: "2026-04-15",
        requestedQty: 222,
        confirmedQty: 200,
        deliveredQty: 0,
        orderStatus: "partially_confirmed",
        paymentStatus: "not_invoiced",
        lineAmount: 27_000_000,
      },
    ],
    createdAt: "2026-01-05T08:00:00",
    updatedAt: "2026-04-16T09:15:00",
  },
];

export const mockSupplierProfiles: SupplierDrugProfile[] = [
  {
    supplierDrugId: "SPD-001",
    drugMasterId: "DRUG-001",
    supplierId: "SUP-001",
    supplierName: "PhytoPharma",
    productImages: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?auto=format&fit=crop&w=600&q=80",
    ],
    fullDescription: "Paracetamol PhytoPharma 500mg được sản xuất theo dây chuyền hiện đại, đạt tiêu chuẩn GMP-WHO. Sản phẩm đã được phân phối cho hơn 50 bệnh viện trên toàn quốc trong 5 năm liên tiếp.",
    indications: "Giảm đau nhẹ đến vừa, hạ sốt. Phù hợp điều trị ngoại trú và nội trú.",
    contraindications: "Suy gan, mẫn cảm với Paracetamol.",
    dosageUsage: "Uống sau ăn. Người lớn: 1-2 viên/lần, 3-4 lần/ngày. Không dùng quá 8 viên/ngày.",
    storageCondition: "15–30°C, độ ẩm < 75%, tránh ánh sáng.",
    origin: "Việt Nam",
    manufacturer: "PhytoPharma – Nhà máy Bình Dương",
    registrationNumber: "VD-12345-19",
    certificates: ["GMP-WHO (Bộ Y tế cấp)", "ISO 9001:2015 (Bureau Veritas)", "HACCP"],
    documents: ["SDS (Safety Data Sheet)", "CoA Lô BATCH-PARA-0826", "Hướng dẫn sử dụng VI/EN", "Giấy phép lưu hành 2026"],
    updatedBySupplier: "Trần Văn Minh",
    updatedAt: "2026-02-10T10:00:00",
  },
  {
    supplierDrugId: "SPD-002",
    drugMasterId: "DRUG-002",
    supplierId: "SUP-001",
    supplierName: "PhytoPharma",
    productImages: [
      "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=600&q=80",
    ],
    fullDescription: "Amoxicillin 500mg do Mekophar sản xuất, PhytoPharma phân phối độc quyền tại khu vực TP.HCM và các tỉnh lân cận.",
    indications: "Kháng sinh điều trị nhiễm khuẩn đường hô hấp, tiết niệu, da và mô mềm.",
    contraindications: "Tiền sử dị ứng penicillin hoặc cephalosporin.",
    dosageUsage: "500mg × 3 lần/ngày × 7 ngày. Có thể dùng trước hoặc sau bữa ăn.",
    storageCondition: "Dưới 25°C, tránh ẩm.",
    origin: "Việt Nam",
    manufacturer: "Mekophar",
    registrationNumber: "VD-23456-20",
    certificates: ["GMP-ASEAN", "Số đăng ký: VD-23456-20"],
    documents: ["Tờ hướng dẫn sử dụng", "CoA Lô BATCH-AMOX-0626"],
    updatedBySupplier: "Trần Văn Minh",
    updatedAt: "2026-02-10T10:30:00",
  },
  {
    supplierDrugId: "SPD-003",
    drugMasterId: "DRUG-003",
    supplierId: "SUP-001",
    supplierName: "PhytoPharma",
    productImages: [
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80",
    ],
    fullDescription: "Ceftriaxone 1g nhập khẩu từ Ấn Độ, do Tecoland sản xuất theo tiêu chuẩn WHO-PQ và GMP EU. PhytoPharma là nhà phân phối chính thức tại Việt Nam.",
    indications: "Kháng sinh điều trị nhiễm khuẩn nặng: viêm phổi, nhiễm khuẩn huyết, viêm màng não, nhiễm khuẩn hậu phẫu.",
    contraindications: "Mẫn cảm với cephalosporin. Không dùng cho trẻ sơ sinh vàng da.",
    dosageUsage: "Tiêm TM chậm hoặc truyền TM: 1-2g/ngày. Pha với NaCl 0.9% hoặc Glucose 5%.",
    storageCondition: "Dưới 25°C, tránh ánh sáng. Dung dịch sau pha dùng trong 6h (nhiệt độ phòng).",
    origin: "Ấn Độ",
    manufacturer: "Tecoland Corporation Pvt. Ltd",
    registrationNumber: "VN-34567-21",
    certificates: ["WHO-PQ Certified", "GMP EU", "Số đăng ký: VN-34567-21"],
    documents: [
      "Certificate of Analysis (CoA) Lô BATCH-CEF-0326",
      "Giấy phép nhập khẩu 2026",
      "WHO-PQ Certificate",
      "GMP EU Certificate",
      "Tờ hướng dẫn sử dụng VI/EN",
    ],
    updatedBySupplier: "Trần Văn Minh",
    updatedAt: "2026-02-15T14:00:00",
  },
];

// Contract drug items — linked to DrugMaster
export const mockContractDrugItems: ContractDrugItem[] = [
  {
    contractItemId: "ITEM-001",
    contractId: "CTR-2026-001",
    contractCode: "HD-PP-UMC-2026-001",
    tenderPackageId: "GT-2026-001",
    hospitalId: "HOSP-001",
    hospitalName: "BV Đại học Y Dược TP.HCM",
    drugMasterId: "DRUG-001",
    drugName: "Paracetamol 500mg",
    activeIngredient: "Paracetamol",
    specification: "Hộp 10 vỉ × 10 viên",
    unitPrice: 18_000,
    contractedQty: 50_000,
    requestedQty: 12_500,
    confirmedQty: 11_000,
    deliveredQty: 9_000,
    remainingQty: 37_500,
    supplierId: "SUP-001",
    contractValidity: "2026-12-31",
  },
  {
    contractItemId: "ITEM-002",
    contractId: "CTR-2026-001",
    contractCode: "HD-PP-UMC-2026-001",
    tenderPackageId: "GT-2026-001",
    hospitalId: "HOSP-001",
    hospitalName: "BV Đại học Y Dược TP.HCM",
    drugMasterId: "DRUG-002",
    drugName: "Amoxicillin 500mg",
    activeIngredient: "Amoxicillin trihydrate",
    specification: "Hộp 10 vỉ × 10 viên",
    unitPrice: 42_000,
    contractedQty: 30_000,
    requestedQty: 10_000,
    confirmedQty: 10_000,
    deliveredQty: 9_000,
    remainingQty: 20_000,
    supplierId: "SUP-001",
    contractValidity: "2026-12-31",
  },
  {
    contractItemId: "ITEM-003",
    contractId: "CTR-2026-001",
    contractCode: "HD-PP-UMC-2026-001",
    tenderPackageId: "GT-2026-001",
    hospitalId: "HOSP-001",
    hospitalName: "BV Đại học Y Dược TP.HCM",
    drugMasterId: "DRUG-003",
    drugName: "Ceftriaxone 1g",
    activeIngredient: "Ceftriaxone natri",
    specification: "Hộp 10 lọ × 1g",
    unitPrice: 135_000,
    contractedQty: 15_000,
    requestedQty: 5_222,
    confirmedQty: 5_200,
    deliveredQty: 5_000,
    remainingQty: 9_778,
    supplierId: "SUP-001",
    contractValidity: "2026-12-31",
  },
];

// Helper: get supplier profile for a drug
export function getSupplierProfile(drugMasterId: string): SupplierDrugProfile | undefined {
  return mockSupplierProfiles.find((p) => p.drugMasterId === drugMasterId);
}

// Helper: get contract items for a drug
export function getContractItems(drugMasterId: string): ContractDrugItem[] {
  return mockContractDrugItems.filter((item) => item.drugMasterId === drugMasterId);
}

// Drug matching logic (mock)
export type MatchResult = { status: "exact_match"; drug: DrugMaster } | { status: "possible_match"; candidates: DrugMaster[] } | { status: "no_match" };

export function matchDrug(params: {
  drugName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  specification: string;
  manufacturer: string;
}): MatchResult {
  const exact = mockDrugMasters.find(
    (d) =>
      d.drugName.toLowerCase() === params.drugName.toLowerCase() &&
      d.activeIngredient.toLowerCase() === params.activeIngredient.toLowerCase() &&
      d.strength.toLowerCase() === params.strength.toLowerCase()
  );
  if (exact) return { status: "exact_match", drug: exact };

  const possible = mockDrugMasters.filter(
    (d) =>
      d.activeIngredient.toLowerCase() === params.activeIngredient.toLowerCase() ||
      d.drugName.toLowerCase().includes(params.activeIngredient.toLowerCase())
  );
  if (possible.length > 0) return { status: "possible_match", candidates: possible };

  return { status: "no_match" };
}

