import { useApp } from "@/lib/context";
import { Game } from "@/lib/types";
import mascotYoshi from "@/assets/mascot-yoshi.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Target, ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";

function GameCard({ game }: { game: Game }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border hover:shadow-glow transition-shadow">
      <div className="text-xs text-muted-foreground mb-2 text-center font-semibold">
        {game.group} • {new Date(game.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – {game.time}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <span className="text-3xl">{game.flagA}</span>
          <p className="text-sm font-semibold text-foreground mt-1">{game.teamA}</p>
        </div>
        <div className="text-center px-3">
          {game.finished ? (
            <span className="font-display text-2xl text-foreground">{game.scoreA} - {game.scoreB}</span>
          ) : (
            <span className="font-display text-lg text-copa-orange">VS</span>
          )}
        </div>
        <div className="flex-1 text-center">
          <span className="text-3xl">{game.flagB}</span>
          <p className="text-sm font-semibold text-foreground mt-1">{game.teamB}</p>
        </div>
      </div>
      {game.finished && (
        <div className="mt-2 text-center">
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-semibold">Encerrado</span>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, users, games, comments, addComment, likeComment } = useApp();
  const [commentText, setCommentText] = useState("");

  const upcomingGames = games.filter(g => !g.finished).slice(0, 4);
  const recentResults = games.filter(g => g.finished).slice(0, 2);
  const topUsers = [...users].sort((a, b) => b.points - a.points).slice(0, 3);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(commentText.trim());
      setCommentText("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-hero py-12 px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container text-center relative z-10"
        >
          <motion.img
            src={mascotYoshi}
            alt="Yoshi Mascote"
            className="h-28 w-28 mx-auto mb-4 object-contain drop-shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
          <h1 className="font-display text-3xl md:text-5xl text-primary-foreground mb-3">
            BOLÃO COPA 2026 ⚽
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-6 max-w-lg mx-auto">
            Olá, <span className="text-copa-yellow font-bold">{user?.name}</span>! Faça seus palpites e domine o ranking.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/apostas" className="inline-flex items-center gap-2 bg-gradient-fire text-accent-foreground font-display px-6 py-3 rounded-xl shadow-glow hover:opacity-90 transition-opacity">
              <Target size={20} /> APOSTAR AGORA
            </Link>
            <Link to="/ranking" className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-display px-6 py-3 rounded-xl hover:bg-primary-foreground/20 transition-colors">
              <Trophy size={20} /> VER RANKING
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="container py-8 space-y-8">
        {/* Top 3 mini */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">🏆 Top 3</h2>
            <Link to="/ranking" className="text-copa-orange text-sm font-semibold flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {topUsers.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`text-center p-4 rounded-xl border ${
                  i === 0 ? "bg-copa-gold/10 border-copa-gold" :
                  i === 1 ? "bg-copa-silver/10 border-copa-silver" :
                  "bg-copa-bronze/10 border-copa-bronze"
                }`}
              >
                <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                <p className="font-bold text-sm text-foreground mt-1 truncate">{u.name}</p>
                <p className="text-copa-orange font-display text-lg">{u.points}pts</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Upcoming Games */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">📅 Próximos Jogos</h2>
            <Link to="/apostas" className="text-copa-orange text-sm font-semibold flex items-center gap-1 hover:underline">
              Apostar <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {upcomingGames.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GameCard game={g} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <section>
            <h2 className="font-display text-xl text-foreground mb-4">⚡ Resultados Recentes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {recentResults.map(g => <GameCard key={g.id} game={g} />)}
            </div>
          </section>
        )}

        {/* Memes / Comments */}
        <section>
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <MessageCircle size={22} className="text-copa-orange" /> Mural dos Líderes
          </h2>
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Deixe aqui seu comentário..."
              className="flex-1 px-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange"
            />
            <button type="submit" className="bg-gradient-fire text-accent-foreground px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Enviar
            </button>
          </form>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {comments.slice(0, 10).map(c => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl p-4 shadow-card border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-foreground">{c.userName}</span>
                  <button onClick={() => likeComment(c.id)} className="text-xs text-muted-foreground hover:text-copa-orange transition-colors">
                    ❤️ {c.likes}
                  </button>
                </div>
                <p className="text-sm text-foreground">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
