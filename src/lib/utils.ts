import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ProjectStatus,
  TaskStatus,
  MemberStatus,
  NotificationType,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Date Utilities
// ============================================

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isOverdue(deliveryDate: string): boolean {
  return new Date(deliveryDate) < new Date();
}

export function daysUntilDeadline(deliveryDate: string): number {
  const diff = new Date(deliveryDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isApproachingDeadline(
  deliveryDate: string,
  daysThreshold = 3
): boolean {
  const days = daysUntilDeadline(deliveryDate);
  return days >= 0 && days <= daysThreshold;
}

// ============================================
// Status Utilities
// ============================================

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  not_started: {
    label: "لم يبدأ",
    color: "border-slate-400",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
  },
  in_progress: {
    label: "قيد التنفيذ",
    color: "border-blue-400",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  under_review: {
    label: "تحت المراجعة",
    color: "border-amber-400",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  completed: {
    label: "مكتمل",
    color: "border-green-400",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  cancelled: {
    label: "ملغي",
    color: "border-red-400",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  not_started: {
    label: "لم تبدأ",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
  },
  in_progress: {
    label: "جاري التنفيذ",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  completed: {
    label: "مكتملة",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
};

export const MEMBER_STATUS_CONFIG: Record<
  MemberStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  active: {
    label: "نشط",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  inactive: {
    label: "غير نشط",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
  },
};

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: string; color: string }
> = {
  deadline_approaching: {
    label: "اقتراب موعد التسليم",
    icon: "clock",
    color: "text-amber-600",
  },
  deadline_passed: {
    label: "انتهاء موعد التسليم",
    icon: "alert-circle",
    color: "text-red-600",
  },
  project_completed: {
    label: "اكتمال المشروع",
    icon: "check-circle",
    color: "text-green-600",
  },
};

// ============================================
// Progress Calculation
// ============================================

export function calculateProgress(
  totalTasks: number,
  completedTasks: number
): number {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

// ============================================
// Role Utilities
// ============================================

export const ROLE_CONFIG = {
  admin: { label: "مدير النظام", color: "text-purple-700", bgColor: "bg-purple-100" },
  manager: { label: "مدير مشاريع", color: "text-blue-700", bgColor: "bg-blue-100" },
  member: { label: "عضو فريق", color: "text-slate-700", bgColor: "bg-slate-100" },
};

// ============================================
// String Utilities
// ============================================

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
