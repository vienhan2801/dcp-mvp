"use client";
import React, { useState, useEffect, useRef, ReactNode, forwardRef, HTMLAttributes } from "react";

/* ─────────────────────────────────────────────
   CARD
───────────────────────────────────────────── */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#E4EAE7] rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}
export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>;
}
export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

/* ─────────────────────────────────────────────
   PROGRESS
───────────────────────────────────────────── */
interface ProgressProps {
  value: number;
  size?: "sm" | "md" | "lg";
  classNames?: { indicator?: string; track?: string };
  className?: string;
}
export function Progress({ value, size = "md", classNames = {}, className = "" }: ProgressProps) {
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-[#E4EAE7] rounded-full ${h} ${className} ${classNames.track ?? ""}`}>
      <div
        className={`${h} rounded-full bg-[#024430] transition-all ${classNames.indicator ?? ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────── */
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-[#E4EAE7] ${className}`} />;
}

/* ─────────────────────────────────────────────
   CHIP / TAG
───────────────────────────────────────────── */
type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type ChipVariant = "flat" | "solid" | "bordered";

const chipColorMap: Record<ChipColor, Record<ChipVariant, string>> = {
  default: {
    flat: "bg-gray-100 text-gray-700",
    solid: "bg-gray-600 text-white",
    bordered: "border border-gray-400 text-gray-700",
  },
  primary: {
    flat: "bg-[#024430]/10 text-[#024430]",
    solid: "bg-[#024430] text-white",
    bordered: "border border-[#024430] text-[#024430]",
  },
  secondary: {
    flat: "bg-purple-100 text-purple-700",
    solid: "bg-purple-600 text-white",
    bordered: "border border-purple-400 text-purple-700",
  },
  success: {
    flat: "bg-green-100 text-green-700",
    solid: "bg-green-600 text-white",
    bordered: "border border-green-400 text-green-700",
  },
  warning: {
    flat: "bg-amber-100 text-amber-700",
    solid: "bg-amber-500 text-white",
    bordered: "border border-amber-400 text-amber-700",
  },
  danger: {
    flat: "bg-red-100 text-red-700",
    solid: "bg-red-600 text-white",
    bordered: "border border-red-400 text-red-700",
  },
};

interface ChipProps {
  children: ReactNode;
  color?: ChipColor;
  variant?: ChipVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}
export function Chip({ children, color = "default", variant = "flat", size = "sm", className = "" }: ChipProps) {
  const sz = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-sm px-3 py-1.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sz} ${chipColorMap[color][variant]} ${className}`}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   BADGE
───────────────────────────────────────────── */
interface BadgeProps {
  children: ReactNode;
  content?: string | number;
  color?: "default" | "primary" | "danger" | "warning" | "success";
  size?: "sm" | "md";
}
export function Badge({ children, content, color = "danger", size = "sm" }: BadgeProps) {
  const bg = color === "danger" ? "bg-red-500" : color === "primary" ? "bg-[#024430]" : color === "warning" ? "bg-amber-500" : color === "success" ? "bg-green-500" : "bg-gray-400";
  return (
    <div className="relative inline-flex">
      {children}
      {content !== undefined && (
        <span className={`absolute -top-1 -right-1 ${bg} text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5`}>
          {content}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const sz = size === "sm" ? "w-8 h-8 text-sm" : size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base";
  const initials = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold bg-[#024430] text-white overflow-hidden flex-shrink-0 ${className}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BUTTON
───────────────────────────────────────────── */
type ButtonVariant = "solid" | "light" | "flat" | "bordered" | "ghost";
type ButtonColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: "sm" | "md" | "lg";
  isDisabled?: boolean;
  isLoading?: boolean;
  isIconOnly?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}
export function Button({
  children,
  onClick,
  onPress,
  variant = "solid",
  color,
  size = "md",
  isDisabled = false,
  isLoading = false,
  isIconOnly = false,
  startContent,
  endContent,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const sz = size === "sm" ? "px-3 py-1.5 text-sm h-8" : size === "lg" ? "px-6 py-3 text-base h-12" : "px-4 py-2 text-sm h-10";
  const iconSz = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10";

  // Color-aware solid backgrounds
  const solidBg: Record<string, string> = {
    primary:   "bg-[#024430] text-white hover:bg-[#056246]",
    secondary: "bg-purple-600 text-white hover:bg-purple-700",
    success:   "bg-green-600 text-white hover:bg-green-700",
    warning:   "bg-amber-500 text-white hover:bg-amber-600",
    danger:    "bg-red-600 text-white hover:bg-red-700",
    default:   "bg-[#024430] text-white hover:bg-[#056246]",
  };

  let base = "";
  if (className.includes("bg-")) {
    base = ""; // className already sets the background
  } else if (variant === "light") {
    base = "bg-transparent hover:bg-[#F6F8F7] text-[#6B7A73] hover:text-[#10231C]";
  } else if (variant === "flat") {
    base = "bg-[#F6F8F7] text-[#10231C] hover:bg-[#E4EAE7]";
  } else if (variant === "bordered") {
    base = "bg-transparent border border-[#E4EAE7] text-[#10231C] hover:bg-[#F6F8F7]";
  } else if (variant === "ghost") {
    base = "bg-transparent hover:bg-[#F6F8F7] border border-transparent hover:border-[#E4EAE7] text-[#10231C]";
  } else {
    base = solidBg[color ?? "default"] ?? solidBg.default;
  }

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={isDisabled || isLoading}
      onClick={onClick || onPress}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isIconOnly ? iconSz + " p-0" : sz} ${base} ${className}`}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {startContent}
          {!isIconOnly && children}
          {isIconOnly && children}
          {endContent}
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   INPUT
───────────────────────────────────────────── */
interface InputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  size?: "sm" | "md" | "lg";
  startContent?: ReactNode;
  endContent?: ReactNode;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  className?: string;
  classNames?: { inputWrapper?: string; label?: string; input?: string };
  min?: string;
  max?: string;
  "aria-label"?: string;
}
export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  size = "md",
  startContent,
  isDisabled,
  className = "",
  classNames = {},
  min,
  max,
  "aria-label": ariaLabel,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className={`text-xs font-medium text-[#6B7A73] ${classNames.label ?? ""}`}>{label}</label>}
      <div className={`flex items-center border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] px-3 ${size === "sm" ? "h-9" : "h-10"} ${classNames.inputWrapper ?? ""}`}>
        {startContent && <span className="mr-2 flex-shrink-0">{startContent}</span>}
        <input
          aria-label={ariaLabel ?? label}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isDisabled}
          min={min}
          max={max}
          className={`flex-1 bg-transparent text-sm text-[#10231C] outline-none placeholder:text-[#6B7A73] ${classNames.input ?? ""}`}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TEXTAREA
