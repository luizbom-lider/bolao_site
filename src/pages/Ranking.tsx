import { useApp } from "@/lib/context";
import mascotYoshi from "@/assets/mascot-yoshi.png";
import { motion } from "framer-motion";
import { Medal } from "lucide-react";

export default function RankingPage() {
  const { users, user: currentUser } = useApp();
  const sorted = [...users].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd for visual
  const podiumHeights = ["h-28", "h-36", "h-24"];
  const podiumColors = ["bg-copa-silver", "bg-copa-gold", "bg-copa-bronze"];
  const podiumBorders = ["border-copa-silver", "border-copa-gold", "border-copa-bronze"];
  const medals = ["🥈", "🥇", "🥉"];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-stadium py-8 px-4">
        <div className="container text-center">
          <h1 className="font-display text-2xl md:text-4xl text-primary-foreground">🏆 Ranking</h1>
          <p className="text-primary-foreground/70 mt-1">Os melhores palpiteiros da EJ</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Podium */}
        <div className="flex items-end justify-center gap-3 mb-10 px-4">
          {podiumOrder.map((idx, posIdx) => {
            const u = top3[idx];
            if (!u) return null;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: posIdx * 0.15 }}
                className="flex flex-col items-center flex-1 max-w-[140px]"
              >
                {idx === 0 && (
                  <motion.img
                    src={mascotYoshi}
                    alt="Yoshi"
                    className="h-14 w-14 object-contain mb-1"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                <span className="text-3xl mb-1">{medals[posIdx]}</span>
                <p className="font-bold text-sm text-foreground text-center truncate w-full">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.area}</p>
                <p className="font-display text-lg text-copa-orange">{u.points}pts</p>
                <div className={`w-full ${podiumHeights[posIdx]} ${podiumColors[posIdx]} rounded-t-xl mt-2 border-t-4 ${podiumBorders[posIdx]} flex items-center justify-center`}>
                  <span className="font-display text-2xl text-foreground/80">{idx + 1}º</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Remaining */}
        <div className="space-y-2">
          {rest.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 bg-card rounded-xl p-4 shadow-card border ${
                currentUser?.id === u.id ? "border-copa-orange ring-2 ring-copa-orange/20" : "border-border"
              }`}
            >
              <span className="font-display text-lg text-muted-foreground w-8 text-center">{i + 4}º</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.area}</p>
              </div>
              <div className="flex items-center gap-1">
                <Medal size={16} className="text-copa-orange" />
                <span className="font-display text-copa-orange">{u.points}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
