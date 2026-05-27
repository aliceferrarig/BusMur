const TYPE_MAP = {
  // Status de linha
  ativa:    "badge-success",
  online:   "badge-success",
  approved: "badge-success",
  baixa:    "badge-success",

  atrasada: "badge-warning",
  pending:  "badge-warning",
  média:    "badge-warning",

  inativa:  "badge-muted",
  offline:  "badge-muted",
  rejected: "badge-danger",
  alta:     "badge-danger",

  info:     "badge-brand",
};

export default function Badge({ type = "info", children }) {
  const cls = TYPE_MAP[type] || "badge-brand";
  return (
    <span className={`badge ${cls}`}>
      {children}
    </span>
  );
}