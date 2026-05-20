import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  /** Override brand color (default: navy blue from building photo) */
  color?: string;
}

const sizeMap = {
  sm: {
    brand: "text-base",
    sub: "text-[9px]",
    separator: "text-base mx-1",
    gap: "gap-0",
  },
  md: {
    brand: "text-xl md:text-2xl",
    sub: "text-[10px] md:text-xs",
    separator: "text-xl md:text-2xl mx-1.5",
    gap: "gap-0",
  },
  lg: {
    brand: "text-3xl md:text-4xl",
    sub: "text-sm md:text-base",
    separator: "text-3xl md:text-4xl mx-2",
    gap: "gap-1",
  },
} as const;

const DEFAULT_BRAND_COLOR = "#1e2952";

export function Logo({
  size = "md",
  href = "/",
  className,
  color = DEFAULT_BRAND_COLOR,
}: LogoProps) {
  const cls = sizeMap[size];

  const content = (
    <div
      className={cn("inline-flex items-center select-none", className)}
      style={{ color }}
    >
      <span
        className={cn(
          "font-extrabold tracking-tight leading-none",
          cls.brand
        )}
      >
        ZEYIN
      </span>
      <span
        className={cn(
          "font-light leading-none opacity-40",
          cls.separator
        )}
        aria-hidden="true"
      >
        |
      </span>
      <div
        className={cn(
          "flex flex-col font-medium leading-tight",
          cls.sub,
          cls.gap
        )}
      >
        <span>mektebi</span>
        <span>school</span>
      </div>
    </div>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="ZEYIN mektebi school">
      {content}
    </Link>
  );
}
