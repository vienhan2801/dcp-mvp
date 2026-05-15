// Portal-specific color themes — used in dashboards and layout accents

export type PortalType = "supplier" | "hospital" | "manufacturer" | "pharmacy";

export interface PortalTheme {
  name: string;
  icon: string;
  accent: string;       // primary brand color
  accentLight: string;  // light tint background
  accentBorder: string; // border color
  accentText: string;   // text on light bg
  accentMuted: string;  // muted accent
  description: string;
}

export const PORTAL_THEMES: Record<PortalType, PortalTheme> = {
  supplier: {
    name: "Nhà phân phối",
    icon: "🚛",
    accent: "#024430",
    accentLight: "#F0FDF4",
    accentBorder: "#BBF7D0",
    accentText: "#15803D",
    accentMuted: "#86EFAC",
    description: "PhytoPharma — trung gian giữa nhà sản xuất và bệnh viện / nhà thuốc",
  },
  hospital: {
    name: "Bệnh viện",
    icon: "🏥",
    accent: "#1D4ED8",
    accentLight: "#EFF6FF",
    accentBorder: "#BFDBFE",
    accentText: "#1D4ED8",
    accentMuted: "#93C5FD",
    description: "Mua thuốc theo gói thầu và hợp đồng đấu thầu công khai",
  },
  pharmacy: {
    name: "Nhà thuốc",
    icon: "💊",
    accent: "#0F766E",
    accentLight: "#F0FDFA",
    accentBorder: "#99F6E4",
    accentText: "#0F766E",
    accentMuted: "#5EEAD4",
    description: "Nhập thuốc lẻ theo đợt — không cần đấu thầu",
  },
  manufacturer: {
    name: "Nhà cung cấp",
    icon: "🏭",
    accent: "#6D28D9",
    accentLight: "#F5F3FF",
    accentBorder: "#DDD6FE",
    accentText: "#6D28D9",
    accentMuted: "#C4B5FD",
    description: "Sản xuất / nhập khẩu — cung cấp hàng cho nhà phân phối",
  },
};
