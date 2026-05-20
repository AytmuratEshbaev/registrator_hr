import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  /** Override "ZEYIN" color (default: navy blue) */
  brandColor?: string;
  /** Override "school" color (default: orange) */
  accentColor?: string;
}

const sizeMap = {
  sm: {
    brand: "text-base",
    sub: "text-[10px]",
  },
  md: {
    brand: "text-xl md:text-2xl",
    sub: "text-xs md:text-sm",
  },
  lg: {
    brand: "text-3xl md:text-4xl",
    sub: "text-sm md:text-base",
  },
} as const;

const DEFAULT_BRAND_COLOR = "#1e2952"; // navy blue (ZEYIN)
const DEFAULT_ACCENT_COLOR = "#f97316"; // orange (school)

export function Logo({
  size = "md",
  href = "/",
  className,
  brandColor = DEFAULT_BRAND_COLOR,
  accentColor = DEFAULT_ACCENT_COLOR,
}: LogoProps) {
  const cls = sizeMap[size];

  const content = (
    <div
      className={cn(
        "inline-flex flex-col items-start leading-none select-none",
        className
      )}
    >
      <span
        className={cn("font-extrabold tracking-tight", cls.brand)}
        style={{ color: brandColor }}
      >
        ZEYIN
      </span>
      <span
        className={cn(
          "font-bold tracking-widest uppercase mt-0.5",
          cls.sub
        )}
        style={{ color: accentColor }}
      >
        school
      </span>
    </div>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="ZEYIN school">
      {content}
    </Link>
  );
}
