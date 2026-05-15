"use client";
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Contract } from "@/domain/models/contract";
import { Order } from "@/domain/models/order";
import { PaymentRecord, PaymentStatus } from "@/domain/models/payment";
import { EvidenceLog, UserRole } from "@/domain/models/evidence";
import { DrugMaster, SupplierDrugProfile } from "@/domain/models/drug";
import { mockContract } from "@/domain/mock/contracts";
import { mockOrders } from "@/domain/mock/orders";
import { mockPayments } from "@/domain/mock/payments";
import { mockEvidence } from "@/domain/mock/evidence";
import { mockDrugMasters, mockSupplierProfiles } from "@/domain/mock/drugs";
import { applyOrderToContract, applyConfirmationToContract, applyDeliveryToContract } from "@/domain/logic/allocationLogic";
import { confirmOrderLines, advanceDeliveryStatus, confirmReceipt } from "@/domain/logic/orderLogic";
import { createPaymentRecord, updatePayment as updatePaymentRecord } from "@/domain/logic/paymentLogic";

export interface AppState {
  currentRole: UserRole;
  contract: Contract;
  orders: Order[];
  payments: PaymentRecord[];
  evidenceLogs: EvidenceLog[];
  drugMasters: DrugMaster[];
  supplierProfiles: SupplierDrugProfile[];
}

export type Action =
  | { type: "SET_ROLE"; payload: UserRole }
  | { type: "CREATE_ORDER"; payload: { order: Order; evidence: EvidenceLog } }
  | { type: "CONFIRM_ORDER_LINES"; payload: { orderId: string; confirmations: { lineId: string; contractItemId: string; confirmedQty: number; note?: string }[]; evidence: EvidenceLog } }
  | { type: "ADVANCE_DELIVERY"; payload: { orderId: string; evidence: EvidenceLog } }
  | { type: "CONFIRM_RECEIPT"; payload: { orderId: string; evidence: EvidenceLog } }
  | { type: "UPDATE_PAYMENT"; payload: { paymentId: string; paidAmount: number; status: PaymentStatus; evidence: EvidenceLog } }
  | { type: "ADD_EVIDENCE"; payload: EvidenceLog }
  | { type: "APPROVE_ORDER"; payload: { orderId: string; evidence: EvidenceLog } }
  | { type: "REJECT_ORDER"; payload: { orderId: string; reason: string; evidence: EvidenceLog } }
  | { type: "UPDATE_SUPPLIER_PROFILE"; payload: { drugMasterId: string; profile: Partial<SupplierDrugProfile> } }
  | { type: "ADD_DRUG_MASTER"; payload: DrugMaster };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, currentRole: action.payload };

    case "CREATE_ORDER": {
      const { order, evidence } = action.payload;
      const updatedContract = applyOrderToContract(state.contract, order.lines.map((l) => ({ contractItemId: l.contractItemId, requestedQty: l.requestedQty })));
      return { ...state, orders: [...state.orders, order], contract: updatedContract, evidenceLogs: [evidence, ...state.evidenceLogs] };
    }

    case "CONFIRM_ORDER_LINES": {
      const { orderId, confirmations, evidence } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;
      const updatedOrder = confirmOrderLines(order, confirmations);
      const updatedContract = applyConfirmationToContract(state.contract, confirmations.map((c) => ({ contractItemId: c.contractItemId, confirmedQty: c.confirmedQty })));
      return { ...state, orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)), contract: updatedContract, evidenceLogs: [evidence, ...state.evidenceLogs] };
    }

    case "ADVANCE_DELIVERY": {
      const { orderId, evidence } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;
      return { ...state, orders: state.orders.map((o) => (o.id === orderId ? advanceDeliveryStatus(o) : o)), evidenceLogs: [evidence, ...state.evidenceLogs] };
    }

    case "CONFIRM_RECEIPT": {
      const { orderId, evidence } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;
      const updatedOrder = confirmReceipt(order);
      const updatedContract = applyDeliveryToContract(state.contract, updatedOrder.lines.map((l) => ({ contractItemId: l.contractItemId, deliveredQty: l.deliveredQty })));
      const existingPayment = state.payments.find((p) => p.orderId === orderId);
      const confirmedAmount = order.lines.reduce((s, l) => s + l.confirmedQty * l.unitPrice, 0);
      const updatedPayments = existingPayment ? state.payments : [...state.payments, createPaymentRecord(orderId, order.contractId, confirmedAmount)];
      return { ...state, orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)), contract: updatedContract, payments: updatedPayments, evidenceLogs: [evidence, ...state.evidenceLogs] };
    }

    case "UPDATE_PAYMENT": {
      const { paymentId, paidAmount, evidence } = action.payload;
      const updatedPayments = state.payments.map((p) => (p.id !== paymentId ? p : updatePaymentRecord(p, paidAmount)));
      const totalPaid = updatedPayments.reduce((s, p) => s + p.paidAmount, 0);
      return { ...state, payments: updatedPayments, contract: { ...state.contract, paidValue: totalPaid, outstandingValue: state.contract.deliveredValue - totalPaid }, evidenceLogs: [evidence, ...state.evidenceLogs] };
    }

    case "ADD_EVIDENCE":
      return { ...state, evidenceLogs: [action.payload, ...state.evidenceLogs] };

    case "APPROVE_ORDER": {
      const { orderId, evidence } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: "pending_confirmation" as const } : o
        ),
        evidenceLogs: [evidence, ...state.evidenceLogs],
      };
    }

    case "REJECT_ORDER": {
      const { orderId, evidence } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: "rejected" as const } : o
        ),
        evidenceLogs: [evidence, ...state.evidenceLogs],
      };
    }

    case "UPDATE_SUPPLIER_PROFILE": {
      const { drugMasterId, profile } = action.payload;
      const existingIdx = state.supplierProfiles.findIndex((p) => p.drugMasterId === drugMasterId);
      if (existingIdx === -1) return state;
      const updated = state.supplierProfiles.map((p) =>
        p.drugMasterId === drugMasterId ? { ...p, ...profile, updatedAt: new Date().toISOString() } : p
      );
      return { ...state, supplierProfiles: updated };
    }

    case "ADD_DRUG_MASTER":
      return { ...state, drugMasters: [...state.drugMasters, action.payload] };

    default:
      return state;
  }
}

const initialState: AppState = {
  currentRole: "hospital_buyer",
  contract: mockContract,
  orders: mockOrders,
  payments: mockPayments,
  evidenceLogs: mockEvidence,
  drugMasters: mockDrugMasters,
  supplierProfiles: mockSupplierProfiles,
};
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
