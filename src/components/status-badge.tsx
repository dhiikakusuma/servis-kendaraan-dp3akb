import { CheckCircle2, Clock, XCircle } from "lucide-react";
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
