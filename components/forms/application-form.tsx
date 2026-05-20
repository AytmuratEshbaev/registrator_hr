"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { applicationSchema, type ApplicationInput } from "@/lib/validations/application";
import type { PositionRow } from "@/lib/supabase/types";

interface ApplicationFormProps {
  passport_number: string;
  positions: PositionRow[];
}

export function ApplicationForm({ passport_number, positions }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      passport_number,
      full_name: "",
      email: "",
      phone: "+998",
      birth_date: "",
      address: "",
      position_id: null,
      position_title: "",
      about: "",
      cv_url: "",
      passport_scan_url: "",
      diploma_url: "",
      photo_url: "",
    },
  });

  // Pasport raqami URL/sessionStorage'dan kelgan bo'lsa, RHF default'iga yozish
  useEffect(() => {
    setValue("passport_number", passport_number);
  }, [passport_number, setValue]);

  // sessionStorage'dan oldingi yarim-to'ldirilgan ma'lumotlarni tiklash
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("apply.form.draft");
      if (raw) {
        const draft = JSON.parse(raw) as Partial<ApplicationInput>;
        for (const [k, v] of Object.entries(draft)) {
          if (k === "passport_number") continue;
          if (typeof v === "string" || v === null) {
            setValue(k as keyof ApplicationInput, v as never, { shouldValidate: false });
          }
        }
      }
    } catch {
      // ignore
    }
  }, [setValue]);

  // Har bir o'zgarishdan keyin draft'ni saqlash (fayl maydonlarisiz)
  const watched = watch();
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const draftToSave = {
          full_name: watched.full_name,
          email: watched.email,
          phone: watched.phone,
          birth_date: watched.birth_date,
          address: watched.address,
          position_id: watched.position_id,
          position_title: watched.position_title,
          about: watched.about,
        };
        sessionStorage.setItem("apply.form.draft", JSON.stringify(draftToSave));
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(id);
  }, [watched]);

  function onPositionChange(positionId: string, fieldOnChange: (val: string) => void) {
    const pos = positions.find((p) => p.id === positionId);
    if (pos) {
      fieldOnChange(pos.id);
      setValue("position_title", pos.title, { shouldValidate: true });
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
          title: "Juda ko'p urinish",
          description: "Bir daqiqadan so'ng qayta urinib ko'ring.",
          variant: "destructive",
        });
        return;
      }

      if (res.status === 409) {
        toast({
          title: "Ariza mavjud",
          description: "Bu pasport bilan ariza topshirilgan.",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({
          title: "Xatolik",
          description: data?.error ?? "Arizani jo'natishda xatolik yuz berdi.",
          variant: "destructive",
        });
        return;
      }

      const data: { id: string } = await res.json();

      // tozalash
      try {
        sessionStorage.removeItem("apply.form.draft");
      } catch {
        // ignore
      }

      router.push(`/apply/success?id=${encodeURIComponent(data.id)}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Tarmoq xatosi",
        description: "Server bilan bog'lanib bo'lmadi.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-md bg-muted/50 border px-4 py-3 text-sm">
        <span className="text-muted-foreground">Pasport raqami: </span>
        <span className="font-semibold">{passport_number}</span>
      </div>

      {/* Shaxsiy ma'lumotlar */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Shaxsiy ma&apos;lumotlar</legend>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">To&apos;liq ism *</Label>
            <Input
              id="full_name"
              placeholder="Ali Valiyev Sodiqovich"
              {...register("full_name")}
              disabled={submitting}
            />
            {errors.full_name ? (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="ali@example.com"
              {...register("email")}
              disabled={submitting}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefon raqami *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+998901234567"
              maxLength={13}
              {...register("phone", {
                onChange: (e) => {
                  // Faqat raqamlarni qoldiramiz va doim +998 prefiks bilan boshlaymiz
                  const digits = e.target.value.replace(/\D/g, "");
                  const rest = digits.startsWith("998")
                    ? digits.slice(3)
                    : digits;
                  const trimmed = rest.slice(0, 9);
                  e.target.value = "+998" + trimmed;
                },
              })}
              disabled={submitting}
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Format: +998XXXXXXXXX</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birth_date">Tug&apos;ilgan sana *</Label>
            <Input
              id="birth_date"
              type="date"
              {...register("birth_date")}
              disabled={submitting}
            />
            {errors.birth_date ? (
              <p className="text-xs text-destructive">{errors.birth_date.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Manzil *</Label>
          <Input
            id="address"
            placeholder="Toshkent shahri, Chilonzor tumani, 1-uy"
            {...register("address")}
            disabled={submitting}
          />
          {errors.address ? (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          ) : null}
        </div>
      </fieldset>

      {/* Lavozim */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Tanlangan lavozim</legend>

        <div className="space-y-1.5">
          <Label htmlFor="position">Lavozim *</Label>
          <Controller
            control={control}
            name="position_id"
            render={({ field }) => (
              <Select
                value={field.value ?? undefined}
                onValueChange={(val) => onPositionChange(val, field.onChange)}
                disabled={submitting}
              >
                <SelectTrigger id="position">
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
            <p className="text-xs text-destructive">{errors.position_title.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="about">O&apos;zingiz haqida *</Label>
          <Textarea
            id="about"
            rows={5}
            placeholder="Tajribangiz, ko'nikmalaringiz va nima uchun bu lavozimga mos kelishingizni yozing."
            {...register("about")}
            disabled={submitting}
          />
          {errors.about ? (
            <p className="text-xs text-destructive">{errors.about.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Kamida 20 ta belgi.</p>
          )}
        </div>
      </fieldset>

      {/* Hujjatlar */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Hujjatlar</legend>
        <p className="text-sm text-muted-foreground -mt-3">
          Quyidagi hujjatlarning har birini yuklang. Fayllar avtomatik tekshiriladi.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <FileUploadField
            kind="cv"
            passport_number={passport_number}
            label="CV (PDF)"
            onUploaded={(key) =>
              setValue("cv_url", key ?? "", { shouldValidate: true })
            }
          />
          <FileUploadField
            kind="passport_scan"
            passport_number={passport_number}
            label="Pasport skani"
            onUploaded={(key) =>
              setValue("passport_scan_url", key ?? "", { shouldValidate: true })
            }
          />
          <FileUploadField
            kind="diploma"
            passport_number={passport_number}
            label="Diplom (PDF)"
            onUploaded={(key) =>
              setValue("diploma_url", key ?? "", { shouldValidate: true })
            }
          />
          <FileUploadField
            kind="photo"
            passport_number={passport_number}
            label="3x4 surat"
            onUploaded={(key) =>
              setValue("photo_url", key ?? "", { shouldValidate: true })
            }
          />
        </div>

        {(errors.cv_url ||
          errors.passport_scan_url ||
          errors.diploma_url ||
          errors.photo_url) && (
          <ul className="text-xs text-destructive list-disc pl-5 space-y-0.5">
            {errors.cv_url ? <li>{errors.cv_url.message}</li> : null}
            {errors.passport_scan_url ? <li>{errors.passport_scan_url.message}</li> : null}
            {errors.diploma_url ? <li>{errors.diploma_url.message}</li> : null}
            {errors.photo_url ? <li>{errors.photo_url.message}</li> : null}
          </ul>
        )}
      </fieldset>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto">
          {submitting ? (
            <>
              <Spinner className="mr-2" /> Yuborilmoqda...
            </>
          ) : (
            "Yuborish"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Arizani jo&apos;natish orqali siz shaxsiy ma&apos;lumotlaringizni qayta ishlashga rozilik
          bildirasiz.
        </p>
      </div>
    </form>
  );
}
