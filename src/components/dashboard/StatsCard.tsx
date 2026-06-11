import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "indigo" | "green" | "red" | "emerald" | "sky" | "amber";
  change?: { value: number; label: string };
  className?: string;
}

const colorConfig = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-600",
    text: "text-blue-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    iconBg: "bg-indigo-600",
    text: "text-indigo-600",
  },
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-600",
    text: "text-green-600",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-500",
    text: "text-red-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-600",
    text: "text-emerald-600",
  },
  sky: {
    bg: "bg-sky-50",
    iconBg: "bg-sky-500",
    text: "text-sky-500",
  },
  amber: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-500",
    text: "text-amber-500",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  className,
}: StatsCardProps) {
  const config = colorConfig[color];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm stat-card",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
            config.iconBg
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-tight">
          {typeof value === "number" ? (
            <span className="num">{value.toLocaleString("ar-EG")}</span>
          ) : (
            value
          )}
        </p>
        <p className="text-xs text-slate-500 mt-1 font-medium">{title}</p>
        {change && (
          <p
            className={cn(
              "text-xs mt-2 font-medium",
              change.value >= 0 ? "text-green-600" : "text-red-500"
            )}
          >
            {change.value >= 0 ? "▲" : "▼"} {Math.abs(change.value)}% {change.label}
          </p>
        )}
      </div>
    </div>
  );
}
