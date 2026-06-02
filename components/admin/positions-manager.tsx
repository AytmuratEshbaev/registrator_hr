"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import {
  positionSchema,
  type PositionInput,
} from "@/lib/validations/position";
import type { PositionRow } from "@/lib/supabase/types";

interface Props {
  initialPositions: PositionRow[];
}

export function PositionsManager({ initialPositions }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PositionRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: PositionRow) {
    setEditing(p);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Lavozimni o'chirishni tasdiqlaysizmi?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/positions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "O'chirishda xatolik yuz berdi");
      }
      toast({ title: "O'chirildi", description: "Lavozim muvaffaqiyatli o'chirildi" });
      router.refresh();
    } catch (err) {
      toast({
        title: "Xatolik",
        description: err instanceof Error ? err.message : "Noma'lum xatolik",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate} className="rounded-xl font-bold bg-indigo-900 hover:bg-indigo-950">
          <Plus className="mr-2 h-4 w-4" />
          Yangi lavozim qo'shish
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200/85 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b">
            <TableRow>
              <TableHead className="font-bold text-slate-800">Lavozim nomi</TableHead>
              <TableHead className="font-bold text-slate-800">Tavsif (Izoh)</TableHead>
              <TableHead className="w-32 font-bold text-slate-800">Holati</TableHead>
              <TableHead className="text-right w-44 font-bold text-slate-800">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPositions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-slate-400 font-medium"
                >
                  Hozircha hech qanday lavozim yo'q. Yangi lavozim qo'shish tugmasi orqali qo'shing.
                </TableCell>
              </TableRow>
            ) : (
              initialPositions.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/30">
                  <TableCell className="font-bold text-slate-900">{p.title}</TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-md truncate font-medium">
                    {p.description || "—"}
                  </TableCell>
                  <TableCell>
                    {p.active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold rounded-lg px-2.5 py-0.5 shadow-none hover:bg-emerald-50">Faol</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-50 text-slate-500 border border-slate-200 font-bold rounded-lg px-2.5 py-0.5 shadow-none">Nofaol</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(p)}
                        className="rounded-lg font-semibold border-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Tahrirlash
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="rounded-lg font-semibold border-slate-200 hover:bg-destructive/5 hover:border-destructive"
                      >
                        {deletingId === p.id ? (
                          <Spinner className="h-3.5 w-3.5" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PositionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => {
          setDialogOpen(false);
          setEditing(null);
          router.refresh();
        }}
      />
    </div>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PositionRow | null;
  onSaved: () => void;
}

function PositionDialog({ open, onOpenChange, editing, onSaved }: DialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PositionInput>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      title: "",
      description: "",
      active: true,
    },
  });

  // Reset form whenever the dialog opens — populate when editing, clear when creating.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        title: editing.title,
        description: editing.description ?? "",
        active: editing.active,
      });
    } else {
      reset({ title: "", description: "", active: true });
    }
  }, [open, editing, reset]);

  const active = watch("active");

  async function onSubmit(values: PositionInput) {
    setSubmitting(true);
    try {
      const url = editing
        ? `/api/admin/positions/${editing.id}`
        : "/api/admin/positions";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          active: values.active,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Saqlashda xatolik yuz berdi");
      }
      toast({
        title: "Saqlandi",
        description: editing ? "Lavozim muvaffaqiyatli yangilandi" : "Yangi lavozim muvaffaqiyatli qo'shildi",
      });
      reset();
      onSaved();
    } catch (err) {
      toast({
        title: "Xatolik",
        description: err instanceof Error ? err.message : "Noma'lum xatolik",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {editing ? "Lavozimni tahrirlash" : "Yangi lavozim qo'shish"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lavozim ma'lumotlarini kiriting
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="position-form"
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold text-slate-700">Lavozim nomi *</Label>
            <Input
              id="title"
              placeholder="Masalan: Matematika o'qituvchisi"
              {...register("title")}
              className="rounded-xl border-slate-200"
            />
            {errors.title && (
              <p className="text-xs text-destructive font-semibold">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold text-slate-700">Tavsif (Izoh)</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Lavozim haqida qisqacha ma'lumot"
              {...register("description")}
              className="rounded-xl border-slate-200 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive font-semibold">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setValue("active", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-900 focus:ring-indigo-900/10 cursor-pointer"
            />
            <Label htmlFor="active" className="cursor-pointer text-xs font-bold text-slate-700 select-none">
              Faol (ariza topshirish oynasida ko'rinadi)
            </Label>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl font-bold border-slate-200"
          >
            Bekor qilish
          </Button>
          <Button type="submit" form="position-form" disabled={submitting} className="rounded-xl font-bold bg-indigo-900 hover:bg-indigo-950">
            {submitting && <Spinner className="mr-2" />}
            {editing ? "Yangilash" : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
