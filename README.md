# 1ª Edição Halloween · Vini e Mavis

Site da festa, feito para o celular: **concurso de melhor fantasia** e **jogatina de Among Us** presencial, com salas em tempo real.

React + Vite, hospedado de graça na **Vercel**, com as salas no **Firebase Firestore** e login anônimo do **Firebase Authentication** (plano gratuito Spark).

## Como funciona a jogatina

1. Alguém toca em **Jogatina Among Us → Criar nova sala** e vira o anfitrião.
2. Os outros entram pelo código de 4 letras, pelo link (**Convidar**) ou pelo **QR code**. Até **15 jogadores** por sala.
3. Cada um coloca o nome e tira uma foto com a fantasia (câmera frontal ou traseira; dá para escolher uma foto da galeria).
4. O anfitrião ajusta as regras da rodada e toca em **Iniciar rodada** (a partir de 2 jogadores):
   - quantidade de impostores (1 a 3; o app limita conforme o número de jogadores);
   - reuniões de emergência por pessoa;
   - tempo de votação.
5. Cada celular mostra em segredo se a pessoa é **impostor** ou **tripulante** (impostores veem os comparsas). Depois disso o timer começa do zero e conta o tempo de rodada, igual em todos os celulares.
6. Tarefas e mortes são **presenciais**. No app, qualquer vivo pode:
   - **Convocar reunião de emergência**;
   - **Denunciar morte**, escolhendo quem foi encontrado morto.
7. Na reunião o timer pausa, todo mundo recebe o alerta (com vibração) e os vivos votam em quem expulsar ou pulam o voto. O mais votado é ejetado (empate ou “pular” não ejeta ninguém).
8. A rodada não tem duração fixa: acaba quando todos os impostores saem ou quando os impostores ficam em maioria. Por segurança, com **3 horas** de jogo ela é encerrada sem vencedor. O anfitrião volta todos para o lobby para a próxima.

Durante a rodada a tela fica acesa (Wake Lock) e o botão **Segure para ver seu papel** mostra o papel só enquanto o dedo está na tela.

## Como funciona o concurso de melhor fantasia

1. Alguém toca em **Concurso melhor fantasia → Criar sala de votação** e vira o anfitrião.
2. Os outros entram pelo código, pelo link ou pelo QR code (até **40 participantes**). Nome e **foto da fantasia são obrigatórios**.
3. Só o anfitrião vê o botão **Começar votação** (a partir de 2 pessoas). Todo mundo vê a animação com os participantes.
4. Cada um escolhe o **1º, 2º e 3º lugar**, sem aparecer a própria foto (com 3 pessoas vota-se no 1º e 2º, com 2 pessoas só no 1º). Vale 3, 2 e 1 ponto. Não tem tempo: quem já votou vê quem ainda falta, e o anfitrião pode **apurar agora** se alguém sumiu.
5. Quando todos votam, aparece a apuração e o **3º lugar** com suspense. O anfitrião avança para o **2º**, depois para o **1º** e por fim **revela os resultados**: pódio e quem votou em quem.
6. **Desativado por enquanto:** a etapa surpresa de fantasia em dupla fica escondida (`GROUP_CONTEST_ENABLED` em `src/features/contest-reveal/CostumeResults.tsx`). Quando ligada, no resultado, com pelo menos 4 participantes, o anfitrião tem o botão **Fantasia em dupla**: todos veem a surpresa, o anfitrião monta as duplas e trios (pode entrar em um), os grupos são revelados e cada um vota no melhor grupo (menos o próprio). Depois vem o campeão e quem votou em quem.

Empates: no individual, vence quem tem mais votos de 1º lugar e depois de 2º; se continuar empatado, os dois dividem o lugar. Nas duplas e trios, empate em votos divide o 1º lugar.

## Rodando localmente

Precisa do Node 20+ (a versão usada está em `.nvmrc`).

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

