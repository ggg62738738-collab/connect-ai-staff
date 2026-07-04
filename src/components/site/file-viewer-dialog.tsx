import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSignedFileUrl } from "@/lib/use-signed-url";
import { Download, ExternalLink, Loader2 } from "lucide-react";

type Kind = "auto" | "pdf" | "image" | "other";

function detectKind(path: string): Kind {
  const p = path.toLowerCase().split("?")[0];
  if (p.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|avif|svg|bmp)$/.test(p)) return "image";
  return "other";
}

export function FileViewerDialog({
  path, open, onOpenChange, title = "File preview",
}: {
  path: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
}) {
  const { url, loading } = useSignedFileUrl(open ? path : null);
  const kind: Kind = path ? detectKind(path) : "other";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="border-b p-3 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-medium truncate pr-6">{title}</DialogTitle>
          {url ? (
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={url} download>
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </a>
              </Button>
            </div>
          ) : null}
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30 grid place-items-center overflow-auto">
          {loading || !url ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : kind === "pdf" ? (
            <iframe src={url} title={title} className="h-full w-full bg-background" />
          ) : kind === "image" ? (
            <img src={url} alt={title} className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground mb-3">Preview not supported for this file type.</p>
              <Button asChild size="sm">
                <a href={url} download><Download className="mr-1.5 h-4 w-4" /> Download file</a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
