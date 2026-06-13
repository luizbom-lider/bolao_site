import { useApp } from "@/lib/context";
import { motion } from "framer-motion";
import { LogOut, Award, Trophy } from "lucide-react";

export default function PerfilPage() {
  const { user, users, bets, logout } = useApp();
  if (!user) return null;

  const rank = [...users].sort((a, b) => b.points - a.points).findIndex(u => u.id === user.id) + 1;
  const totalBets = bets.filter(b => b.userId === user.id).length;

  const earnedBadges = user.badges && user.badges.length > 0 ? user.badges : [];

  // Get the highest tier earned
  const highestEarned = [...earnedBadges].reverse().find(b => b.earned);
  const exactCount = earnedBadges[0]?.currentExact ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-stadium py-8 px-4">
        <div className="container text-center">
          <h1 className="font-display text-2xl text-primary-foreground">{user.name}</h1>
          <p className="text-primary-foreground/70 text-sm">{user.area}</p>
          {highestEarned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1"
            >
              <Trophy size={14} className="text-copa-gold" />
              <span className="text-sm font-semibold text-primary-foreground">
                Nível {highestEarned.name}
              </span>
              <span className="text-lg">{highestEarned.icon}</span>
            </motion.div>
          )}
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

        {/* Badges - Tier System */}
        <section>
          <h2 className="font-display text-lg text-foreground mb-2 flex items-center gap-2">
            <Award size={20} className="text-copa-orange" /> Níveis
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Acerte placares exatos para subir de nível! Você tem <span className="font-bold text-copa-orange">{exactCount}</span> acerto{exactCount !== 1 ? 's' : ''} exato{exactCount !== 1 ? 's' : ''}.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {earnedBadges.map((badge, i) => {
              const progress = Math.min((badge.currentExact ?? 0) / badge.requiredExact, 1);
              const tierClass = badge.earned ? `badge-${badge.tier}` : 'badge-locked';

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                  className={`badge-card ${tierClass}`}
                >
                  <span className="badge-icon">{badge.icon}</span>
                  <p className="font-display text-sm text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.earned
                      ? badge.description
                      : `${badge.currentExact ?? 0}/${badge.requiredExact} acertos`
                    }
                  </p>

                  {/* Progress bar */}
                  <div className="badge-progress-bar">
                    <div
                      className={`badge-progress-fill progress-${badge.tier}`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  {badge.earned && (
                    <span className={`badge-earned-tag tag-${badge.tier}`}>
                      ✓ Conquistado!
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Scoring rules */}
        <section className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display text-foreground mb-3">📋 Como funciona a pontuação</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-center gap-2"><span className="bg-copa-gold/20 text-copa-gold px-2 py-0.5 rounded font-bold">+5</span> Acertar o placar exato</li>
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
