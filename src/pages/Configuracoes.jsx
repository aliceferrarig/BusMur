import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useProfile } from "../hooks/useProfile";
import toast from "react-hot-toast";

/* ── Formatadores ───────────────────────────────────────────────── */
const formatCPF = (v) => {
  if (!v) return "Não informado";
  const n = v.replace(/\D/g, "");
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
};

const formatTel = (v) => {
  if (!v) return "Não informado";
  const n = v.replace(/\D/g, "");
  return n.length <= 10
    ? n.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    : n.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const ROLE_LABELS = { admin: "Administrador", driver: "Motorista", passenger: "Passageiro" };
const ROLE_BADGE  = { admin: "badge-purple",  driver: "badge-success", passenger: "badge-brand" };

/* ── Configurações ──────────────────────────────────────────────── */
export default function Configuracoes() {
  const [user,           setUser]          = useState(null);
  const [nome,           setNome]          = useState("");
  const [telefone,       setTelefone]      = useState("");
  const [email,          setEmail]         = useState("");
  const [cpf,            setCpf]           = useState("");
  const [role,           setRole]          = useState("");
  const [avatarUrl,      setAvatarUrl]     = useState(null);
  const [avatarFile,     setAvatarFile]    = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState({});

  const { updateProfile, loading } = useProfile(user);

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        const info = {
          name:      profile.name      || "",
          phone:     profile.phone     || "",
          email:     authUser.email    || "",
          cpf:       profile.cpf       || "",
          role:      profile.role      || "passenger",
          avatar_url: profile.avatar_url || "",
        };
        setNome(info.name);
        setTelefone(info.phone);
        setEmail(info.email);
        setCpf(info.cpf);
        setRole(info.role);
        setAvatarUrl(info.avatar_url);
        setDadosOriginais(info);
      }
    }
    load();
  }, []);

  const handleSalvar = async () => {
    if (nome === dadosOriginais.name && !avatarFile) {
      return toast.error("Nada foi alterado!");
    }
    const ok = await updateProfile({ name: nome, avatarFile });
    if (ok) setTimeout(() => window.location.reload(), 500);
  };

  if (!user) {
    return (
      <div style={{ padding: 32, color: "var(--text)" }}>Carregando...</div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>

      {/* Cabeçalho */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--brand)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </div>
          <div>
            <h1>Configurações</h1>
            <p>Dados da sua conta</p>
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div className="card" style={{ padding: "28px 28px 24px" }}>

        {/* Avatar + info */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 20,
            padding: "16px 20px", marginBottom: 28,
            background: "var(--bg-soft)", borderRadius: 12,
            border: "1.5px solid var(--border)",
          }}
        >
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=004c68&color=fff&bold=true`}
            className="rounded-2xl object-cover"
            style={{ width: 76, height: 76, border: "2.5px solid var(--brand-mid)" }}
            alt="Avatar"
          />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
              {nome || "Usuário"}
            </h2>
            <span className={`badge ${ROLE_BADGE[role] || "badge-brand"}`}>
              {ROLE_LABELS[role] || "Passageiro"}
            </span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)", textDecoration: "underline" }}>
                Alterar foto
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setAvatarFile(f); setAvatarUrl(URL.createObjectURL(f)); }
                }}
              />
            </label>
          </div>
        </div>

        {/* Campos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
          {/* Nome — span total */}
          <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
            <label>Nome completo</label>
            <input
              type="text"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {/* Email (readonly) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>E-mail</label>
            <input
              type="text"
              className="input-field"
              value={email}
              disabled
              style={{ opacity: 0.55, cursor: "not-allowed", background: "var(--bg-muted)" }}
            />
          </div>

          {/* CPF (readonly) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>CPF</label>
            <input
              type="text"
              className="input-field mono"
              value={formatCPF(cpf)}
              disabled
              style={{ opacity: 0.55, cursor: "not-allowed", background: "var(--bg-muted)" }}
            />
          </div>

          {/* Telefone (readonly) — span total */}
          <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
            <label>Telefone</label>
            <input
              type="text"
              className="input-field"
              value={formatTel(telefone)}
              disabled
              style={{ opacity: 0.55, cursor: "not-allowed", background: "var(--bg-muted)" }}
            />
          </div>
        </div>

        {/* Aviso campos bloqueados */}
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
          * E-mail, CPF e telefone são definidos no cadastro e não podem ser alterados aqui.
        </p>

        {/* Salvar */}
        <button
          onClick={handleSalvar}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", fontSize: 15 }}
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}