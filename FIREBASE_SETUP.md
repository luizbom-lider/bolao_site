# Próximas Etapas: Configurar Firebase Console

## Fase 1 ✅ CONCLUÍDA

Todos os arquivos locais foram criados e o projeto compila com sucesso:

✅ Firebase SDK instalado
✅ Configuração local criada (`/src/config/firebase.ts`)
✅ Serviços de Autenticação (`/src/services/authService.ts`)
✅ Serviços de Firestore (`/src/services/firestoreService.ts`)
✅ Hook de autenticação (`/src/hooks/useAuth.ts`)
✅ Contexto atualizado com Firebase (`/src/lib/context.tsx`)
✅ Login page com email/senha (`/src/components/LoginPage.tsx`)
✅ App.tsx com loading state
✅ Build passou sem erros

---

## Fase 2: CONFIGURAR FIREBASE CONSOLE

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Add Project" (Adicionar Projeto)
3. Nome do projeto: `Site do Bolao`
4. Próximos passos mantém as opções padrão
5. Clique em "Create Project"

### Passo 2: Habilitar Firebase Authentication

1. No Firebase Console, abra seu projeto
2. Vá para **Authentication** (no menu esquerdo)
3. Clique em "Get Started"
4. Na aba "Sign-in method", clique em "Email/Password"
5. Habilite "Email/Password" e clique "Save"

### Passo 3: Criar Firestore Database

1. Vá para **Firestore Database** (no menu esquerdo)
2. Clique "Create Database"
3. **Localização:** Selecione a mais próxima (ex: `nam5` para EUA)
4. **Modo de segurança:** Selecione "Start in production mode"
5. Clique "Create"

### Passo 4: Configurar Firestore Security Rules

1. No Firestore, vá para aba **Rules**
2. Cole as regras abaixo:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: verifica se o usuário é admin
    function isAdmin() {
      return request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      // Usuário pode editar seu próprio doc, mas NÃO pode mudar isAdmin
      allow update: if request.auth.uid == userId 
        && (!('isAdmin' in request.resource.data) 
            || request.resource.data.isAdmin == resource.data.isAdmin);
      allow create: if request.auth.uid == userId;
      // Admins podem editar/deletar qualquer user (inclusive isAdmin)
      allow update, delete: if isAdmin();
    }
    
    // Games - todos leem, admins escrevem
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Bets - todos leem, users criam/editam suas próprias
    match /bets/{betId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Comments - authenticated users podem ler/escrever
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if isAdmin();
    }
  }
}
```

5. Clique "Publish"

### Passo 5: Pegar Credenciais do Firebase

1. Clique no ícone de engrenagem ⚙️ (canto superior esquerdo)
2. Vá para "Project settings"
3. Procure por "Web" e clique nele (ou adicione um novo app web)
4. Você verá um objeto com as credenciais:

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "projeto.firebaseapp.com",
  projectId: "projeto-12345",
  storageBucket: "projeto-12345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
}
```

### Passo 6: Preencher Variáveis de Ambiente

1. Na raiz do projeto, crie o arquivo `.env.local`:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projeto-12345
VITE_FIREBASE_STORAGE_BUCKET=projeto-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef...
```

2. Não commit este arquivo! (já está em `.gitignore`)

### Passo 7: Testar Localmente

1. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

2. Testes a fazer:
   - ✓ Criar nova conta com email/senha
   - ✓ Login com credenciais criadas
   - ✓ Ver dados persistindo (refresh da página)
   - ✓ Logout funciona
   - ✓ Tentar login com email errado
   - ✓ Tentar login com senha errada
   - ✓ Verificar que Firebase faz persistência automática

### Passo 8: Deploy na Vercel

1. Conecte seu repositório GitHub à Vercel
2. Importe o projeto
3. Em "Environment Variables", adicione as 6 variáveis do `.env.local`
4. Clique "Deploy"
5. Após deploy, configure Custom Domain ou use `*.vercel.app`

### Passo 9: Atualizar Firebase com URL de Produção

1. No Firebase Console, vá para **Settings > Authorized domains**
2. Adicione sua URL da Vercel (ex: `seu-app.vercel.app`)
3. Salve

---

## IMPORTANTE

⚠️ **Nunca commitar credenciais!**
- `.env.local` já está em `.gitignore`
- Mantenha `.env.example` como referência
- Cada dev tem suas próprias credenciais em `.env.local`

⚠️ **Firestore Security Rules**
- As regras acima são básicas
- Admin era manual (precisa ser implementado com custom claims depois)
- Ajuste conforme necessário

⚠️ **Testes**
- Depois de conectar ao Firebase, teste cada funcionalidade
- Se erro, verifique console do browser e Firebase Logs

---

## Estrutura de Dados no Firestore

Após criar as coleções, a estrutura será:

```
/users/{uid}
  - name: string
  - email: string
  - area: string
  - points: number
  - badges: Badge[]
  - approved: boolean
  - isAdmin: boolean  // ← NOVO: define se é administrador
  - consecutiveExact: number

/games/{gameId}
  - teamA, teamB: string
  - date, time: string
  - scoreA?, scoreB?: number
  - finished: boolean

/bets/{betId}
  - gameId: string
  - userId: string
  - scoreA, scoreB: number

/comments/{commentId}
  - userId: string
  - userName: string
  - text: string
  - likes: number
```

---

## Próximas Melhorias (Futuro)

- [x] Implementar admin com Firestore (campo isAdmin)
- [ ] Adicionar Firestore backup automático
- [ ] Integrar Firebase Analytics
- [ ] Adicionar recuperação de senha
- [ ] Social login (Google, GitHub)
- [ ] Avatar do usuário via Firebase Storage
- [ ] Migrar para Firebase Custom Claims (requer plano Blaze)

---

**Dúvidas?** Verifique os logs do Firebase Console ou do browser DevTools.
