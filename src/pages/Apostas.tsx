import { useApp } from "@/lib/context";
import mascotYoshi from "@/assets/mascot-yoshi.png";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";

export default function ApostasPage() {
  const { games, placeBet, getBetForGame, user } = useApp();
  const [saved, setSaved] = useState<string | null>(null);
  const [betInputs, setBetInputs] = useState<Record<string, { a: string; b: string }>>({});

  const upcomingGames = games.filter(g => !g.finished);
  const pastGames = games.filter(g => g.finished);

  const handleBet = (gameId: string) => {
    const input = betInputs[gameId];
    if (!input || input.a === "" || input.b === "") return;
    placeBet(gameId, parseInt(input.a), parseInt(input.b));
    setSaved(gameId);
    setTimeout(() => setSaved(null), 1500);
  };

  const setInput = (gameId: string, team: "a" | "b", val: string) => {
    if (val !== "" && (isNaN(Number(val)) || Number(val) < 0)) return;
    setBetInputs(prev => ({ ...prev, [gameId]: { ...prev[gameId], [team]: val } }));
  };

  const getInput = (gameId: string) => {
    if (betInputs[gameId]) return betInputs[gameId];
    const existing = getBetForGame(gameId);
    if (existing) return { a: String(existing.scoreA), b: String(existing.scoreB) };
    return { a: "", b: "" };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-stadium py-8 px-4">
        <div className="container text-center">
          <h1 className="font-display text-2xl md:text-4xl text-primary-foreground">🎯 Apostas</h1>
          <p className="text-primary-foreground/70 mt-1">Preencha seu palpite para cada jogo</p>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Upcoming */}
        <section>
          <h2 className="font-display text-lg text-foreground mb-4">Jogos Abertos</h2>
          <div className="space-y-4">
            {upcomingGames.map((game, i) => {
              const input = getInput(game.id);
              const existingBet = getBetForGame(game.id);
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-5 shadow-card border border-border"
                >
                  <div className="text-xs text-muted-foreground text-center mb-3 font-semibold">
                    {game.group} • {new Date(game.date + 'T12:00:00').toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – {game.time}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center flex-1">
                      <span className="text-3xl">{game.flagA}</span>
                      <p className="text-sm font-bold text-foreground mt-1">{game.teamA}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={input.a}
                      onChange={e => setInput(game.id, "a", e.target.value)}
                      className="w-14 h-14 text-center text-xl font-display rounded-lg border-2 border-copa-orange bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange"
                      placeholder="0"
                    />
                    <span className="font-display text-copa-orange text-lg">X</span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={input.b}
                      onChange={e => setInput(game.id, "b", e.target.value)}
                      className="w-14 h-14 text-center text-xl font-display rounded-lg border-2 border-copa-orange bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange"
                      placeholder="0"
                    />
                    <div className="text-center flex-1">
                      <span className="text-3xl">{game.flagB}</span>
                      <p className="text-sm font-bold text-foreground mt-1">{game.teamB}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => handleBet(game.id)}
                      className="bg-gradient-fire text-accent-foreground font-display px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-glow text-sm"
                    >
                      {existingBet ? "ATUALIZAR" : "CONFIRMAR"} PALPITE
                    </button>
                  </div>
                  <AnimatePresence>
                    {saved === game.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center justify-center gap-2 text-primary font-semibold text-sm"
                      >
                        <motion.img
                          src={mascotYoshi}
                          alt="Yoshi"
                          className="h-10 w-10 object-contain"
                          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        />
                        <Check size={18} /> Palpite salvo!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Past games */}
        {pastGames.length > 0 && (
          <section>
            <h2 className="font-display text-lg text-foreground mb-4">Resultados</h2>
            <div className="space-y-3">
              {pastGames.map(game => {
                const bet = getBetForGame(game.id);
                const exactMatch = bet && bet.scoreA === game.scoreA && bet.scoreB === game.scoreB;
                const winnerMatch = bet && game.scoreA !== undefined && game.scoreB !== undefined && (
                  (bet.scoreA > bet.scoreB && game.scoreA > game.scoreB) ||
                  (bet.scoreA < bet.scoreB && game.scoreA < game.scoreB) ||
                  (bet.scoreA === bet.scoreB && game.scoreA === game.scoreB)
                );
                return (
                  <div key={game.id} className={`bg-card rounded-xl p-4 shadow-card border ${exactMatch ? "border-copa-gold ring-2 ring-copa-gold/30" : "border-border"}`}>
                    <div className="text-xs text-muted-foreground text-center mb-2 font-semibold">{game.group}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <span className="text-2xl">{game.flagA}</span>
                        <p className="text-xs font-bold text-foreground">{game.teamA}</p>
                      </div>
                      <div className="text-center">
                        <span className="font-display text-xl text-foreground">{game.scoreA} - {game.scoreB}</span>
                      </div>
                      <div className="text-center flex-1">
                        <span className="text-2xl">{game.flagB}</span>
                        <p className="text-xs font-bold text-foreground">{game.teamB}</p>
                      </div>
                    </div>
                    {bet && (
                      <div className="mt-3 text-center text-xs">
                        <span className="text-muted-foreground">Seu palpite: {bet.scoreA} x {bet.scoreB}</span>
                        {exactMatch ? (
                          <span className="ml-2 bg-copa-gold/20 text-copa-gold px-2 py-0.5 rounded-full font-bold">+5 EXATO! 🎯</span>
                        ) : (
                          <span className="ml-2 text-destructive font-bold">Errou 😢</span>
                        )}
                      </div>
                    )}
                    {exactMatch && (
                      <motion.img
                        src={mascotYoshi}
                        alt="Yoshi comemorando"
                        className="h-12 w-12 mx-auto mt-2 object-contain"
                        animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
