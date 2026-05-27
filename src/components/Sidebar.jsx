import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabaseClient";
import {
  BusIcon, MapIcon, BellIcon, ShieldIcon,
  LogoutIcon, WheelIcon, SunIcon, MoonIcon,
} from "./icons/BusIcons";
import logoImg from "../assets/logo-busmur.png";
import logoImgWhite from "../assets/logo-busmur-white.png";

/* ── Ícone de Configurações ────────────────────────────────────── */
const SettingsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

/* ── Menus por cargo ────────────────────────────────────────────── */
const ROLE_MENUS = {
  passenger: [
    { label: "Linhas",        path: "/linhas",        icon: BusIcon      },
    { label: "Mapa",          path: "/mapa",          icon: MapIcon      },
    { label: "Notificações",  path: "/notificacoes",  icon: BellIcon     },
    { label: "Configurações", path: "/configuracoes", icon: SettingsIcon },
  ],
  driver: [
    { label: "Minha Rota",    path: "/motorista",     icon: WheelIcon    },
    { label: "Configurações", path: "/configuracoes", icon: SettingsIcon },
  ],
  admin: [
    { label: "Painel",        path: "/admin",         icon: ShieldIcon   },
    { label: "Linhas",        path: "/linhas",        icon: BusIcon      },
    { label: "Mapa",          path: "/mapa",          icon: MapIcon      },
    { label: "Configurações", path: "/configuracoes", icon: SettingsIcon },
  ],
};

const ROLE_LABELS = {
  passenger: "Passageiro",
  driver:    "Motorista",
  admin:     "Administrador",
};

const ROLE_BADGE_CLASS = {
  passenger: "badge-brand",
  driver:    "badge-success",
  admin:     "badge-purple",
};

/* ── Sidebar ────────────────────────────────────────────────────── */
export default function Sidebar() {
  const location               = useLocation();
  const navigate               = useNavigate();
  const { user, logout }       = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen]        = useState(false);
  const [profile, setProfile]  = useState({ name: "", avatar_url: "", role: "" });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("name, avatar_url, role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const currentRole = profile.role || user?.role || "passenger";
  const menu        = ROLE_MENUS[currentRole] || ROLE_MENUS.passenger;
  const initials    = (profile.name || user?.name || "?")[0]?.toUpperCase();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {/* ── Botão mobile ─────────────────────────────────────────── */}
      <button onClick={() => setOpen(!open)} aria-label="Menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-md"
        style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text-sub)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>
          }
        </svg>
      </button>

      {/* ── Overlay mobile ───────────────────────────────────────── */}
      {open && (
        <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-30"
          style={{ background: "rgba(0,20,35,0.45)", backdropFilter: "blur(4px)" }} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--bg)", borderRight: "1.5px solid var(--border)", boxShadow: open ? "var(--shadow-lg)" : "none" }}
      >

        {/* ── Cabeçalho / Logo ─────────────────────────────────── */}
        <div className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: "1.5px solid var(--border)" }}>
          <img
            src={theme === "dark" ? logoImgWhite : logoImg}
            alt="BusMur"
            style={{ width: 60, height: 60, objectFit: "contain", flexShrink: 0, borderRadius: 12 }}
          />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", color: "var(--brand)", lineHeight: 1.1 }}>
              Bus<span style={{ color: "var(--accent-text)", WebkitTextStroke: "0.5px var(--brand)" }}>Mur</span>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>
              Muriaé — MG
            </div>
          </div>
        </div>

        {/* ── Navegação ─────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", padding: "4px 12px 8px", textTransform: "uppercase" }}>
            Menu
          </p>
          {menu.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                className={`sidebar-item${active ? " active" : ""}`}>
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--brand)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* ── Perfil / Rodapé ───────────────────────────────────── */}
        <div className="p-3" style={{ borderTop: "1.5px solid var(--border)" }}>
          <div className="rounded-2xl p-3"
            style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar"
                  className="w-10 h-10 rounded-xl object-cover"
                  style={{ border: "2px solid var(--border)" }} />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                  style={{ background: "var(--brand)" }}>
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }} className="truncate">
                  {profile.name || user?.name || "Usuário"}
                </p>
                <span className={`badge ${ROLE_BADGE_CLASS[currentRole] || "badge-brand"}`} style={{ marginTop: 4 }}>
                  {ROLE_LABELS[currentRole]}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className="btn-ghost flex-1"
                style={{ fontSize: 12, justifyContent: "center" }}>
                {theme === "light" ? MoonIcon : SunIcon}
                {theme === "light" ? "Escuro" : "Claro"}
              </button>
              <button onClick={handleLogout} className="btn-danger btn-sm" title="Sair">
                {LogoutIcon}
              </button>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}