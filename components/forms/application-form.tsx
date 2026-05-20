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
      first_name: "",
      last_name: "",
      phone: "+998",
      birth_date: "",
      position_id: null,
      position_title: "",
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
          first_name: watched.first_name,
          last_name: watched.last_name,
          phone: watched.phone,
          birth_date: watched.birth_date,
          position_id: watched.position_id,
          position_title: watched.position_title,
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
          title: "Слишком много попыток",
          description: "Попробуйте снова через минуту.",
          variant: "destructive",
        });
        return;
      }

      if (res.status === 409) {
        toast({
          title: "Заявка уже существует",
          description: "По этому паспорту заявка уже подана.",
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({
          title: "Ошибка",
          description: data?.error ?? "Произошла ошибка при отправке заявки.",
          variant: "destructive",
        });
        return;
      }

      // tozalash
      try {
        sessionStorage.removeItem("apply.form.draft");
      } catch {
        // ignore
      }

      router.push("/apply/success");
    } catch (err) {
      console.error(err);
      toast({
        title: "Ошибка сети",
        description: "Не удалось связаться с сервером.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-md bg-muted/50 border px-4 py-3 text-sm">
        <span className="text-muted-foreground">Номер паспорта: </span>
        <span className="font-semibold">{passport_number}</span>
      </div>

      {/* Shaxsiy ma'lumotlar */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Личные данные</legend>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">Имя *</Label>
            <Input
              id="first_name"
              placeholder="Иван"
              {...register("first_name")}
              disabled={submitting}
            />
            {errors.first_name ? (
              <p className="text-xs text-destructive">{errors.first_name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name">Фамилия *</Label>
            <Input
              id="last_name"
              placeholder="Иванов"
              {...register("last_name")}
              disabled={submitting}
            />
            {errors.last_name ? (
              <p className="text-xs text-destructive">{errors.last_name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Телефон *</Label>
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
              <p className="text-xs text-muted-foreground">Формат: +998XXXXXXXXX</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birth_date">Дата рождения *</Label>
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
      </fieldset>

      {/* Lavozim */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Выбранная должность</legend>

        <div className="space-y-1.5">
          <Label htmlFor="position">Должность *</Label>
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
                  <SelectValue placeholder="Выберите должность" />
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

      </fieldset>

      {/* Hujjatlar */}
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Документы</legend>
        <p className="text-sm text-muted-foreground -mt-3">
          Загрузите каждый из перечисленных документов. Файлы проверяются автоматически.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <FileUploadField
            kind="cv"
            passport_number={passport_number}
            label="Резюме (PDF)"
            onUploaded={(key) =>
              setValue("cv_url", key ?? "", { shouldValidate: true })
            }
          />
          <FileUploadField
            kind="passport_scan"
            passport_number={passport_number}
            label="Скан паспорта"
            onUploaded={(key) =>
              setValue("passport_scan_url", key ?? "", { shouldValidate: true })
            }
          />
          <FileUploadField
            kind="diploma"
            passport_number={passport_number}
            label="Диплом (PDF)"
            onUploaded={(key) =>
              setValue("diploma_url", key ?? "", { shouldValidate: true })
            }
          />
          <FileUploadField
            kind="photo"
            passport_number={passport_number}
            label="Фото 3x4"
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
              <Spinner className="mr-2" /> Отправка...
            </>
          ) : (
            "Отправить"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Отправляя заявку, вы соглашаетесь на обработку персональных данных.
        </p>
      </div>
    </form>
  );
}
