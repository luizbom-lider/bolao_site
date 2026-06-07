import { useState } from "react";
import { useApp } from "@/lib/context";
import { Game } from "@/lib/types";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Check, Lock, LogOut, Trophy, Medal, UserCheck, UserX, Users, X } from "lucide-react";
import { toast } from "sonner";

function AdminLogin() {
  const { loginAdmin } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginAdmin(password)) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card rounded-2xl p-8 shadow-card border border-border"
      >
        <div className="text-center mb-6">
          <Lock className="mx-auto h-12 w-12 text-copa-orange mb-3" />
          <h1 className="font-display text-2xl text-foreground">Painel Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Digite a senha de administrador</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha"
            className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-all ${error ? "border-destructive ring-2 ring-destructive/30" : "border-input"}`}
          />
          {error && <p className="text-destructive text-sm text-center">Senha incorreta</p>}
          <button type="submit" className="w-full bg-gradient-fire text-accent-foreground font-display py-3 rounded-lg hover:opacity-90 transition-opacity shadow-glow">
            ENTRAR
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function GameForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Game;
  onSave: (data: Omit<Game, "id">) => void;
  onCancel: () => void;
}) {
  const [teamA, setTeamA] = useState(initial?.teamA || "");
  const [teamB, setTeamB] = useState(initial?.teamB || "");
  const [flagA, setFlagA] = useState(initial?.flagA || "");
  const [flagB, setFlagB] = useState(initial?.flagB || "");
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.time || "");
  const [group, setGroup] = useState(initial?.group || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !date || !time || !group) return;
    onSave({
      teamA, teamB,
      flagA: flagA || "🏳️", flagB: flagB || "🏳️",
      date, time, group,
      finished: initial?.finished || false,
      scoreA: initial?.scoreA,
      scoreB: initial?.scoreB,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-5 border border-border shadow-card space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Time A</label>
          <input value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="Brasil" required
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Time B</label>
          <input value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="Alemanha" required
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Bandeira A (emoji)</label>
          <input value={flagA} onChange={e => setFlagA(e.target.value)} placeholder="🇧🇷"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Bandeira B (emoji)</label>
          <input value={flagB} onChange={e => setFlagB(e.target.value)} placeholder="🇩🇪"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Horário</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">Grupo / Fase</label>
        <input value={group} onChange={e => setGroup(e.target.value)} placeholder="Grupo A / Oitavas" required
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-copa-orange" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-gradient-fire text-accent-foreground font-display py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
          {initial ? "SALVAR" : "CRIAR JOGO"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-input text-muted-foreground text-sm hover:bg-muted transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ResultForm({ game, onSave }: { game: Game; onSave: (scoreA: number, scoreB: number) => void }) {
  const [scoreA, setScoreA] = useState(game.scoreA?.toString() || "");
  const [scoreB, setScoreB] = useState(game.scoreB?.toString() || "");

  return (
    <div className="flex items-center gap-2 mt-3">
      <input
        type="number" min="0" max="99" value={scoreA}
        onChange={e => setScoreA(e.target.value)}
        className="w-12 h-10 text-center rounded-lg border-2 border-copa-orange bg-background text-foreground font-display focus:outline-none focus:ring-2 focus:ring-copa-orange"
        placeholder="0"
      />
      <span className="font-display text-muted-foreground">X</span>
      <input
        type="number" min="0" max="99" value={scoreB}
        onChange={e => setScoreB(e.target.value)}
        className="w-12 h-10 text-center rounded-lg border-2 border-copa-orange bg-background text-foreground font-display focus:outline-none focus:ring-2 focus:ring-copa-orange"
        placeholder="0"
      />
      <button
        onClick={() => {
          if (scoreA !== "" && scoreB !== "") onSave(parseInt(scoreA), parseInt(scoreB));
        }}
        className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1"
      >
        <Check size={14} /> Salvar
      </button>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, games, users, bets, logoutAdmin, addGame, updateGame, deleteGame, setGameResult, approveUser, rejectUser, pendingUsers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [tab, setTab] = useState<"games" | "ranking" | "users">("games");

  if (!isAdmin) return <AdminLogin />;

  const sorted = [...users].sort((a, b) => b.points - a.points);
  const upcomingGames = games.filter(g => !g.finished);
  const finishedGames = games.filter(g => g.finished);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-stadium py-6 px-4">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-primary-foreground">⚙️ Painel Admin</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Gerencie jogos, resultados e ranking</p>
          </div>
          <button onClick={logoutAdmin} className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
            <LogOut size={18} /> Sair do Admin
          </button>
        </div>
      </div>

      <div className="container py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("games")}
            className={`px-4 py-2 rounded-lg font-display text-sm transition-all ${tab === "games" ? "bg-gradient-fire text-accent-foreground shadow-glow" : "bg-card border border-border text-foreground hover:bg-muted"}`}
          >
            Jogos ({games.length})
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`px-4 py-2 rounded-lg font-display text-sm transition-all ${tab === "ranking" ? "bg-gradient-fire text-accent-foreground shadow-glow" : "bg-card border border-border text-foreground hover:bg-muted"}`}
          >
            <Trophy size={14} className="inline mr-1" /> Ranking
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg font-display text-sm transition-all relative ${tab === "users" ? "bg-gradient-fire text-accent-foreground shadow-glow" : "bg-card border border-border text-foreground hover:bg-muted"}`}
          >
            <Users size={14} className="inline mr-1" /> Usuários
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </div>

        {tab === "games" && (
          <div className="space-y-6">
            {/* Add Game */}
            {!showForm && !editingGame && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-card border-2 border-dashed border-copa-orange/40 text-copa-orange rounded-xl p-4 flex items-center justify-center gap-2 font-display hover:border-copa-orange hover:bg-copa-orange/5 transition-all"
              >
                <Plus size={20} /> CADASTRAR NOVO JOGO
              </button>
            )}

            {showForm && (
              <GameForm
                onSave={(data) => {
                  addGame(data);
                  setShowForm(false);
                  toast.success("Jogo cadastrado com sucesso!");
                }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {editingGame && (
              <GameForm
                initial={editingGame}
                onSave={(data) => {
                  updateGame(editingGame.id, data);
                  setEditingGame(null);
                  toast.success("Jogo atualizado!");
                }}
                onCancel={() => setEditingGame(null)}
              />
            )}

            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <section>
                <h2 className="font-display text-lg text-foreground mb-3">Jogos Pendentes ({upcomingGames.length})</h2>
                <div className="space-y-3">
                  {upcomingGames.map(game => {
                    const gameBets = bets.filter(b => b.gameId === game.id);
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl p-4 border border-border shadow-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-semibold">
                            {game.group} • {new Date(game.date).toLocaleDateString("pt-BR")} – {game.time}
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => setEditingGame(game)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => { deleteGame(game.id); toast.success("Jogo removido!"); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-center flex-1">
                            <span className="text-2xl">{game.flagA}</span>
                            <p className="text-sm font-bold text-foreground">{game.teamA}</p>
                          </div>
                          <span className="font-display text-copa-orange">VS</span>
                          <div className="text-center flex-1">
                            <span className="text-2xl">{game.flagB}</span>
                            <p className="text-sm font-bold text-foreground">{game.teamB}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground text-center">
                          {gameBets.length} palpite(s) registrado(s)
                        </div>
                        <div className="border-t border-border mt-3 pt-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Inserir Resultado:</p>
                          <ResultForm game={game} onSave={(sA, sB) => {
                            setGameResult(game.id, sA, sB);
                            toast.success("Resultado inserido e pontuações atualizadas!");
                          }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Finished Games */}
            {finishedGames.length > 0 && (
              <section>
                <h2 className="font-display text-lg text-foreground mb-3">Jogos Encerrados ({finishedGames.length})</h2>
                <div className="space-y-3">
                  {finishedGames.map(game => (
                    <div key={game.id} className="bg-card rounded-xl p-4 border border-border shadow-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-semibold">{game.group}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingGame(game)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center flex-1">
                          <span className="text-2xl">{game.flagA}</span>
                          <p className="text-sm font-bold text-foreground">{game.teamA}</p>
                        </div>
                        <span className="font-display text-xl text-foreground">{game.scoreA} - {game.scoreB}</span>
                        <div className="text-center flex-1">
                          <span className="text-2xl">{game.flagB}</span>
                          <p className="text-sm font-bold text-foreground">{game.teamB}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-semibold">Encerrado ✓</span>
                      </div>
                      {/* Allow updating result */}
                      <div className="border-t border-border mt-3 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Atualizar Resultado:</p>
                        <ResultForm game={game} onSave={(sA, sB) => {
                          setGameResult(game.id, sA, sB);
                          toast.success("Resultado atualizado e pontuações recalculadas!");
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "ranking" && (
          <div className="space-y-2">
            {sorted.map((u, i) => (
              <div key={u.id} className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card border border-border">
                <span className="font-display text-lg text-muted-foreground w-8 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.area}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Medal size={16} className="text-copa-orange" />
                  <span className="font-display text-copa-orange">{u.points}pts</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-6">
            {/* Pending Users */}
            <section>
              <h2 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
                <UserCheck size={18} className="text-copa-orange" />
                Aprovações Pendentes ({pendingUsers.length})
              </h2>
              {pendingUsers.length === 0 ? (
                <div className="bg-card rounded-xl p-6 border border-border shadow-card text-center">
                  <p className="text-muted-foreground text-sm">Nenhum usuário aguardando aprovação.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingUsers.map(u => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.area}</p>
                      </div>
                      <button
                        onClick={() => { approveUser(u.id); toast.success(`${u.name} aprovado!`); }}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Aprovar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => { rejectUser(u.id); toast.success(`${u.name} removido.`); }}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        title="Recusar"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* All Approved Users */}
            <section>
              <h2 className="font-display text-lg text-foreground mb-3">Usuários Ativos ({users.filter(u => u.approved).length})</h2>
              <div className="space-y-2">
                {users.filter(u => u.approved).map(u => (
                  <div key={u.id} className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border shadow-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.area} • {u.points}pts</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">Ativo ✓</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
