"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold">Nimadir noto'g'ri ketdi</h1>
      <p className="text-muted-foreground">
        Sahifani yuklashda kutilmagan xatolik yuz berdi. Qaytadan urinib ko'ring yoki birozdan keyin qayting.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Xatolik kodi: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Qaytadan urinish</Button>
        <Button variant="outline" asChild>
          <a href="/">Bosh sahifa</a>
        </Button>
      </div>
    </div>
  );
}
