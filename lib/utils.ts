import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function formatName(person: { first_name: string; last_name: string }): string {
  return `${person.first_name} ${person.last_name}`.trim();
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Yangi",
    reviewing: "Ko'rib chiqilmoqda",
    accepted: "Qabul qilindi",
    rejected: "Rad etildi",
  };
  return labels[status] ?? status;
}

export function statusFriendlyMessage(status: string): string {
  const messages: Record<string, string> = {
    pending:
      "Sizning arizangiz muvaffaqiyatli qabul qilindi va ko'rib chiqilishini kutmoqda.",
    reviewing:
      "Sizning arizangiz hozirda mutaxassislarimiz tomonidan ko'rib chiqilmoqda. Iltimos, biroz kuting.",
    accepted:
      "Tabriklaymiz! Arizangiz qabul qilindi. Tez orada ma'muriyatimiz siz bilan bog'lanadi.",
    rejected:
      "Afsuski, arizangiz rad etildi.",
  };
  return messages[status] ?? "";
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-blue-100 text-blue-800 border-blue-200",
    reviewing: "bg-amber-100 text-amber-800 border-amber-200",
    accepted: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
}

export function formatGrade(grade: string | null | undefined, lang: string): string {
  if (!grade) return "—";
  const numOnly = grade.replace(/\D/g, "");
  if (numOnly) {
    if (lang === "qq") return `${numOnly}-klass`;
    if (lang === "ru") return `${numOnly}-класс`;
    return `${numOnly}-sinf`;
  }
  return grade;
}
