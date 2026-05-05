import { CheckCircle2, ClipboardCheck, Clock, XCircle } from "lucide-react";
import { Badge } from "./ui/badge";

export function StatusBadge({ status }: { status: string }) {
  if (status === "disetujui") {
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3" /> Disetujui
      </Badge>
    );
  }
  if (status === "ditolak") {
    return (
      <Badge variant="danger">
        <XCircle className="h-3 w-3" /> Ditolak
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      <Clock className="h-3 w-3" /> Menunggu
    </Badge>
  );
}

export function VerifStatusBadge({ status }: { status: string }) {
  if (status === "diverifikasi") {
    return (
      <Badge variant="success">
        <CheckCircle2 className="h-3 w-3" /> Diverifikasi
      </Badge>
    );
  }
  if (status === "ditolak_verifikator") {
    return (
      <Badge variant="danger">
        <XCircle className="h-3 w-3" /> Ditolak Verifikator
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      <ClipboardCheck className="h-3 w-3" /> Menunggu Verifikasi
    </Badge>
  );
}
