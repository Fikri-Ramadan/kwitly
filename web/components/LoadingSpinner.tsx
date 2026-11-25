import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text }: { text?: string; }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      {
        !!text && <p className="text-sm font-medium text-slate-700">{text}</p>
      }
    </div>
  );
}