import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createTalentUploadUrl } from "@/lib/uploads.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { FileViewerDialog } from "@/components/site/file-viewer-dialog";

/**
 * Uploads a file to a private bucket via signed URL
 * and stores the resulting storage path via `onChange`.
 */
export function FileUploadField({
  label, value, onChange, kind, accept,
}: {
  label: string;
  value?: string;
  onChange: (path: string | undefined) => void;
  kind: string;
  accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const { bucket, path, token } = await createTalentUploadUrl({ data: { filename: file.name, kind } });
      const { error } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file, { upsert: true });
      if (error) throw new Error(error.message);
      onChange(path);
      toast.success(`${label} uploaded`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          <span>{value ? "Replace" : "Upload"}</span>
          <input
            type="file"
            className="hidden"
            accept={accept}
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
          />
        </label>
        {value ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setViewOpen(true)}>
              <Eye className="mr-1 h-3.5 w-3.5" /> View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
              <X className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
            <span className="max-w-[220px] truncate text-xs text-muted-foreground" title={value}>{value.split("/").pop()}</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No file yet</span>
        )}
      </div>
      <FileViewerDialog path={value ?? null} open={viewOpen} onOpenChange={setViewOpen} title={label} />
    </div>
  );
}
