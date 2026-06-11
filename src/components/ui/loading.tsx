import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("border-2 border-blue-600 border-t-transparent rounded-full animate-spin", sizes[size])} />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-96 flex items-center justify-center">
      <LoadingSpinner size="lg" text="جاري التحميل..." />
    </div>
  );
}
