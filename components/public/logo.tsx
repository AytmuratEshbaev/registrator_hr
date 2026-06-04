import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
  /** Override "ZEYIN" color (unused with image logo) */
  brandColor?: string;
  /** Override "school" color (unused with image logo) */
  accentColor?: string;
}

const sizeMap = {
  sm: "h-8 md:h-9",
  md: "h-12 md:h-14",
  lg: "h-16 md:h-20",
} as const;

export function Logo({
  size = "md",
  href = "/",
  className,
}: LogoProps) {
  const heightClass = sizeMap[size];

  const content = (
    <img
      src="/assets/images/logo.jpg"
      alt="ZEYIN school"
      className={cn("w-auto object-contain select-none", heightClass, className)}
    />
  );

  if (href === null) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="ZEYIN school">
      {content}
    </Link>
  );
}

