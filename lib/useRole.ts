"use client";
import { useApp } from "@/lib/store";
import { UserRole } from "@/domain/models/evidence";

export interface RoleCapabilities {
  role: UserRole;

  // ── NPP sub-roles ─────────────────────────────────────────────
  isNPPAdmin: boolean;
  isNPPLogistics: boolean;
  isNPPFinance: boolean;
  isAnyNPP: boolean;

  // ── Manufacturer sub-roles ────────────────────────────────────
  isManufacturerAdmin: boolean;
  isManufacturerLogistics: boolean;
  isManufacturerFinance: boolean;
  isAnyManufacturer: boolean;

  // ── Hospital sub-roles ────────────────────────────────────────
  isHospitalAdmin: boolean;
  isHospitalBuyer: boolean;
  isHospitalWarehouse: boolean;
  isHospitalFinance: boolean;
  isAnyHospital: boolean;

  // ── Pharmacy sub-roles ────────────────────────────────────────
  isPharmacyAdmin: boolean;
  isPharmacyBuyer: boolean;
  isPharmacyWarehouse: boolean;
  isPharmacyFinance: boolean;
  isAnyPharmacy: boolean;

  // ── Backward-compat shorthands ────────────────────────────────
  isHospital: boolean;
  isPharmacy: boolean;
  isManufacturer: boolean;

  // ── Workflow capabilities ─────────────────────────────────────
  canPlaceOrders: boolean;
  canViewOrders: boolean;
  canConfirmOrders: boolean;
  canManageInventory: boolean;
  canReceiveGoods: boolean;
  canConfirmDelivery: boolean;
  canDispatchGoods: boolean;
  canManagePayments: boolean;
  // Evidence uploads — who uploads what
  canUploadPaymentProof: boolean;   // the party that PAYS
  canUploadDispatchProof: boolean;  // the party that SHIPS
  canUploadReceiptProof: boolean;   // the party that RECEIVES
  canViewContracts: boolean;
  canManageContracts: boolean;
  canManageProducts: boolean;
  // legacy
  canUploadEvidence: boolean;

  displayName: string;
}

