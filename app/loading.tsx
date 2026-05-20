import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Spinner className="h-8 w-8" />
        <p className="text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