───────────────────────────────────────────── */
interface TextareaProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  classNames?: { inputWrapper?: string; label?: string };
}
export function Textarea({ label, value, onChange, placeholder, minRows = 3, className = "", classNames = {} }: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className={`text-xs font-medium text-[#6B7A73] ${classNames.label ?? ""}`}>{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={minRows}
        className={`border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] px-3 py-2 text-sm text-[#10231C] outline-none placeholder:text-[#6B7A73] resize-none focus:border-[#024430] transition-colors ${classNames.inputWrapper ?? ""}`}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SELECT
───────────────────────────────────────────── */
interface SelectProps {
  label?: string;
  value?: string;
  selectedKeys?: string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  classNames?: { label?: string };
  "aria-label"?: string;
}
export function Select({ label, selectedKeys, onChange, children, size = "md", className = "", classNames = {}, "aria-label": ariaLabel }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className={`text-xs font-medium text-[#6B7A73] ${classNames.label ?? ""}`}>{label}</label>}
      <select
        aria-label={ariaLabel ?? label}
        value={selectedKeys?.[0]}
        onChange={onChange}
        className={`border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] px-3 text-sm text-[#10231C] outline-none focus:border-[#024430] transition-colors ${size === "sm" ? "h-9" : "h-10"}`}
      >
        {children}
      </select>
    </div>
  );
}
export function SelectItem({ children, key: _key, value }: { children: ReactNode; key?: string; value?: string }) {
  return <option value={value ?? _key}>{children}</option>;
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen((v) => !v),
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}
export function Modal({ isOpen, onClose, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : size === "xl" ? "max-w-4xl" : size === "full" ? "max-w-full m-4" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[90vh] overflow-y-auto z-[51]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
export function ModalContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function ModalHeader({ children }: { children: ReactNode }) {
  return <div className="px-6 pt-6 pb-4 text-lg font-semibold text-[#10231C] border-b border-[#E4EAE7]">{children}</div>;
}
export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="px-6 py-5">{children}</div>;
}
export function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-6 pt-0 flex justify-end gap-2">{children}</div>;
}

