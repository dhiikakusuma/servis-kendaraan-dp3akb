import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20",
        sizeMap[size],
        className,
      )}
      aria-hidden="true"
    >
      <Shield className="h-1/2 w-1/2" />
    </div>
  );
}
