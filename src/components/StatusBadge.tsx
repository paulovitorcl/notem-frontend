import type { DocumentStatus } from "@/lib/types";

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_MAP: Record<DocumentStatus, StatusConfig> = {
  gerado: {
    label: "Gerado",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  revisado: {
    label: "Revisado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  finalizado: {
    label: "Finalizado",
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

interface Props {
  status: DocumentStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.gerado;
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
