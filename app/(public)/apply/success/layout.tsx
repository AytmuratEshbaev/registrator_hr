import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ariza muvaffaqiyatli yuborildi — Zeyin School",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
