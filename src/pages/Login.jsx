import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

/* ── Ícones dos perfis ──────────────────────────────────────────── */
const RoleIcons = {
  passenger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  driver: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="12" y1="15" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="9" y2="12"/>
      <line x1="15" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

const roles = [
  { id: "passenger", label: "Passageiro" },
  { id: "driver",    label: "Motorista"  },
  { id: "admin",     label: "Admin"      },
];

/* ── Força da senha ─────────────────────────────────────────────── */
function getPasswordStrength(p) {
  if (!p) return { level: 0, label: "", color: "" };
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { level: 1, label: "Fraca",  color: "var(--danger)"  };
  if (s <= 2) return { level: 2, label: "Média",  color: "var(--warning)" };
  if (s <= 3) return { level: 3, label: "Boa",    color: "var(--brand)"   };
  return       { level: 4, label: "Forte", color: "var(--success)"  };
}

/* ── Logo BusMur inline ─────────────────────────────────────────── */
const LogoIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="48" height="48" rx="14" fill="#004c68"/>
    <rect x="8" y="15" width="32" height="19" rx="4" fill="#ffe500"/>
    <rect x="8" y="22.5" width="32" height="1.8" fill="#004c68" opacity="0.18"/>
    <rect x="11" y="17" width="7" height="5" rx="1.8" fill="#004c68" opacity="0.55"/>
    <rect x="22" y="17" width="7" height="5" rx="1.8" fill="#004c68" opacity="0.55"/>
    <circle cx="15.5" cy="36" r="4" fill="#004c68"/>
    <circle cx="15.5" cy="36" r="2"  fill="#ffe500"/>
    <circle cx="32.5" cy="36" r="4" fill="#004c68"/>
    <circle cx="32.5" cy="36" r="2"  fill="#ffe500"/>
  </svg>
);

/* ── Login ──────────────────────────────────────────────────────── */
export default function Login() {
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("passenger");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const strength = getPasswordStrength(password);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, selectedRole);
      toast.success("Bem-vindo ao BusMur!");
      const paths = { passenger: "/linhas", driver: "/motorista", admin: "/admin" };
      navigate(paths[selectedRole]);
    } catch (err) {
      toast.error(err.message || "E-mail ou senha inválidos.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-soft)", transition: "background 0.25s" }}
    >
      {/* Decoração de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Grid sutil */}
        <div className="absolute inset-0 map-bg opacity-60" />
        {/* Manchas de luz */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,76,104,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,229,0,0.10) 0%, transparent 70%)" }}
        />
      </div>

      {/* Toggle tema */}
      <button
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="absolute top-5 right-5 p-2.5 rounded-xl transition-all"
        style={{
          background: "var(--bg)",
          border: "1.5px solid var(--border)",
          color: "var(--text-muted)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {theme === "light"
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        }
      </button>

      {/* Card central */}
      <div
        className="relative z-10 w-full mx-4 fade-in-up"
        style={{ maxWidth: 420 }}
      >
        {/* Cabeçalho da marca */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center mb-4" style={{ filter: "drop-shadow(0 8px 20px rgba(0,76,104,0.22))" }}>
            <LogoIcon />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.8px", color: "var(--brand)", lineHeight: 1 }}>
            Bus<span style={{ color: "var(--accent-text)" }}>Mur</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 5, fontWeight: 500 }}>
            Transporte público de Muriaé
          </p>
        </div>

        {/* Card do formulário */}
        <div
          className="card"
          style={{ padding: "32px 28px", boxShadow: "var(--shadow-lg)" }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>
            Entrar no sistema
          </h2>

          {/* Seletor de perfil */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
            {roles.map((r) => {
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 8px",
                    borderRadius: 10,
                    border: isActive ? "2px solid var(--brand)" : "1.5px solid var(--border)",
                    background: isActive ? "var(--brand-light)" : "var(--bg)",
                    color: isActive ? "var(--brand)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    fontFamily: "inherit",
                  }}
                >
                  {RoleIcons[r.id]}
                  <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="password">Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  style={{ paddingRight: 44 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    background: "none", border: "none", cursor: "pointer",
                    padding: 4, borderRadius: 6,
                  }}
                >
                  {showPassword
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>

              {/* Força da senha */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: 4, borderRadius: 99,
                          background: i <= strength.level ? strength.color : "var(--border)",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>
                    Senha {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Botão de entrar — amarelo como CTA principal */}
            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{ width: "100%", marginTop: 24, fontSize: 15 }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} opacity={0.25}/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round"/>
                  </svg>
                  Entrando...
                </span>
              ) : "Entrar"}
            </button>
          </form>

          {/* Links secundários */}
          <div
            style={{
              marginTop: 20, paddingTop: 20,
              borderTop: "1.5px solid var(--border)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
              Não tem conta?{" "}
              <Link
                to="/cadastro-usuario"
                style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}
              >
                Cadastre-se
              </Link>
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Motorista?{" "}
              <Link
                to="/cadastro-motorista"
                style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}
              >
                Solicite seu acesso
              </Link>
            </p>
          </div>
        </div>

        {/* Botão instalar — fora do card, discreto */}
        <Link
          to="/instalar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
            padding: "11px 16px",
            borderRadius: 10,
            border: "1.5px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text-muted)",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--brand)";
            e.currentTarget.style.color = "var(--brand)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          Instalar app no celular
        </Link>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 20 }}>
          © {new Date().getFullYear()} BusMur — Prefeitura de Muriaé
        </p>
      </div>
    </div>
  );
}