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
  DialogTrigger,
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
    if (!confirm("Подтвердить удаление должности?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/positions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Ошибка при удалении");
      }
      toast({ title: "Удалено", description: "Должность удалена" });
      router.refresh();
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить должность
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="w-32">Состояние</TableHead>
              <TableHead className="text-right w-44">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPositions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-muted-foreground"
                >
                  Должностей нет. Добавьте через кнопку «Добавить должность».
                </TableCell>
              </TableRow>
            ) : (
              initialPositions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                    {p.description || "—"}
                  </TableCell>
                  <TableCell>
                    {p.active ? (
                      <Badge>Активна</Badge>
                    ) : (
                      <Badge variant="secondary">Неактивна</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
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
        throw new Error(body.error ?? "Ошибка при сохранении");
      }
      toast({
        title: "Сохранено",
        description: editing ? "Должность обновлена" : "Новая должность добавлена",
      });
      reset();
      onSaved();
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Редактировать должность" : "Добавить должность"}
          </DialogTitle>
          <DialogDescription>
            Введите данные о должности
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="position-form"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              placeholder="Например: Frontend Developer"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Краткое описание должности"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setValue("active", e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Активна (отображается при подаче заявки)
            </Label>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Отмена
          </Button>
          <Button type="submit" form="position-form" disabled={submitting}>
            {submitting && <Spinner className="mr-2" />}
            {editing ? "Обновить" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
