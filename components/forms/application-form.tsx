"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileUploadField } from "@/components/forms/file-upload-field";
import {
  studentApplicationSchema,
  vacancyApplicationSchema,
  type ApplicationInput,
} from "@/lib/validations/application";
import type { PositionRow, ApplicationStatus } from "@/lib/supabase/types";
import { PASSPORT_REGEX } from "@/lib/constants";
import { useLanguage } from "@/components/language/language-provider";

interface ApplicationFormProps {
  type: "student" | "vacancy";
  positions: PositionRow[];
}

const STUDENT_SERIES = [
  "I-AN",
  "I-BH",
  "I-FR",
  "I-GZ",
  "I-HR",
  "I-KK",
  "I-NA",
  "I-NV",
  "I-QD",
  "I-QQ",
  "I-SM",
  "I-SR",
  "I-SU",
  "I-TN",
  "I-TV",
  "II-AN",
  "II-BH",
  "II-FR",
  "II-GZ",
  "II-HR",
  "II-KK",
  "II-KS",
  "II-NA",
  "II-NV",
  "II-QD",
  "II-QQ",
  "II-SM",
  "II-SR",
  "II-SU",
  "II-TN",
  "II-TS",
  "II-TV",
  "III-AN",
  "III-BH",
  "III-FR",
  "III-GZ",
  "III-HR",
  "III-KK",
  "III-NA",
  "III-NV",

  "III-QD",
  "III-QQ",
  "III-SM",
  "III-SR",
  "III-SU",
  "III-TN",
  "III-TV",
  "I",
  "IA",
  "II",
];

const GRADES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
];

