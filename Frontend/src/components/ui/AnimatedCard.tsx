import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export const AnimatedCard = ({ children, className, delay = 0, hover = true }: AnimatedCardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-6 shadow-card border border-border/50",
        hover ? "hover:shadow-elevated" : "",
        className
      )}
    >
      {children}
    </div>
  );
};
