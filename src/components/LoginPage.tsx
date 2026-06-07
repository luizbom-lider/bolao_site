import { useState } from "react";
import { useApp } from "@/lib/context";
import { AREAS } from "@/lib/types";
import mascotYoshi from "@/assets/mascot-yoshi.png";
import logoCube from "@/assets/lider-colorido.png";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const { login, register } = useApp();
  const [mode, setMode] = useState<"restricted" | "login" | "register">("restricted");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim(), area);
    // If login didn't set user, they're not approved or don't exist
    setTimeout(() => {
      setFeedback({ type: "error", message: "Usuário não encontrado ou ainda não aprovado pelo administrador." });
    }, 100);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area || !accessCode) return;
    const result = register(name.trim(), area, accessCode);
    if (result === null) {
      // User was logged in (already existed and approved)
      return;
    }
    if (result.includes("inválido")) {
      setFeedback({ type: "error", message: result });
    } else {
      setFeedback({ type: "success", message: result });
    }
  };

  if (mode === "restricted") {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <img src={logoCube} alt="Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="font-display text-3xl text-primary-foreground mb-2">BOLÃO COPA 2026</h1>

          <div className="bg-card rounded-2xl p-8 shadow-card mt-6">
            <div className="flex justify-center -mt-16 mb-4">
              <motion.img
                src={mascotYoshi}
                alt="Yoshi Mascote"
                className="h-24 w-24 object-contain rounded-full border-4 border-copa-orange bg-card"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>

            <ShieldAlert className="mx-auto h-10 w-10 text-copa-orange mb-3" />
            <h2 className="font-display text-xl text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Este sistema é <strong className="text-foreground">exclusivo para membros da empresa júnior</strong>. 
              Para participar do bolão, você precisa de um código de acesso interno e aprovação do administrador.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setMode("register"); setFeedback(null); }}
                className="w-full bg-gradient-fire text-accent-foreground font-display py-3 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-glow flex items-center justify-center gap-2"
              >
                <UserPlus size={20} /> CRIAR CONTA
              </button>
              <button
                onClick={() => { setMode("login"); setFeedback(null); }}
                className="w-full bg-card border-2 border-copa-orange text-copa-orange font-display py-3 rounded-lg hover:bg-copa-orange/10 transition-colors text-lg flex items-center justify-center gap-2"
              >
                <LogIn size={20} /> JÁ TENHO CONTA
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={logoCube} alt="Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="font-display text-3xl text-primary-foreground mb-2">BOLÃO COPA 2026</h1>
          <p className="text-primary-foreground/70 text-sm">
            {mode === "register" ? "Cadastre-se para participar!" : "Acesse sua conta"}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card">
          <div className="flex justify-center -mt-16 mb-4">
            <motion.img
              src={mascotYoshi}
              alt="Yoshi Mascote"
              className="h-24 w-24 object-contain rounded-full border-4 border-copa-orange bg-card"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          <h2 className="font-display text-xl text-center text-foreground mb-6">
            {mode === "register" ? "Criar Conta" : "Entrar no Bolão"}
          </h2>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg text-sm text-center font-medium ${
                feedback.type === "success"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {feedback.message}
            </motion.div>
          )}

          {mode === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Seu Nome</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Área da EJ</label>
                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                >
                  <option value="">Selecione sua área</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  <Lock size={14} className="inline mr-1" />
                  Código de Acesso
                </label>
                <input
                  type="password"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                  placeholder="Digite o código interno"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-fire text-accent-foreground font-display py-3 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-glow"
              >
                CADASTRAR ⚽
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Seu Nome</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-fire text-accent-foreground font-display py-3 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-glow"
              >
                ENTRAR ⚽
              </button>
            </form>
          )}

          <button
            onClick={() => { setMode(mode === "register" ? "login" : mode === "login" ? "restricted" : "restricted"); setFeedback(null); }}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {mode === "register" ? "Já tenho conta → Entrar" : "← Voltar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
