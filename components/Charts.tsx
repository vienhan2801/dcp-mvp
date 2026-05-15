"use client";

// ─────────────────────────────────────────────────────────────────────────────
// DCP Chart Library — pure SVG, zero dependencies
// Professional edition: gradients, animations, hover states, drop shadows
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useId } from "react";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3
    ? h.split("").map((c) => c + c).join("")
    : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lighten(hex: string, amount = 0.25): string {
  const [r, g, b] = hexToRgb(hex);
  const l = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${l(r)},${l(g)},${l(b)})`;
}

/** Lighten a hex color by adding `add` to each channel (for gradient stops) */
function lightenHex(hex: string, add = 60): string {
  const [r, g, b] = hexToRgb(hex);
  const toHex = (n: number) => Math.min(255, n + add).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Smooth cubic bezier path through points — uses mid-point control handles */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
  }
  return d;
}

// Keep cubicBezierPath as alias for backward compat (used by SparkLine indirectly)
function cubicBezierPath(points: [number, number][]): string {
  return smoothPath(points);
}

// ─── DonutChart ───────────────────────────────────────────────────────────────
export interface DonutChartProps {
  value: number;          // 0–max
  max: number;
  label?: string;
  sublabel?: string;
  color?: string;         // stroke color
  size?: number;          // px diameter
  thickness?: number;     // stroke width
  showPercent?: boolean;
}

export function DonutChart({
  value, max, label, sublabel,
  color = "#024430", size = 120, thickness = 10, showPercent = true,
}: DonutChartProps) {
  const uid = useId().replace(/:/g, "");
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const dash = pct * circumference;
  const displayLabel = label ?? (showPercent ? `${Math.round(pct * 100)}%` : "");

  // Track ring: accent color at ~15% opacity (hex suffix "25" ≈ 15%)
  const trackColor = color + "25";
  // Lighter arc stop: add 60 to each RGB channel
  const lightArcColor = lightenHex(color, 60);

  const gradId = `donut-grad-${uid}`;
  const filterId = `donut-glow-${uid}`;
  const numTicks = 8;

  // Gradient must use userSpaceOnUse so it works correctly with rotated stroke
  // Arc runs from top (-90°) so gradient goes roughly left→right across the ring
  const gx1 = cx - r;
  const gx2 = cx + r;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
        <defs>
          {/* Gradient for the value arc — userSpaceOnUse to avoid objectBoundingBox bug */}
          <linearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1={gx1} y1={cy}
            x2={gx2} y2={cy}
          >
            <stop offset="0%" stopColor={lightArcColor} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>

          {/* Glow filter for value arc */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer track ring — soft tint */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />

        {/* Subtle white inner circle for card depth effect */}
        <circle
          cx={cx} cy={cy} r={r - thickness / 2 - 2}
          fill="white"
          fillOpacity={0.6}
        />

        {/* Value arc with gradient */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          filter={`url(#${filterId})`}
          style={{
            transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {/* Tick marks: 8 ticks around the ring, accent at 40% opacity */}
        {Array.from({ length: numTicks }).map((_, i) => {
          const angle = (i / numTicks) * 2 * Math.PI - Math.PI / 2;
          const inner = r - thickness / 2 - 1;
          const outer = inner + 4;
          const x1t = cx + inner * Math.cos(angle);
          const y1t = cy + inner * Math.sin(angle);
          const x2t = cx + outer * Math.cos(angle);
          const y2t = cy + outer * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1t} y1={y1t} x2={x2t} y2={y2t}
              stroke={color}
              strokeOpacity={0.4}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Center text — use dominantBaseline="central" instead of manual offsets */}
        {displayLabel && (
          <text
            x={cx}
            y={sublabel ? cy - size / 14 : cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size / 6.5}
            fontWeight="700"
            fill="#10231C"
            fontFamily="inherit"
          >
            {displayLabel}
          </text>
        )}
        {sublabel && (
          <text
            x={cx}
            y={cy + size / 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size / 10}
            fill="#6B7A73"
            fontFamily="inherit"
          >
            {sublabel}
          </text>
        )}
      </svg>
    </div>
  );
}

// ─── BarChart ────────────────────────────────────────────────────────────────
export interface BarData {
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
}

export interface BarChartProps {
  data: BarData[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
  showValues?: boolean;
  showGrid?: boolean;
}

function RoundedTopRect({
  x, y, width, height, rx, fill,
}: {
  x: number; y: number; width: number; height: number; rx: number; fill: string;
}) {
  if (height <= 0) return null;
  const r = Math.min(rx, width / 2, height / 2);
  const bw = width;
  const bh = height;
  // Rounded top corners only — path per spec
  const d = `M ${x},${y + r} Q ${x},${y} ${x + r},${y} L ${x + bw - r},${y} Q ${x + bw},${y} ${x + bw},${y + r} L ${x + bw},${y + bh} L ${x},${y + bh} Z`;
  return <path d={d} fill={fill} />;
}

export function BarChart({
  data, height = 140,
  color = "#024430",
  formatValue = (v) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : String(v),
  showValues = true,
  showGrid = true,
}: BarChartProps) {
  const uid = useId().replace(/:/g, "");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const W = 400;
  const H = height;
  const PAD = { top: 28, right: 12, bottom: 40, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = (chartW / data.length) * 0.55;
  const gap = chartW / data.length;
  // 4 evenly-spaced dashed grid lines (at 25%, 50%, 75%, 100%)
  const gridTicks = [0.25, 0.5, 0.75, 1];
  const blurFiltId = `bar-blur-${uid}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: height + 20 }}>
      <defs>
        {/* Blur filter for bar shadows */}
        <filter id={blurFiltId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        {/* Per-bar gradients — userSpaceOnUse with actual chart coordinates */}
        {data.map((bar, i) => {
          const c = bar.color ?? color;
          const gradId = `bar-grad-${uid}-${i}`;
          return (
            <linearGradient
              key={gradId}
              id={gradId}
              gradientUnits="userSpaceOnUse"
              x1="0" y1={PAD.top}
              x2="0" y2={PAD.top + chartH}
            >
              <stop offset="0%" stopColor={c} stopOpacity="1" />
              <stop offset="100%" stopColor={c} stopOpacity="0.55" />
            </linearGradient>
          );
        })}
      </defs>

      {/* Baseline */}
      <line
        x1={PAD.left} x2={PAD.left + chartW}
        y1={PAD.top + chartH} y2={PAD.top + chartH}
        stroke="#C8D4CE" strokeWidth={1.5}
      />
      <text x={PAD.left - 8} y={PAD.top + chartH + 4} textAnchor="end" fontSize={9} fill="#6B7A73" fontFamily="inherit">
        0
      </text>

      {/* Dashed grid lines at 4 evenly-spaced y values */}
      {showGrid && gridTicks.map((t) => {
        const y = PAD.top + chartH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={PAD.left} x2={PAD.left + chartW} y1={y} y2={y}
              stroke="#E4EAE7"
              strokeWidth={0.5}
              strokeDasharray="4 3"
            />
            <text
              x={PAD.left - 8} y={y + 4}
              textAnchor="end" fontSize={9} fill="#6B7A73"
              fontFamily="inherit"
            >
              {formatValue(maxVal * t)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((bar, i) => {
        const barH = Math.max((bar.value / maxVal) * chartH, bar.value > 0 ? 3 : 0);
        const bx = PAD.left + i * gap + (gap - barW) / 2;
        const by = PAD.top + chartH - barH;
        const c = bar.color ?? color;
        const gradId = `bar-grad-${uid}-${i}`;
        const isHovered = hoveredBar === i;
        const rx = Math.min(barW / 2, 6);
        // X-axis label: rotate -30deg for long labels
        const labelX = bx + barW / 2;
        const labelY = H - PAD.bottom + 14;
        const isLong = bar.label.length > 5;

        return (
          <g
            key={bar.label + i}
            onMouseEnter={() => setHoveredBar(i)}
            onMouseLeave={() => setHoveredBar(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Bar shadow — blurred rect behind each bar */}
            {barH > 0 && (
              <rect
                x={bx + 2} y={by + 4}
                width={barW} height={barH}
                fill="rgba(0,0,0,0.08)"
                rx={rx}
                filter={`url(#${blurFiltId})`}
              />
            )}

            {/* Bar with rounded top corners only */}
            {barH > 0 && (
              <RoundedTopRect
                x={bx} y={by}
                width={barW} height={barH}
                rx={rx}
                fill={isHovered ? lighten(c, 0.15) : `url(#${gradId})`}
              />
            )}

            {/* Value label — fontWeight 700 in accent color, 4px above bar */}
            {showValues && bar.value > 0 && (
              <text
                x={bx + barW / 2}
                y={by - 4}
                textAnchor="middle"
                fontSize={9}
                fill={c}
                fontWeight="700"
                fontFamily="inherit"
              >
                {formatValue(bar.value)}
              </text>
            )}

            {/* X-axis label — rotate -30deg for long labels */}
            <text
              x={labelX}
              y={labelY}
              textAnchor={isLong ? "end" : "middle"}
              fontSize={10}
              fill={isHovered ? "#10231C" : "#6B7A73"}
              fontWeight={isHovered ? "600" : "400"}
              fontFamily="inherit"
              transform={isLong ? `rotate(-30, ${labelX}, ${labelY})` : undefined}
            >
              {bar.label}
            </text>

            {bar.sublabel && (
              <text
                x={bx + barW / 2}
                y={H - PAD.bottom + 28}
                textAnchor="middle"
                fontSize={8}
                fill="#9CA3AF"
                fontFamily="inherit"
              >
                {bar.sublabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── LineChart ───────────────────────────────────────────────────────────────
export interface LineData {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineData[];
  height?: number;
  color?: string;
  fillColor?: string;
  formatValue?: (v: number) => string;
  showDots?: boolean;
  showArea?: boolean;
}

export function LineChart({
  data, height = 140,
  color = "#024430",
  fillColor,
  formatValue = (v) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : String(v),
  showDots = true,
  showArea = true,
}: LineChartProps) {
  const uid = useId().replace(/:/g, "");
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  if (data.length < 2) return null;

  const W = 400;
  const H = height;
  const PAD = { top: 28, right: 20, bottom: 36, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / range) * chartH;

  const coords: [number, number][] = data.map((d, i) => [toX(i), toY(d.value)]);
  const linePath = smoothPath(coords);

  // Area path: same curve closed along the bottom
  const areaPath = linePath
    + ` L${toX(data.length - 1)},${PAD.top + chartH}`
    + ` L${toX(0)},${PAD.top + chartH} Z`;

  const gradId = `line-area-${uid}`;
  const clipId = `line-clip-${uid}`;
  const fc = fillColor ?? color;

  // Area gradient: userSpaceOnUse with actual y coords
  const gradY1 = PAD.top;
  const gradY2 = PAD.top + chartH;
  // Hex suffix 99 ≈ 60% opacity, 00 = 0%
  const stopColor0 = fc + "99";
  const stopColor1 = fc + "00";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: height + 16 }}>
      <defs>
        {/* Area gradient — userSpaceOnUse to avoid flat-looking fill */}
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="0" y1={gradY1}
          x2="0" y2={gradY2}
        >
          <stop offset="0%" stopColor={fc} stopOpacity="0.6" />
          <stop offset="100%" stopColor={fc} stopOpacity="0" />
        </linearGradient>

        {/* Clip rect for left-to-right reveal animation */}
        <clipPath id={clipId}>
          <rect x={PAD.left} y={0} width={chartW} height={H}>
            <animate
              attributeName="width"
              from="0"
              to={String(chartW)}
              dur="1s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          </rect>
        </clipPath>
      </defs>

      {/* Y gridlines */}
      {[0, 0.5, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        const v = minVal + range * t;
        return (
          <g key={t}>
            <line
              x1={PAD.left} x2={PAD.left + chartW} y1={y} y2={y}
              stroke="#E4EAE7" strokeWidth={1} strokeDasharray="4 4"
            />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={9} fill="#6B7A73" fontFamily="inherit">
              {formatValue(v)}
            </text>
          </g>
        );
      })}

      {/* Area fill — animated */}
      {showArea && (
        <path d={areaPath} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
      )}

      {/* Line — strokeWidth 2.5, round caps/joins */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
      />

      {/* Dots + x labels + hover tooltips */}
      {data.map((d, i) => {
        const x = toX(i);
        const y = toY(d.value);
        const isFirst = i === 0;
        const isLast = i === data.length - 1;
        const isHovered = hoveredDot === i;
        // First+last dots: r=5, others r=3.5
        const dotR = (isFirst || isLast) ? 5 : 3.5;

        return (
          <g key={d.label + i}>
            {/* X-axis label */}
            <text
              x={x} y={H - PAD.bottom + 16}
              textAnchor="middle" fontSize={10}
              fill={isHovered ? "#10231C" : "#6B7A73"}
              fontWeight={isHovered ? "600" : "400"}
              fontFamily="inherit"
            >
              {d.label}
            </text>

            {showDots && (
              <g
                onMouseEnter={() => setHoveredDot(i)}
                onMouseLeave={() => setHoveredDot(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Larger hit area */}
                <circle cx={x} cy={y} r={12} fill="transparent" />

                {/* Pulse ring for first + last dots */}
                {(isFirst || isLast) && (
                  <circle
                    cx={x} cy={y} r={8}
                    fill={color}
                    fillOpacity={0.2}
                  />
                )}

                {/* Dot — white fill, accent stroke */}
                <circle
                  cx={x} cy={y} r={dotR}
                  fill="white"
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Hover tooltip */}
                {isHovered && (() => {
                  const txt = formatValue(d.value);
                  const boxW = Math.max(txt.length * 6.5 + 16, 44);
                  const boxH = 22;
                  const bx = Math.max(PAD.left, Math.min(x - boxW / 2, PAD.left + chartW - boxW));
                  const by = y - dotR - boxH - 6;
                  return (
                    <g>
                      <rect
                        x={bx} y={by} width={boxW} height={boxH}
                        rx={5} ry={5}
                        fill="#10231C"
                        fillOpacity={0.92}
                      />
                      <text
                        x={bx + boxW / 2} y={by + 14}
                        textAnchor="middle"
                        fontSize={9.5}
                        fontWeight="700"
                        fill="white"
                        fontFamily="inherit"
                      >
                        {txt}
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── PieChart ─────────────────────────────────────────────────────────────────
export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

export function PieChart({ slices, size = 120 }: { slices: PieSlice[]; size?: number }) {
  const uid = useId().replace(/:/g, "");
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const filterId = `pie-shadow-${uid}`;
  const GAP_RAD = (1.5 * Math.PI) / 180; // ±1.5° gap between slices

  let startAngle = -Math.PI / 2;
  const paths = slices.map((sl, idx) => {
    const fullAngle = (sl.value / total) * 2 * Math.PI;
    const angle = Math.max(fullAngle - GAP_RAD, 0.01);
    const midAngle = startAngle + fullAngle / 2;

    const x1 = cx + r * Math.cos(startAngle + GAP_RAD / 2);
    const y1 = cy + r * Math.sin(startAngle + GAP_RAD / 2);
    const endAngle = startAngle + fullAngle - GAP_RAD / 2;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
    startAngle += fullAngle;

    return {
      d,
      color: sl.color,
      label: sl.label,
      value: sl.value,
      pct: Math.round((sl.value / total) * 100),
      midAngle,
      idx,
    };
  });

  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        overflow="visible"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          {paths.map((p) => {
            const isHovered = hoveredSlice === p.idx;
            const tx = isHovered ? Math.cos(p.midAngle) * 5 : 0;
            const ty = isHovered ? Math.sin(p.midAngle) * 5 : 0;
            return (
              <path
                key={p.idx}
                d={p.d}
                fill={p.color}
                stroke="white"
                strokeWidth={2}
                transform={`translate(${tx},${ty})`}
                style={{
                  transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredSlice(p.idx)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </g>
      </svg>

      {/* Legend — clean 2-column grid: ■ Label ... XX% */}
      <div
        className="grid gap-x-4 gap-y-1.5 min-w-0"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {slices.map((sl, i) => {
          const pct = Math.round((sl.value / total) * 100);
          const isHovered = hoveredSlice === i;
          return (
            <div
              key={sl.label}
              className="flex items-center gap-1.5 min-w-0"
              style={{ cursor: "default" }}
              onMouseEnter={() => setHoveredSlice(i)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              {/* Colored square */}
              <div
                className="flex-shrink-0"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: sl.color,
                  opacity: isHovered ? 1 : 0.85,
                  transition: "opacity 0.15s",
                }}
              />
              <span
                className="text-xs truncate flex-1"
                style={{
                  color: isHovered ? "#10231C" : "#6B7A73",
                  fontWeight: isHovered ? 600 : 400,
                  transition: "color 0.15s",
                }}
              >
                {sl.label}
              </span>
              <span
                className="text-xs font-semibold whitespace-nowrap ml-1"
                style={{ color: sl.color }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SparkLine ────────────────────────────────────────────────────────────────
export function SparkLine({
  data, color = "#024430", height = 48, width = 80,
}: {
  data: number[]; color?: string; height?: number; width?: number;
}) {
  const uid = useId().replace(/:/g, "");
  if (data.length < 2) return null;

  // Enforce minimum height for visual presence
  const h = Math.max(height, 48);

  const maxV = Math.max(...data, 1);
  const minV = Math.min(...data, 0);
  const range = maxV - minV || 1;
  const step = width / (data.length - 1);
  const padY = 4;

  const coords: [number, number][] = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - minV) / range) * (h - padY * 2) - padY;
    return [x, y];
  });

  const linePath = smoothPath(coords);
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const trending = last >= prev;
  const lineColor = trending ? color : "#EF4444";
  const gradId = `spark-grad-${uid}`;

  // Area path — closed along bottom
  const areaPath = linePath
    + ` L${coords[coords.length - 1][0]},${h}`
    + ` L${coords[0][0]},${h} Z`;

  const [lx, ly] = coords[coords.length - 1];

  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} overflow="visible">
      <defs>
        {/* userSpaceOnUse gradient so fill isn't flat */}
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="0" y1={padY}
          x2="0" y2={h}
        >
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line — strokeWidth 2 */}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Last point dot */}
      <circle cx={lx} cy={ly} r={3} fill="white" stroke={lineColor} strokeWidth={1.5} />
    </svg>
  );
}

// ─── StatRing — compact KPI with ring ────────────────────────────────────────
export function StatRing({
  value, max, label, metric, color = "#024430",
}: {
  value: number; max: number; label: string; metric: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <DonutChart value={value} max={max} color={color} size={56} thickness={6} showPercent />
      <div>
        <p className="text-sm font-bold text-[#10231C]">{metric}</p>
        <p className="text-xs text-[#6B7A73]">{label}</p>
      </div>
    </div>
  );
}
