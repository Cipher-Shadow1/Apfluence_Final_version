import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedGradientCardProps extends ComponentPropsWithoutRef<"div"> {
  speed?: number;
  colors?: [string, string, string?, string?, string?];
}

export function AnimatedGradientCard({
  children,
  className,
  speed = 1,
  colors = ["#1212C8", "#2B2EF8", "#3D4AE8", "#2525F5", "#0A0F8C"],
  ...props
}: AnimatedGradientCardProps) {
  const [c1, c2, c3, c4, c5] = colors;

  return (
    <div
      style={
        {
          "--speed": `${Math.max(0.1, 1 / speed) * 12}s`,
          "--c1": c1,
          "--c2": c2,
          "--c3": c3 ?? c2,
          "--c4": c4 ?? c1,
          "--c5": c5 ?? c2,
        } as React.CSSProperties
      }
      className={cn("animated-smoke-card", className)}
      {...props}
    >
      <div className="animated-smoke-card__extra" aria-hidden="true" />
      {children}
    </div>
  );
}
