import { PROJECT_STATUS_CONFIG, TASK_STATUS_CONFIG, MEMBER_STATUS_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "project" | "task" | "member";
  className?: string;
}

export function StatusBadge({ status, type = "project", className }: StatusBadgeProps) {
  const config =
    type === "project"
      ? PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG]
      : type === "task"
      ? TASK_STATUS_CONFIG[status as keyof typeof TASK_STATUS_CONFIG]
      : MEMBER_STATUS_CONFIG[status as keyof typeof MEMBER_STATUS_CONFIG];

  if (!config) return null;

  return (
    <span className={cn("status-badge", config.bgColor, config.textColor, className)}>
      {config.label}
    </span>
  );
}