export function ApplicationForm({ type, positions }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Avtomatik pasport/hujjat tekshiruvi uchun holatlar
  const [checkingPassport, setCheckingPassport] = useState(false);
  const [existingApp, setExistingApp] = useState<{
    status: ApplicationStatus;
    hr_note: string | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
  } | null>(null);

  const isStudent = type === "student";
  const activeSchema = isStudent ? studentApplicationSchema : vacancyApplicationSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(activeSchema),
    defaultValues: (isStudent
      ? {
          type: "student",
          passport_number: "",
          passport_series: "",
          passport_number_digits: "",
          first_name: "",
          last_name: "",
          middle_name: "",
          phone: "+998",
          phone_secondary: "+998",
          parent_name: "",
          grade: "",
        }
      : {
          type: "vacancy",
          passport_number: "",
          passport_series: "",
          passport_number_digits: "",
          first_name: "",
          last_name: "",
          middle_name: "",
          phone: "+998",
          phone_secondary: "+998",
          position_id: null,
          position_title: "",
          cv_url: "",
        }) as unknown as ApplicationInput,
  });

  // Hujjat raqamini kuzatamiz
  const watched = watch();
  const passportVal = watched.passport_number;
  const seriesVal = watched.passport_series;
  const digitsVal = watched.passport_number_digits;

  // Dynamic Design tokens for maximum visual excellence (WOW factor)
  const isOrange = isStudent;
  const themeFocusRing = isOrange
    ? "focus-visible:ring-4 focus-visible:ring-orange-500/10 focus-visible:border-orange-500 hover:border-orange-300 bg-white"
    : "focus-visible:ring-4 focus-visible:ring-indigo-900/10 focus-visible:border-indigo-900 hover:border-indigo-300 bg-white";
    
  const inputBaseClass = `h-12 px-4 rounded-xl border border-slate-200/80 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 shadow-sm/5 ${themeFocusRing}`;
  
  const selectTriggerClass = `flex h-12 w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition-all duration-200 shadow-sm/5 ${themeFocusRing}`;
  
  const labelBaseClass = "text-[13px] font-bold text-slate-700 tracking-wide flex items-center gap-1.5 mb-1.5 pl-0.5 select-none";

  // Seriya va raqamlarni passport_number'ga birlashtirish
  useEffect(() => {
    if (isStudent) {
      if (digitsVal) {
        const combined = ((seriesVal ?? "") + (digitsVal ?? "")).trim().toUpperCase();
        setValue("passport_number", combined, { shouldValidate: true });
      } else {
        setValue("passport_number", "", { shouldValidate: false });
        clearErrors("passport_number");
      }
    }
  }, [seriesVal, digitsVal, setValue, isStudent, clearErrors]);

  // Formani har safar ariza turi o'zgarganda tozalash
  useEffect(() => {
    reset(
      (isStudent
        ? {
            type: "student",
            passport_number: "",
            passport_series: "",
            passport_number_digits: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            phone: "+998",
            phone_secondary: "+998",
            parent_name: "",
            grade: "",
          }
        : {
            type: "vacancy",
            passport_number: "",
            passport_series: "",
            passport_number_digits: "",
            first_name: "",
            last_name: "",
            middle_name: "",
            phone: "+998",
            phone_secondary: "+998",
            position_id: null,
            position_title: "",
            cv_url: "",
          }) as unknown as ApplicationInput
    );
    clearErrors();
    setExistingApp(null);
  }, [type, isStudent, reset, clearErrors]);

  // Hujjat raqamini avtomatik ravishda tekshirish (kechikish va AbortController bilan)
  useEffect(() => {
    const isComplete = isStudent 
      ? (passportVal && digitsVal && digitsVal.length === 7)
      : (passportVal && passportVal.length === 9);

    if (!isComplete) {
      setExistingApp(null);
      // Frictionless clearing
      if (isStudent && (!digitsVal || digitsVal.length < 7)) {
        clearErrors("passport_number");
      } else if (!isStudent && (!passportVal || passportVal.length < 9)) {
        clearErrors("passport_number");
      }
      return;
    }

    const normalized = passportVal.trim().toUpperCase();
    
    // Agar formatga umuman to'g'ri kelmasa yoki 5 ta belgidan kam bo'lsa bazaga so'rov yubormaymiz
    const formatValid = isStudent 
      ? PASSPORT_REGEX.test(normalized)
      : /^[A-Z]{2}\d{7}$/.test(normalized);

    if (!formatValid) {
      setExistingApp(null);
      return;
    }

    const controller = new AbortController();

    async function checkPassport() {
      setCheckingPassport(true);
      try {
        const res = await fetch("/api/check-passport", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passport_number: normalized, type }),
          signal: controller.signal,
        });

        if (res.status === 429) {
          setError("passport_number", {
            type: "manual",
            message: "Urinishlar soni ko'payib ketdi. Iltimos, birozdan so'ng yozib ko'ring.",
          });
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.status) {
            setExistingApp({
              status: data.status,
              hr_note: data.hr_note ?? null,
              first_name: data.first_name ?? "",
              last_name: data.last_name ?? "",
              middle_name: data.middle_name ?? null,
            });
            setError("passport_number", {
              type: "manual",
              message: `Siz, ${data.last_name} ${data.first_name}, avval ro'yxatdan o'tgansiz.`,
            });
          } else {
            setExistingApp(null);
            clearErrors("passport_number");
          }
        }
      } catch {
        // Abort qilinganda xatolikni tashlab yuboramiz
      } finally {
        setCheckingPassport(false);
      }
    }

    // Foydalanuvchi tez yozganida har bir harfga so'rov yubormaslik uchun 400ms kutamiz (Debouncing)
    const timeoutId = setTimeout(checkPassport, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [passportVal, digitsVal, setError, clearErrors, isStudent, type]);

  // Draft'dan tiklash
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`apply.form.draft.${type}`);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<ApplicationInput>;
        for (const [k, v] of Object.entries(draft)) {
          if (k === "passport_number" || k === "type") continue;
          if (typeof v === "string" || v === null) {
            setValue(k as never, v as never, { shouldValidate: false });
          }
        }
      }
    } catch {
      // ignore
    }
  }, [setValue, type]);

  // Draft saqlab borish
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const draftToSave: Record<string, string | null | undefined> = {
          first_name: watched.first_name,
          last_name: watched.last_name,
          phone: watched.phone,
        };

        if (isStudent) {
          draftToSave.parent_name = (watched as Record<string, unknown>).parent_name as string | null | undefined;
          draftToSave.grade = (watched as Record<string, unknown>).grade as string | null | undefined;
        } else {
          draftToSave.position_id = (watched as Record<string, unknown>).position_id as string | null | undefined;
          draftToSave.position_title = (watched as Record<string, unknown>).position_title as string | null | undefined;
        }

        sessionStorage.setItem(`apply.form.draft.${type}`, JSON.stringify(draftToSave));
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(id);
  }, [watched, isStudent, type]);

  function onPositionChange(positionId: string, fieldOnChange: (val: string) => void) {
    const pos = positions.find((p) => p.id === positionId);
    if (pos) {
      fieldOnChange(pos.id);
      setValue("position_title" as never, pos.title as never, { shouldValidate: true });
    }
  }

  async function onSubmit(values: ApplicationInput) {
    // Agar ariza allaqachon mavjud bo'lsa, topshirishni butunlay to'xtatamiz
    if (existingApp) {
      toast({
        title: "Ariza allaqachon topshirilgan",
        description: "Ushbu pasport/guvohnoma raqami bo'yicha ariza oldin qabul qilingan.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 429) {
        toast({
          title: "Urinishlar ko'payib ketdi",
          description: "Iltimos, bir daqiqadan so'ng qayta urinib ko'ring.",
          variant: "destructive",
        });
        return;
      }

      if (res.status === 409) {
        toast({
          title: "Ariza mavjud",
          description: "Ushbu hujjat raqami bo'yicha ariza allaqachon topshirilgan.",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({
          title: "Xatolik yuz berdi",
          description: data?.error ?? "Arizani yuborishda xatolik yuz berdi. Qayta urinib ko'ring.",
          variant: "destructive",
        });
        return;
      }

      // Draft tozalash
      try {
        sessionStorage.removeItem(`apply.form.draft.${type}`);
      } catch {
        // ignore
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "Aloqa xatoligi",
        description: "Server bilan aloqa bog'lanmadi. Internetni tekshiring.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* O'quvchi uchun maxsus maydonlar */}
      {isStudent && (
        <>
          {/* O'quvchi ma'lumotlari */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-2 select-none">
              <span className="w-2 h-5 rounded-full bg-orange-500 block" />
              {t("O'quvchi Ma'lumotlari")}
            </legend>

            <div className="space-y-5">
              {/* Row 1: Metrika seriyasi va raqami */}
              <div className="space-y-1.5">
                <Label className={labelBaseClass}>{t("Tug'ilganlik guvohnomasi (metrika) seriyasi va raqami")} <span className="text-orange-500">*</span></Label>
                <div className="flex gap-3 max-w-[340px]">
                  {/* Seriya Select */}
                  <div className="w-[130px] shrink-0">
                    <Controller
                      control={control}
                      name="passport_series"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                          disabled={submitting}
                        >
                          <SelectTrigger id="passport_series" className={selectTriggerClass}>
                            <SelectValue placeholder={t("Seriya")} />
                          </SelectTrigger>
                          <SelectContent>
                            {STUDENT_SERIES.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Raqam Input */}
                  <div className="w-[170px] shrink-0 relative">
                    <Input
                      id="passport_number_digits"
                      placeholder="1234567"
                      maxLength={7}
                      {...register("passport_number_digits" as const, {
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 7);
                        }
                      })}
                      disabled={submitting}
                      className={`${inputBaseClass} font-mono tracking-wider font-bold pr-10`}
                    />
                    {checkingPassport && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Spinner className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-semibold tracking-wide mt-1 pl-1">
                  {t("Tug'ilganlik guvohnomasi seriyasini tanlang va faqat 7 ta raqamini kiriting. (Masalan: I-TAS 1234567)")}
                </p>

                {errors.passport_number_digits ? (
                  <p className="text-xs text-destructive font-semibold mt-1">{(errors.passport_number_digits as { message?: string }).message}</p>
                ) : errors.passport_number ? (
                  <p className="text-xs text-destructive font-semibold mt-1">{errors.passport_number.message}</p>
                ) : null}

                {/* Uniqueness card warning if duplicate */}
                {existingApp && (
                  <div className="rounded-2xl border border-emerald-250 bg-emerald-50/70 p-5 space-y-4 mt-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-950 text-base leading-snug">
                          Siz, {existingApp.last_name} {existingApp.first_name} {existingApp.middle_name ?? ""}, avval ro'yxatdan o'tgansiz!
                        </p>
                        <p className="text-sm text-emerald-800 font-semibold">
                          Ushbu tug'ilganlik guvohnomasi (metrika) raqami bo'yicha ariza oldin qabul qilingan.
                        </p>
                      </div>
                    </div>
                    {existingApp.hr_note ? (
                      <div className="rounded-xl bg-white border border-emerald-100 px-4 py-3 text-sm shadow-sm">
                        <p className="text-xs text-slate-400 mb-1 font-bold">Ma'muriyat izohi:</p>
                        <p className="whitespace-pre-wrap break-words text-slate-800 font-bold">{existingApp.hr_note}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Row 2: Familiyasi va Ismi */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Familiyasi */}
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className={labelBaseClass}>{t("Familiyasi")} <span className="text-orange-500">*</span></Label>
                  <Input
                    id="last_name"
                    placeholder={t("Masalan: Karimov")}
                    {...register("last_name")}
                    disabled={submitting || !!existingApp}
                    className={inputBaseClass}
                  />
                  {errors.last_name ? (
                    <p className="text-xs text-destructive font-semibold">{errors.last_name.message}</p>
                  ) : null}
                </div>

                {/* Ismi */}
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className={labelBaseClass}>{t("Ismi")} <span className="text-orange-500">*</span></Label>
                  <Input
                    id="first_name"
                    placeholder={t("Masalan: Sardor")}
                    {...register("first_name")}
                    disabled={submitting || !!existingApp}
                    className={inputBaseClass}
                  />
                  {errors.first_name ? (
                    <p className="text-xs text-destructive font-semibold">{errors.first_name.message}</p>
                  ) : null}
                </div>
              </div>

              {/* Row 3: Sharifi va Sinfni tanlash */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Sharifi */}
                <div className="space-y-1.5">
                  <Label htmlFor="middle_name" className={labelBaseClass}>{t("Sharifi (Otasining ismi)")} <span className="text-orange-500">*</span></Label>
                  <Input
                    id="middle_name"
                    placeholder={t("Masalan: Alisherovich")}
                    {...register("middle_name" as const)}
                    disabled={submitting || !!existingApp}
                    className={inputBaseClass}
                  />
                  {errors.middle_name ? (
                    <p className="text-xs text-destructive font-semibold">{(errors.middle_name as { message?: string }).message}</p>
                  ) : null}
                </div>

                {/* Sinfni tanlash */}
                <div className="space-y-1.5">
                  <Label htmlFor="grade" className={labelBaseClass}>{t("Qabul qilinadigan sinf")} <span className="text-orange-500">*</span></Label>
                  <Controller
                    control={control}
                    name="grade"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        disabled={submitting || !!existingApp}
                      >
                        <SelectTrigger id="grade" className={selectTriggerClass}>
                          <SelectValue placeholder={t("Sinfni tanlang")} />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.grade ? (
                    <p className="text-xs text-destructive font-semibold">{errors.grade.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Ota-ona ma'lumotlari */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-2 select-none">
              <span className="w-2 h-5 rounded-full bg-orange-500 block" />
              {t("Ota-ona Ma'lumotlari")}
            </legend>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Telefon (Asosiy) */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className={labelBaseClass}>{t("Telefon raqam (Asosiy)")} <span className="text-orange-500">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998901234567"
                  maxLength={13}
                  {...register("phone", {
                    onChange: (e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const rest = digits.startsWith("998") ? digits.slice(3) : digits;
                      const trimmed = rest.slice(0, 9);
                      e.target.value = "+998" + trimmed;
                    },
                  })}
                  disabled={submitting || !!existingApp}
                  className={`${inputBaseClass} font-mono tracking-wider font-bold`}
                />
                {errors.phone ? (
                  <p className="text-xs text-destructive font-semibold">{errors.phone.message}</p>
                ) : null}
              </div>

              {/* Telefon (Qo'shimcha) */}
              <div className="space-y-1.5">
                <Label htmlFor="phone_secondary" className={labelBaseClass}>{t("Telefon raqam (Qo'shimcha)")}</Label>
                <Input
                  id="phone_secondary"
                  type="tel"
                  placeholder="+998901234567"
                  maxLength={13}
                  {...register("phone_secondary" as const, {
                    onChange: (e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const rest = digits.startsWith("998") ? digits.slice(3) : digits;
                      const trimmed = rest.slice(0, 9);
                      e.target.value = trimmed ? "+998" + trimmed : "";
                    },
                  })}
                  disabled={submitting || !!existingApp}
                  className={`${inputBaseClass} font-mono tracking-wider font-bold`}
                />
                {errors.phone_secondary ? (
                  <p className="text-xs text-destructive font-semibold">{(errors.phone_secondary as { message?: string }).message}</p>
                ) : null}
              </div>
            </div>
          </fieldset>
        </>
      )}

      {/* Vakansiya uchun maxsus maydonlar */}
      {!isStudent && (
        <>
          {/* Nomzod ma'lumotlari */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-2 select-none">
              <span className="w-2 h-5 rounded-full bg-indigo-900 block" />
              {t("Nomzod Ma'lumotlari")}
            </legend>

            <div className="space-y-5">
              {/* Pasport seriyasi va raqami */}
              <div className="space-y-1.5">
                <Label className={labelBaseClass}>{t("Pasport seriyasi va raqami")} <span className="text-indigo-900">*</span></Label>
                <div className="max-w-[340px] relative">
                  <Input
                    id="passport_number"
                    placeholder={t("Masalan: AA1234567")}
                    maxLength={9}
                    {...register("passport_number", {
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        const letters = formatted.slice(0, 2).replace(/[^A-Z]/g, "");
                        const digits = formatted.slice(2, 9).replace(/[^0-9]/g, "");
                        const finalVal = letters + digits;
                        e.target.value = finalVal;
                        setValue("passport_number", finalVal, { shouldValidate: true });
                      }
                    })}
                    disabled={submitting || !!existingApp}
                    className={`${inputBaseClass} font-mono tracking-wider font-bold pr-10`}
                  />
                  {checkingPassport && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Spinner className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-semibold tracking-wide mt-1 pl-1">
                  {t("Pasport seriyasi va 7 ta raqamini kiriting. (Masalan: AA1234567)")}
                </p>

                {errors.passport_number ? (
                  <p className="text-xs text-destructive font-semibold mt-1">{errors.passport_number.message}</p>
                ) : null}

                {existingApp && (
                  <div className="rounded-2xl border border-emerald-255 bg-emerald-50/70 p-5 space-y-4 mt-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-950 text-base leading-snug">
                          Siz, {existingApp.last_name} {existingApp.first_name} {existingApp.middle_name ?? ""}, avval ro'yxatdan o'tgansiz!
                        </p>
                        <p className="text-sm text-emerald-800 font-semibold">
                          Ushbu pasport raqami bo'yicha ariza oldin qabul qilingan.
                        </p>
                      </div>
                    </div>
                    {existingApp.hr_note ? (
                      <div className="rounded-xl bg-white border border-emerald-100 px-4 py-3 text-sm shadow-sm">
                        <p className="text-xs text-slate-400 mb-1 font-bold">Ma'muriyat izohi:</p>
                        <p className="whitespace-pre-wrap break-words text-slate-800 font-bold">{existingApp.hr_note}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Familiyasi va Ismi */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Familiyasi */}
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className={labelBaseClass}>{t("Familiyasi")} <span className="text-indigo-900">*</span></Label>
                  <Input
                    id="last_name"
                    placeholder={t("Masalan: Karimov")}
                    {...register("last_name")}
                    disabled={submitting || !!existingApp}
                    className={inputBaseClass}
                  />
                  {errors.last_name ? (
                    <p className="text-xs text-destructive font-semibold">{errors.last_name.message}</p>
                  ) : null}
                </div>

                {/* Ismi */}
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className={labelBaseClass}>{t("Ismi")} <span className="text-indigo-900">*</span></Label>
                  <Input
                    id="first_name"
                    placeholder={t("Masalan: Sardor")}
                    {...register("first_name")}
                    disabled={submitting || !!existingApp}
                    className={inputBaseClass}
                  />
                  {errors.first_name ? (
                    <p className="text-xs text-destructive font-semibold">{errors.first_name.message}</p>
                  ) : null}
                </div>
              </div>

              {/* Sharifi */}
              <div className="space-y-1.5 max-w-md">
                <Label htmlFor="middle_name" className={labelBaseClass}>{t("Sharifi (Otasining ismi)")}</Label>
                <Input
                  id="middle_name"
                  placeholder={t("Masalan: Alisherovich")}
                  {...register("middle_name" as const)}
                  disabled={submitting || !!existingApp}
                  className={inputBaseClass}
                />
                {errors.middle_name ? (
                  <p className="text-xs text-destructive font-semibold">{(errors.middle_name as { message?: string }).message}</p>
                ) : null}
              </div>
            </div>
          </fieldset>

          {/* Aloqa ma'lumotlari */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-2 select-none">
              <span className="w-2 h-5 rounded-full bg-indigo-900 block" />
              {t("Aloqa Ma'lumotlari")}
            </legend>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Telefon (Asosiy) */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className={labelBaseClass}>{t("Telefon raqam (Asosiy)")} <span className="text-indigo-900">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998901234567"
                  maxLength={13}
                  {...register("phone", {
                    onChange: (e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const rest = digits.startsWith("998") ? digits.slice(3) : digits;
                      const trimmed = rest.slice(0, 9);
                      e.target.value = "+998" + trimmed;
                    },
                  })}
                  disabled={submitting || !!existingApp}
                  className={`${inputBaseClass} font-mono tracking-wider font-bold`}
                />
                {errors.phone ? (
                  <p className="text-xs text-destructive font-semibold">{errors.phone.message}</p>
                ) : null}
              </div>

              {/* Telefon (Qo'shimcha) */}
              <div className="space-y-1.5">
                <Label htmlFor="phone_secondary" className={labelBaseClass}>{t("Telefon raqam (Qo'shimcha)")}</Label>
                <Input
                  id="phone_secondary"
                  type="tel"
                  placeholder="+998901234567"
                  maxLength={13}
                  {...register("phone_secondary" as const, {
                    onChange: (e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const rest = digits.startsWith("998") ? digits.slice(3) : digits;
                      const trimmed = rest.slice(0, 9);
                      e.target.value = trimmed ? "+998" + trimmed : "";
                    },
                  })}
                  disabled={submitting || !!existingApp}
                  className={`${inputBaseClass} font-mono tracking-wider font-bold`}
                />
                {errors.phone_secondary ? (
                  <p className="text-xs text-destructive font-semibold">{(errors.phone_secondary as { message?: string }).message}</p>
                ) : null}
              </div>
            </div>
          </fieldset>

          {/* Tanlanayotgan Lavozim */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-2 select-none">
              <span className="w-2 h-5 rounded-full bg-indigo-900 block" />
              {t("Tanlanayotgan Lavozim")}
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="position" className={labelBaseClass}>{t("Ochiq vakansiya")} <span className="text-indigo-900">*</span></Label>
              <Controller
                control={control}
                name="position_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(val) => onPositionChange(val, field.onChange)}
                    disabled={submitting || !!existingApp}
                  >
                    <SelectTrigger id="position" className={selectTriggerClass}>
                      <SelectValue placeholder={t("Lavozimni tanlang")} />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.position_title ? (
                <p className="text-xs text-destructive font-semibold">{errors.position_title.message}</p>
              ) : null}
            </div>
          </fieldset>

          {/* Rezyume (CV) yuklash */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5 mb-2 select-none">
              <span className="w-2 h-5 rounded-full bg-indigo-900 block" />
              {t("Rezyume (CV)")}
            </legend>
            <p className="text-sm text-slate-500 -mt-3">
              {t("Iltimos, rezyumeyingizni (CV) PDF shaklida yuklang. Fayl hajmi 5 MB dan oshmasligi kerak.")}
            </p>

            <div className="max-w-md">
              <FileUploadField
                kind="cv"
                passport_number={passportVal}
                label={t("Rezyumeni yuklash (PDF)")}
                onUploaded={(key) => setValue("cv_url", key ?? "", { shouldValidate: true })}
                disabled={submitting || !!existingApp}
              />
            </div>

            {errors.cv_url && (
              <p className="text-xs text-destructive font-semibold">{errors.cv_url.message}</p>
            )}
          </fieldset>
        </>
      )}

      {/* Ariza yuborish tugmasi */}
      <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
        <Button
          type="submit"
          size="lg"
          disabled={submitting || !!existingApp}
          className={`w-full md:w-auto rounded-xl py-6 font-bold shadow-lg text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
            isStudent
              ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25 hover:shadow-orange-500/35"
              : "bg-indigo-900 hover:bg-indigo-950 shadow-indigo-900/25 hover:shadow-indigo-900/35"
          } ${existingApp ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}`}
        >
          {submitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> {t("Yuborilmoqda...")}
            </>
          ) : (
            t("Arizani Yuborish")
          )}
        </Button>
      </div>

    </form>

    {/* Muvaffaqiyatli topshirilganlik modal oynasi */}
    {showSuccessModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6 transform scale-in duration-300 animate-in zoom-in-95">
          {/* Yashil doira va tasdiq ikonasi */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isStudent ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-900'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {t("Arizangiz qabul qilindi!")}
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {t("Murojaatingiz uchun tashakkur. Maktab ma'muriyati arizangizni tez orada ko'rib chiqadi va siz bilan bog'lanadi.")}
            </p>
          </div>

          <div className="w-full pt-2">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                reset();
                router.push("/");
              }}
              className={`w-full h-12 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                isStudent
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                  : 'bg-indigo-900 hover:bg-indigo-950 shadow-indigo-950/20'
              }`}
            >
              {t("Bosh sahifaga qaytish")}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
