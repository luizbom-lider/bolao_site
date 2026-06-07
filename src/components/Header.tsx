import { Link, useLocation } from "react-router-dom";
import logoCube from "@/assets/logo-cube.png";
import { useApp } from "@/lib/context";
import { Home, Trophy, Target, User, LogOut, Menu, X, Settings } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/apostas", label: "Apostas", icon: Target },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/admin", label: "Admin", icon: Settings },
];

export default function Header() {
  const { user, logout } = useApp();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-stadium border-b border-primary/20 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoCube} alt="Logo EJ" className="h-10 w-10 object-contain" />
          <span className="font-display text-primary-foreground text-lg hidden sm:block">
            BOLÃO COPA 2026
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === item.to
                  ? "bg-copa-orange text-accent-foreground shadow-glow"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          {user && (
            <button onClick={logout} className="ml-2 p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-primary-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden bg-gradient-stadium border-t border-primary-foreground/10 pb-4 px-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === item.to
                  ? "bg-copa-orange text-accent-foreground"
                  : "text-primary-foreground/80"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          {user && (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-primary-foreground/60 text-sm font-semibold">
              <LogOut size={18} /> Sair
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
