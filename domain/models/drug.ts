// ─────────────────────────────────────────────────────────
// DRUG DOMAIN MODEL
// Three-layer model: DrugMaster (unified) + ContractDrugItem (from contract)
//                  + SupplierDrugProfile (enriched by supplier)
// ─────────────────────────────────────────────────────────

export type DrugSourceType = "contract_derived" | "supplier_created";

export type DrugMatchStatus =
  | "exact_match"    // linked to existing drug master
  | "possible_match" // needs admin approval
  | "no_match";      // new drug created

// ── Drug Master Profile (unified across all sources) ──────
export interface PriceHistoryEntry {
  contractId: string;
  contractCode: string;
  contractName: string;
  hospitalName: string;
  unitPrice: number;
  effectiveDate: string;
  expiryDate: string;
}

export interface TransactionHistoryEntry {
  orderId: string;
  contractId: string;
  hospitalName: string;
  orderDate: string;
  requestedQty: number;
  confirmedQty: number;
  deliveredQty: number;
  orderStatus: string;
  paymentStatus: string;
  lineAmount: number;
}

export interface DrugMaster {
  id: string;                        // "DRUG-001"
  drugName: string;
  activeIngredient: string;
  dosageForm: string;                // "Viên nén", "Bột pha tiêm"
  strength: string;                  // "500mg", "1g"
  specification: string;             // "Hộp 10 vỉ x 10 viên"
  unit: string;                      // "Hộp"
  manufacturer: string;
  origin: string;                    // "Việt Nam", "Ấn Độ"
  supplierId: string;
  supplierName: string;
  sourceType: DrugSourceType;
  matchStatus: DrugMatchStatus;

  // ── Catalog enrichment ──
  images: string[];                  // placeholder URLs
  description: string;
  indications?: string;
  contraindications?: string;
  dosageUsage?: string;
  storageCondition?: string;
  registrationNumber?: string;       // Số đăng ký
  certificates?: string[];
  documents?: string[];

  // ── Linked data ──
  linkedContractItemIds: string[];
  linkedTenderPackageIds?: string[];
  priceHistory: PriceHistoryEntry[];
  transactionHistory: TransactionHistoryEntry[];

  createdAt: string;
  updatedAt: string;
}

// ── Supplier-managed Drug Profile (enriched layer) ─────────
export interface SupplierDrugProfile {
  supplierDrugId: string;
  drugMasterId: string;
  supplierId: string;
  supplierName: string;
  productImages: string[];
  fullDescription: string;
  indications: string;
  contraindications: string;
  dosageUsage: string;
  storageCondition: string;
  origin: string;
  manufacturer: string;
  registrationNumber: string;
  certificates: string[];
  documents: string[];
  updatedBySupplier: string;
  updatedAt: string;
}

// ── Contract Drug Item (derived from contract upload) ──────
// This is similar to ContractItem but with drug catalog linkage
export interface ContractDrugItem {
  contractItemId: string;
  contractId: string;
  contractCode: string;
  tenderPackageId: string;
  hospitalId: string;
  hospitalName: string;
  drugMasterId: string;              // linked to DrugMaster
  drugName: string;
  activeIngredient: string;
  specification: string;
  unitPrice: number;
  contractedQty: number;
  requestedQty: number;
  confirmedQty: number;
  deliveredQty: number;
  remainingQty: number;
  supplierId: string;
  contractValidity: string;         // contract end date
}
