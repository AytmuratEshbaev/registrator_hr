// Admin email allowlist (ixtiyoriy, defense-in-depth).
// `ADMIN_EMAILS` (vergul bilan ajratilgan) sozlangan bo'lsa — faqat shu emaillar admin.
// Sozlanmagan bo'lsa — har qanday authenticated foydalanuvchi admin (eski xatti-harakat).
// Tavsiya: Supabase'da public signup'ni o'chiring VA bu ro'yxatni to'ldiring.
export function isAllowedAdmin(email: string | null | undefined): boolean {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return true;
  if (!email) return false;
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
