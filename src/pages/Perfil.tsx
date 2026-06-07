import { useApp } from "@/lib/context";
import { BADGES } from "@/lib/types";
import mascotYoshi from "@/assets/mascot-yoshi.png";
import { motion } from "framer-motion";
import { User, LogOut, Award } from "lucide-react";

export default function PerfilPage() {
  const { user, users, bets, logout } = useApp();
  if (!user) return null;

  const rank = [...users].sort((a, b) => b.points - a.points).findIndex(u => u.id === user.id) + 1;
  const totalBets = bets.filter(b => b.userId === user.id).length;

  // Use persisted badges from user, fallback to BADGES template
  const earnedBadges = (user.badges && user.badges.length > 0) ? user.badges : BADGES;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-stadium py-8 px-4">
        <div className="container text-center">
          <motion.img
            src={mascotYoshi}
            alt="Yoshi"
            className="h-20 w-20 mx-auto mb-3 object-contain rounded-full border-4 border-copa-orange bg-card"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
          <h1 className="font-display text-2xl text-primary-foreground">{user.name}</h1>
          <p className="text-primary-foreground/70 text-sm">{user.area}</p>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Posição", value: `${rank}º`, icon: "🏆" },
            { label: "Pontos", value: user.points, icon: "⭐" },
            { label: "Apostas", value: totalBets, icon: "🎯" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-4 text-center shadow-card border border-border"
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className="font-display text-xl text-copa-orange mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <section>
          <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Award size={20} className="text-copa-orange" /> Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earnedBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-4 text-center border ${
                  badge.earned
                    ? "bg-copa-orange/10 border-copa-orange shadow-glow"
                    : "bg-muted/50 border-border opacity-50"
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="font-bold text-sm text-foreground mt-2">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {badge.earned && <span className="inline-block mt-2 text-xs bg-copa-orange/20 text-copa-orange px-2 py-0.5 rounded-full font-bold">Conquistado!</span>}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Scoring rules */}
        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display text-foreground mb-3">📋 Como funciona a pontuação</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-center gap-2"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">+2</span> Acertar o vencedor do jogo</li>
            <li className="flex items-center gap-2"><span className="bg-copa-gold/20 text-copa-gold px-2 py-0.5 rounded font-bold">+3</span> Acertar o placar exato</li>
          </ul>
        </section>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive text-destructive font-semibold hover:bg-destructive/5 transition-colors"
        >
          <LogOut size={18} /> Sair do Bolão
        </button>
      </div>
    </div>
  );
}
