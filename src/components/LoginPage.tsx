import { useState } from 'react';
import { useApp } from '@/lib/context';
import { AREAS } from '@/lib/types';
import mascotYoshi from '@/assets/mascot-yoshi.png';
import logoCube from '@/assets/logo-cube.png';
import { motion } from 'framer-motion';
import { Lock, UserPlus, LogIn, Mail } from 'lucide-react';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  area: z.string().min(1, 'Selecione uma área'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export default function LoginPage() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    area: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const validated = signInSchema.parse(signInData);
      await signIn(validated.email, validated.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFeedback({
          type: 'error',
          message: error.errors[0].message,
        });
      } else {
        setFeedback({
          type: 'error',
          message: (error as Error).message || 'Erro ao fazer login',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const validated = signUpSchema.parse(signUpData);
      await signUp(validated.email, validated.password, validated.name, validated.area);
      setFeedback({
        type: 'success',
        message: 'Conta criada com sucesso! Você já está logado.',
      });
      // Reset form
      setSignUpData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        area: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFeedback({
          type: 'error',
          message: error.errors[0].message,
        });
      } else {
        setFeedback({
          type: 'error',
          message: (error as Error).message || 'Erro ao criar conta',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src={logoCube} alt="Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
          <h1 className="font-display text-3xl text-primary-foreground mb-2">
            BOLÃO COPA 2026
          </h1>
          <p className="text-primary-foreground/70 text-sm">
            {mode === 'signup' ? 'Crie sua conta para participar!' : 'Acesse sua conta'}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card">
          <div className="flex justify-center -mt-16 mb-4">
            <motion.img
              src={mascotYoshi}
              alt="Yoshi Mascote"
              className="h-24 w-24 object-cover object-top rounded-full border-4 border-copa-orange bg-card"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          <h2 className="font-display text-xl text-center text-foreground mb-6">
            {mode === 'signup' ? 'Criar Conta' : 'Entrar no Bolão'}
          </h2>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg text-sm text-center font-medium ${
                feedback.type === 'success'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  <Mail size={14} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData({ ...signInData, email: e.target.value })
                  }
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  <Lock size={14} className="inline mr-1" />
                  Senha
                </label>
                <input
                  type="password"
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  placeholder="Sua senha"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-fire text-accent-foreground font-display py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-lg shadow-glow flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={20} /> ENTRAR ⚽
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  value={signUpData.name}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, name: e.target.value })
                  }
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Área da EJ
                </label>
                <select
                  value={signUpData.area}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, area: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                >
                  <option value="">Selecione sua área</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  <Lock size={14} className="inline mr-1" />
                  Senha
                </label>
                <input
                  type="password"
                  value={signUpData.password}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, password: e.target.value })
                  }
                  placeholder="Sua senha (mín. 6 caracteres)"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  <Lock size={14} className="inline mr-1" />
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={signUpData.confirmPassword}
                  onChange={(e) =>
                    setSignUpData({
                      ...signUpData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirme sua senha"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copa-orange transition-shadow"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-fire text-accent-foreground font-display py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-lg shadow-glow flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} /> CADASTRAR ⚽
                  </>
                )}
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setFeedback(null);
              setSignInData({ email: '', password: '' });
              setSignUpData({
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                area: '',
              });
            }}
            disabled={isLoading}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors text-center"
          >
            {mode === 'signin'
              ? 'Não tenho conta → Criar'
              : 'Já tenho conta → Entrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