/* ─────────────────────────────────────────────
   TABS
───────────────────────────────────────────── */
interface TabItem {
  key: string;
  title: ReactNode;
  children: ReactNode;
}

interface TabsProps {
  "aria-label"?: string;
  children: React.ReactElement<TabItem> | React.ReactElement<TabItem>[];
  classNames?: { tabList?: string; cursor?: string; tab?: string; tabContent?: string };
  defaultSelectedKey?: string;
}
export function Tabs({ children, classNames = {}, defaultSelectedKey }: TabsProps) {
  const items = React.Children.toArray(children) as React.ReactElement<TabItem & { "data-key"?: string }>[];
  const firstKey = items[0]?.props?.["data-key"] ?? (items[0] as unknown as { key: string })?.key?.replace(/^\.\$/, "") ?? "";
  const [active, setActive] = useState(defaultSelectedKey ?? firstKey);

  // Extract actual key from React's internal key format (e.g., ".$summary" → "summary")
  const getKey = (el: React.ReactElement) => {
    const k = (el as unknown as { key: string }).key ?? "";
    return k.replace(/^\.\$/, "");
  };

  const activeItem = items.find((it) => getKey(it) === active) ?? items[0];

  return (
    <div>
      {/* Tab list */}
      <div className={`flex flex-wrap gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1 ${classNames.tabList ?? ""}`}>
        {items.map((item) => {
          const k = getKey(item);
          const isActive = k === active;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setActive(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#024430] text-white shadow-sm"
                  : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
              } ${classNames.tab ?? ""}`}
            >
              {item.props.title}
            </button>
          );
        })}
      </div>
      {/* Active panel */}
      <div>{activeItem?.props.children}</div>
    </div>
  );
}
export function Tab({ children }: TabItem) {
  return <>{children}</>;
}

/* ─────────────────────────────────────────────
   TABLE
───────────────────────────────────────────── */
interface TableProps {
  children: ReactNode;
  "aria-label"?: string;
  classNames?: { wrapper?: string; th?: string; td?: string };
}
export function Table({ children, "aria-label": ariaLabel, classNames = {} }: TableProps) {
  return (
    <div className={`overflow-x-auto border border-[#E4EAE7] rounded-xl ${classNames.wrapper ?? ""}`} aria-label={ariaLabel}>
      <table className="w-full border-collapse">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ classNames?: Record<string, string> }>, { classNames })
            : child
        )}
      </table>
    </div>
  );
}
export function TableHeader({ children, classNames }: { children: ReactNode; classNames?: Record<string, string> }) {
  return (
    <thead>
      <tr>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ classNames?: Record<string, string> }>, { classNames })
            : child
        )}
      </tr>
    </thead>
  );
}
export function TableColumn({ children, className = "", classNames }: { children: ReactNode; className?: string; classNames?: Record<string, string> }) {
  return (
    <th className={`text-left px-3 py-3 text-xs font-semibold text-[#6B7A73] bg-[#F6F8F7] whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl ${classNames?.th ?? ""} ${className}`}>
      {children}
    </th>
  );
}
export function TableBody({ children, classNames }: { children: ReactNode; classNames?: Record<string, string> }) {
  return (
    <tbody>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ classNames?: Record<string, string> }>, { classNames })
          : child
      )}
    </tbody>
  );
}
export function TableRow({ children, className = "", classNames }: { children: ReactNode; className?: string; classNames?: Record<string, string> }) {
  return (
    <tr className={`border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors ${className}`}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ classNames?: Record<string, string> }>, { classNames })
          : child
      )}
    </tr>
  );
}
export function TableCell({ children, className = "", classNames }: { children: ReactNode; className?: string; classNames?: Record<string, string> }) {
  return (
    <td className={`px-3 py-3 text-sm text-[#10231C] ${classNames?.td ?? ""} ${className}`}>
      {children}
    </td>
  );
}
