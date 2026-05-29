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
} from "@/lib/validations/application";
import type { PositionRow } from "@/lib/supabase/types";

interface ApplicationFormProps {
  passport_number: string;
  type: "student" | "vacancy";
  positions: PositionRow[];
}

const GRADES = [
  "1-sinf",
  "2-sinf",
  "3-sinf",
  "4-sinf",
  "5-sinf",
  "6-sinf",
  "7-sinf",
  "8-sinf",
  "9-sinf",
  "10-sinf",
  "11-sinf",
];

export function ApplicationForm({ passport_number, type, positions }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const isStudent = type === "student";
  const activeSchema = isStudent ? studentApplicationSchema : vacancyApplicationSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(activeSchema),
    defaultValues: (isStudent
      ? {
          type: "student",
          passport_number,
          first_name: "",
          last_name: "",
          phone: "+998",
          birth_date: "",
          parent_name: "",
          grade: "",
        }
      : {
          type: "vacancy",
          passport_number,
          first_name: "",
          last_name: "",
          phone: "+998",
          birth_date: "",
          position_id: null,
          position_title: "",
          cv_url: "",
        }) as unknown as ApplicationInput,
  });

  // Pasport/Hujjat raqami doimiy yozib turiladi
  useEffect(() => {
    setValue("passport_number", passport_number);
  }, [passport_number, setValue]);

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

  // Har bir o'zgarishda draft'ni saqlab borish
  const watched = watch();
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const draftToSave: Record<string, string | null | undefined> = {
          first_name: watched.first_name,
          last_name: watched.last_name,
          phone: watched.phone,
          birth_date: watched.birth_date,
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

      // Draft'ni tozalash
      try {
        sessionStorage.removeItem(`apply.form.draft.${type}`);
      } catch {
        // ignore
      }

      router.push("/apply/success");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Hujjat raqami haqida eslatma */}
      <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm flex items-center justify-between shadow-sm">
        <span className="text-slate-500 font-medium">
          {isStudent ? "O'quvchi hujjat raqami: " : "Pasport seriyasi va raqami: "}
        </span>
        <span className="font-bold text-slate-800 text-base">{passport_number}</span>
      </div>

      {/* Shaxsiy ma'lumotlar */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded bg-orange-500 block" />
          {isStudent ? "O'quvchining Shaxsiy Ma'lumotlari" : "Nomzodning Shaxsiy Ma'lumotlari"}
        </legend>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Ismi */}
          <div className="space-y-1.5">
            <Label htmlFor="first_name">Ismi *</Label>
            <Input
              id="first_name"
              placeholder="Masalan: Sardor"
              {...register("first_name")}
              disabled={submitting}
              className="rounded-xl border-slate-200 focus-visible:ring-indigo-900"
            />
            {errors.first_name ? (
              <p className="text-xs text-destructive font-medium">{errors.first_name.message}</p>
            ) : null}
          </div>

          {/* Familiyasi */}
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Familiyasi *</Label>
            <Input
              id="last_name"
              placeholder="Masalan: Karimov"
              {...register("last_name")}
              disabled={submitting}
              className="rounded-xl border-slate-200 focus-visible:ring-indigo-900"
            />
            {errors.last_name ? (
              <p className="text-xs text-destructive font-medium">{errors.last_name.message}</p>
            ) : null}
          </div>

          {/* Telefon */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              {isStudent ? "Ota-onaning telefon raqami *" : "Telefon raqami *"}
            </Label>
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
              disabled={submitting}
              className="rounded-xl border-slate-200 focus-visible:ring-indigo-900"
            />
            {errors.phone ? (
              <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
            ) : (
              <p className="text-xs text-slate-400">Format: +998XXXXXXXXX</p>
            )}
          </div>

          {/* Tug'ilgan sana */}
          <div className="space-y-1.5">
            <Label htmlFor="birth_date">Tug'ilgan sanasi *</Label>
            <Input
              id="birth_date"
              type="date"
              {...register("birth_date")}
              disabled={submitting}
              className="rounded-xl border-slate-200 focus-visible:ring-indigo-900"
            />
            {errors.birth_date ? (
              <p className="text-xs text-destructive font-medium">{errors.birth_date.message}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      {/* O'quvchi uchun maxsus maydonlar */}
      {isStudent && (
        <fieldset className="space-y-5">
          <legend className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded bg-orange-500 block" />
            Maktab va Ota-ona Ma'lumotlari
          </legend>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Ota-onasining to'liq ismi */}
            <div className="space-y-1.5">
              <Label htmlFor="parent_name">Ota-onaning to'liq ismi (F.I.SH.) *</Label>
              <Input
                id="parent_name"
                placeholder="Masalan: Karimov Sardor Alisherovich"
                {...register("parent_name")}
                disabled={submitting}
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-900"
              />
              {errors.parent_name ? (
                <p className="text-xs text-destructive font-medium">{errors.parent_name.message}</p>
              ) : null}
            </div>

            {/* Sinfni tanlash */}
            <div className="space-y-1.5">
              <Label htmlFor="grade">Qabul qilinadigan sinf *</Label>
              <Controller
                control={control}
                name="grade"
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <SelectTrigger id="grade" className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Sinfni tanlang" />
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
                <p className="text-xs text-destructive font-medium">{errors.grade.message}</p>
              ) : null}
            </div>
          </div>
        </fieldset>
      )}

      {/* Vakansiya uchun maxsus maydonlar */}
      {!isStudent && (
        <>
          {/* Lavozim tanlash */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded bg-indigo-900 block" />
              Tanlanayotgan Lavozim
            </legend>

            <div className="space-y-1.5">
              <Label htmlFor="position">Ochiq vakansiya *</Label>
              <Controller
                control={control}
                name="position_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(val) => onPositionChange(val, field.onChange)}
                    disabled={submitting}
                  >
                    <SelectTrigger id="position" className="rounded-xl border-slate-200">
                      <SelectValue placeholder="Lavozimni tanlang" />
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
                <p className="text-xs text-destructive font-medium">{errors.position_title.message}</p>
              ) : null}
            </div>
          </fieldset>

          {/* Rezyume (CV) yuklash */}
          <fieldset className="space-y-5">
            <legend className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded bg-indigo-900 block" />
              Rezyume (CV)
            </legend>
            <p className="text-sm text-slate-500 -mt-3">
              Iltimos, rezyumeyingizni (CV) PDF shaklida yuklang. Fayl hajmi 2 MB dan oshmasligi kerak.
            </p>

            <div className="max-w-md">
              <FileUploadField
                kind="cv"
                passport_number={passport_number}
                label="Rezyumeni yuklash (PDF)"
                onUploaded={(key) => setValue("cv_url", key ?? "", { shouldValidate: true })}
              />
            </div>

            {errors.cv_url && (
              <p className="text-xs text-destructive font-medium">{errors.cv_url.message}</p>
            )}
          </fieldset>
        </>
      )}

      {/* Ariza yuborish tugmasi */}
      <div className="flex flex-col gap-3 pt-4 border-t">
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className={`w-full md:w-auto rounded-xl py-6 font-bold shadow-lg text-white transition-all ${
            isStudent
              ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
              : "bg-indigo-900 hover:bg-indigo-950 shadow-indigo-900/20"
          }`}
        >
          {submitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> Yuborilmoqda...
            </>
          ) : (
            "Arizani Yuborish"
          )}
        </Button>
        <p className="text-xs text-slate-400 leading-relaxed">
          Arizani yuborish orqali siz shaxsiy ma'lumotlaringizning Zeyin School maktabi tomonidan qayta ishlanishiga rozilik bildirasiz.
        </p>
      </div>
    </form>
  );
}