export function useRole(): RoleCapabilities {
  const { state } = useApp();
  const role = state.currentRole;

  const isNPPAdmin      = role === "supplier_admin";
  const isNPPLogistics  = role === "supplier_logistics";
  const isNPPFinance    = role === "supplier_finance";
  const isAnyNPP        = isNPPAdmin || isNPPLogistics || isNPPFinance;

  const isManufacturerAdmin      = role === "manufacturer_admin";
  const isManufacturerLogistics  = role === "manufacturer_logistics";
  const isManufacturerFinance    = role === "manufacturer_finance";
  const isAnyManufacturer        = isManufacturerAdmin || isManufacturerLogistics || isManufacturerFinance;

  const isHospitalAdmin     = role === "hospital_admin";
  const isHospitalBuyer     = role === "hospital_buyer";
  const isHospitalWarehouse = role === "hospital_warehouse";
  const isHospitalFinance   = role === "hospital_finance";
  const isAnyHospital       = isHospitalAdmin || isHospitalBuyer || isHospitalWarehouse || isHospitalFinance;

  const isPharmacyAdmin     = role === "pharmacy_admin";
  const isPharmacyBuyer     = role === "pharmacy_buyer";
  const isPharmacyWarehouse = role === "pharmacy_warehouse";
  const isPharmacyFinance   = role === "pharmacy_finance";
  const isAnyPharmacy       = isPharmacyAdmin || isPharmacyBuyer || isPharmacyWarehouse || isPharmacyFinance;

  const displayNames: Record<UserRole, string> = {
    supplier_admin:         "NPP · Quản trị",
    supplier_logistics:     "NPP · Kho vận",
    supplier_finance:       "NPP · Tài chính",
    manufacturer_admin:     "NCC · Quản trị",
    manufacturer_logistics: "NCC · Kho vận",
    manufacturer_finance:   "NCC · Tài chính",
    hospital_admin:         "Bệnh viện · Quản trị",
    hospital_buyer:         "Bệnh viện · Mua hàng",
    hospital_warehouse:     "Bệnh viện · Kho vận",
    hospital_finance:       "Bệnh viện · Tài chính",
    pharmacy_admin:         "Nhà thuốc · Quản trị",
    pharmacy_buyer:         "Nhà thuốc · Đặt hàng",
    pharmacy_warehouse:     "Nhà thuốc · Kho vận",
    pharmacy_finance:       "Nhà thuốc · Tài chính",
    customer_admin:         "Khách hàng · Quản trị",
    customer_buyer:         "Khách hàng · Mua hàng",
    customer_receiver:      "Khách hàng · Nhận hàng",
    customer_finance:       "Khách hàng · Tài chính",
  };

  return {
    role,
    isNPPAdmin, isNPPLogistics, isNPPFinance, isAnyNPP,
    isManufacturerAdmin, isManufacturerLogistics, isManufacturerFinance, isAnyManufacturer,
    isHospitalAdmin, isHospitalBuyer, isHospitalWarehouse, isHospitalFinance, isAnyHospital,
    isPharmacyAdmin, isPharmacyBuyer, isPharmacyWarehouse, isPharmacyFinance, isAnyPharmacy,
    isHospital: isAnyHospital,
    isPharmacy: isAnyPharmacy,
    isManufacturer: isAnyManufacturer,

    canPlaceOrders:    isHospitalAdmin || isHospitalBuyer || isPharmacyAdmin || isPharmacyBuyer,
    canViewOrders:     isAnyNPP || isAnyHospital || isAnyPharmacy || isManufacturerAdmin || isManufacturerLogistics,
    canConfirmOrders:  isNPPAdmin || isNPPLogistics || isManufacturerAdmin,

    canManageInventory: isNPPAdmin || isNPPLogistics ||
                        isManufacturerAdmin || isManufacturerLogistics ||
                        isHospitalAdmin || isHospitalWarehouse ||
                        isPharmacyAdmin || isPharmacyWarehouse,
    canReceiveGoods:    isHospitalWarehouse || isHospitalAdmin ||
                        isPharmacyWarehouse || isPharmacyAdmin ||
                        isNPPLogistics || isNPPAdmin,

    canConfirmDelivery: isNPPAdmin || isNPPLogistics || isManufacturerAdmin || isManufacturerLogistics,
    canDispatchGoods:   isNPPAdmin || isNPPLogistics || isManufacturerAdmin || isManufacturerLogistics,

    canManagePayments:  isNPPAdmin || isNPPFinance ||
                        isManufacturerAdmin || isManufacturerFinance ||
                        isHospitalAdmin || isHospitalFinance ||
                        isPharmacyAdmin || isPharmacyFinance,

    // Evidence: who uploads what
    // NPP finance → pays manufacturer; hospital/pharmacy finance → pays NPP
    canUploadPaymentProof:  isNPPFinance || isNPPAdmin ||
                            isHospitalFinance || isHospitalAdmin ||
                            isPharmacyFinance || isPharmacyAdmin ||
                            isManufacturerFinance || isManufacturerAdmin,

    // NPP logistics → ships to hospital/pharmacy; manufacturer logistics → ships to NPP
    canUploadDispatchProof: isNPPLogistics || isNPPAdmin ||
                            isManufacturerLogistics || isManufacturerAdmin,

    // Hospital/pharmacy warehouse → receives from NPP; NPP logistics → receives from manufacturer
    canUploadReceiptProof:  isHospitalWarehouse || isHospitalAdmin ||
                            isPharmacyWarehouse || isPharmacyAdmin ||
                            isNPPLogistics || isNPPAdmin,

    canViewContracts:   isNPPAdmin || isNPPFinance ||
                        isManufacturerAdmin || isManufacturerFinance ||
                        isHospitalAdmin || isHospitalBuyer || isHospitalFinance ||
                        isPharmacyAdmin || isPharmacyBuyer || isPharmacyFinance,
    canManageContracts: isNPPAdmin,

    canManageProducts:  isAnyManufacturer,

    canUploadEvidence: true, // legacy — use specific flags instead

    displayName: displayNames[role],
  };
}