| Script            | O que faz                                          |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento                        |
| `npm run build`   | Checa tipos e gera a versão de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente                         |
| `npm test`        | Testes unitários (Vitest)                          |
| `npm run lint`    | ESLint                                             |
| `npm run format`  | Formata tudo com Prettier                          |

Sem configurar o Firebase, o site roda em **modo demonstração**: as salas ficam no `localStorage` e cada aba do navegador é um jogador diferente. Abra 3 abas para testar uma partida inteira.

A câmera só funciona em `https` ou em `localhost`. Para testar no celular, use o link da Vercel.

## Configurar o Firebase (gratuito)

1. Entre em <https://console.firebase.google.com> → **Adicionar projeto** (pode desativar o Google Analytics).
2. **Criação → Firestore Database → Criar banco de dados** → modo de produção → região `southamerica-east1` (São Paulo).
3. Na aba **Regras** do Firestore, cole o conteúdo de `firestore.rules` e publique.
4. **Criação → Authentication → Vamos começar → Método de login → Anônimo** → ativar.
5. **Configurações do projeto → Seus apps → Web (`</>`)** → registre o app e copie `apiKey`, `authDomain`, `projectId` e `appId`.
6. Copie `.env.example` para `.env.local` e preencha.

As fotos ficam comprimidas (320×320) dentro do próprio Firestore, então não precisa do Storage, que exige o plano pago.

O plano Spark dá 50 mil leituras e 20 mil gravações por dia. Cada ação na sala (entrar, votar, convocar reunião) é uma gravação lida por todos os celulares da sala: uma noite inteira de jogatina com 15 pessoas fica bem abaixo do limite.

## Publicar na Vercel (gratuito)

1. Em <https://vercel.com/new>, importe o repositório (a Vercel detecta Vite sozinha).
2. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`, marcando **Production** e **Preview** (sem o Preview, os deploys de teste rodam em modo demonstração). Em `VITE_SITE_URL`, coloque o endereço final (ex.: `https://halloween-vini-e-mavis.vercel.app`), usado na prévia do link no WhatsApp.
3. **Deploy**. A cada `git push` na `main`, a Vercel publica de novo.
4. Em **Analytics** e em **Speed Insights**, no painel do projeto, clique em **Enable**. O site já carrega os scripts da Vercel no build de produção; os dados aparecem depois das primeiras visitas (bloqueadores de anúncio escondem parte delas). As salas aparecem agrupadas como `/sala/[codigo]` e `/concurso/[codigo]`.

## Testar antes de publicar (preview)

Todo push numa branch diferente da `main` gera um deploy de **preview**, com URL própria (no painel da Vercel e no pull request), sem mexer no site oficial.

1. Crie a branch no padrão `flores/<tipo>/<descricao-em-kebab-case>` (ex.: `flores/feat/vercel-insights`) e faça o push.
2. Teste no celular pela URL de preview (é `https`, então a câmera funciona).
3. Abra o pull request para a `main`; o merge publica em produção.

Preview e produção usam o mesmo Firebase: as salas de teste ficam no mesmo banco, com códigos aleatórios que não se misturam, e as regras do Firestore valem para os dois. Por padrão a Vercel pede login nas URLs de preview (Deployment Protection); para testar no celular de outras pessoas, gere um link de compartilhamento do deploy.

## Arquitetura

Organizado por **features**: tudo de uma tela (componentes, regras de exibição e CSS) mora junto. Detalhes e regras de dependência em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

```
src/
├── app/        # inicialização, rotas e moldura do convite
├── features/   # uma pasta por tela
├── content/    # todos os textos do site
├── data/       # Firebase, regras do jogo e repositório das salas
├── shared/     # componentes, hooks e utilitários reaproveitados
└── styles/     # tokens de cor/fonte, base e componentes de UI globais
```

## Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/), só com o título e em inglês: `tipo(escopo): descrição`. Branches no padrão `flores/<tipo>/<descricao-em-kebab-case>`.
Tipos usados: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `ci`. Ex.: `feat(meeting): add voting timer`.

O GitHub Actions roda tipos, lint, formatação, testes e build a cada push na `main` e em pull requests.
