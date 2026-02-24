import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

export const GradientButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
}: GradientButtonProps) => {
  const variants = {
    primary: "gradient-primary text-primary-foreground",
    accent: "gradient-accent text-accent-foreground",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "font-semibold rounded-xl",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
};
