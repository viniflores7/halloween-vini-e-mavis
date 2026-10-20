# Arquitetura

SPA em React + Vite, sem servidor próprio. A Vercel serve os arquivos estáticos e o navegador conversa direto com o Firebase. Cada celular entra com login anônimo, e o `uid` identifica o jogador. As regras em `firestore.rules` protegem os dados.

```
Navegador ──► Vercel (HTML, JS, CSS, moldura)
    │
    └──────► Firebase
               ├─ Authentication: login anônimo (um uid por celular)
               └─ Firestore: rooms/{código} (Among Us), contests/{código} (concurso),
                             .../players/{uid} em cada um, clocks/{uid}
```

## Pastas

```
src/
├── app/                     # Composição da aplicação
│   ├── main.tsx             # Ponto de entrada (carrega estilos globais primeiro)
│   ├── App.tsx              # Roteador
│   ├── AppRoutes.tsx        # Tabela de rotas
│   └── layout/              # Moldura ornamental e área com rolagem
│
├── features/                # Uma pasta por tela
│   ├── home/                # Convite e as duas opções
│   ├── room-entry/          # Criar sala ou entrar com o código (Among Us e concurso)
│   ├── room-gate/           # Carregando, sala não encontrada/cheia, entrada com nome e foto
│   ├── room-share/          # Código da sala, convite e QR code
│   ├── participants/        # Grade de jogadores com anfitrião e remover
│   ├── player-setup/        # Nome e foto (câmera)
│   │
│   ├── game/                # /sala/:código: escolhe a tela da fase do Among Us
│   ├── lobby/               # Regras da rodada e botão de iniciar
│   ├── round/               # Revelação do papel, timer, emergência e denúncia
│   ├── meeting/             # Alerta, votação e resultado da ejeção
│   ├── round-end/           # Vitória e quem eram os impostores
│   │
│   ├── contest/             # /concurso/:código: lobby e escolha da tela de cada etapa
│   ├── costume-voting/      # Desfile dos participantes, voto 1º/2º/3º e quem falta votar
│   ├── contest-reveal/      # Apuração, suspense, pódio e quem votou em quem
│   └── group-contest/       # Surpresa, montagem e votação das duplas e trios
│
├── content/                 # Textos editáveis, sem lógica
├── data/                    # Acesso a dados
│   ├── firebase.ts          # Inicialização e detecção do modo demonstração
│   ├── realtime/            # Base das salas: login anônimo, relógio, jogadores, código da sala
│   ├── rooms/               # Among Us: regras do jogo, timer e repositório
│   ├── contests/            # Concurso: regras da votação, pontuação, tempos das animações
│   └── demo/                # Banco em localStorage para o modo demonstração
│
├── shared/                  # Reaproveitável e sem regra de negócio
│   ├── components/          # Modal, Overlay, Avatar, Crewmate, Parade, Confetti, ícones
│   ├── hooks/               # useLiveSnapshot, useNow, useWakeLock, useAsyncAction
│   └── lib/                 # localStorage, foto, alarme
│
└── styles/                  # tokens.css (cores, fontes, moldura), base.css, ui.css
```

Cada feature expõe só o necessário pelo seu `index.ts`. Componentes internos ficam privados à pasta.

## Regras de dependência

```
app ──► features ──► shared
           │   └───► content
           └───────► data ──► shared/lib
```

- `shared` não importa de `features`, `data` nem `content`.
- Uma feature não importa arquivos internos de outra, só o `index.ts` dela (ex.: `@/features/lobby`). `game` e `contest` compõem as telas de cada modo.
- Componentes não falam com o Firebase diretamente: sempre via `getRoomRepository()` ou `getContestRepository()`.
- Imports entre pastas usam o alias `@/`. O ESLint bloqueia caminhos relativos do tipo `../outra-pasta/...`.

## Regras e repositórios

Toda a lógica fica em funções puras que recebem o documento e devolvem o documento novo (ou lançam um erro com o motivo):

- `data/rooms/gameRules.ts`: entrar, sortear impostores, convocar reunião, votar, encerrar votação, limite de 3 horas. O timer está em `roundTimer.ts`.
- `data/contests/contestRules.ts`: entrar, começar, votar 1º/2º/3º, apurar, avançar a revelação, montar e votar os grupos. A pontuação e os desempates estão em `ranking.ts`, e os tempos das animações em `timing.ts`.

`roomRepository.ts` e `contestRepository.ts` aplicam essas funções sobre um `LiveStore` de `data/realtime`, que só sabe ler e gravar uma sala com jogadores:

| Implementação    | Quando é usada                                              |
| ---------------- | ----------------------------------------------------------- |
| `firestoreStore` | Variáveis `VITE_FIREBASE_*` preenchidas                     |
| `demoStore`      | Sem Firebase: salas no `localStorage`, uma aba = um jogador |

No Firestore cada mudança roda numa transação, então votos simultâneos não se perdem. O Firestore não aceita lista dentro de lista, por isso os grupos do concurso são gravados como `{ members: [...] }`. `lazyRepository` carrega o SDK do Firebase só quando ele está configurado.

## Sincronização

- **Tempo real**: cada celular escuta o documento da sala e a lista de jogadores (`onSnapshot`).
- **Timer igual em todos**: a sala guarda o início da rodada e as pausas das reuniões; cada celular calcula o tempo de rodada. Na entrada, o celular grava `clocks/{uid}` com o horário do servidor para corrigir a diferença do relógio dele.
- **Avanço automático**: quando a votação ou o limite de 3 horas vence, o anfitrião grava a mudança na hora. Se ele estiver offline, os outros celulares assumem alguns segundos depois. A transação garante que só a primeira gravação vale.
- **Animações do concurso**: a etapa guarda o horário em que começou (`stageAt`). Desfile, apuração e suspense são calculados a partir dele, então todo mundo vê a mesma coisa ao mesmo tempo, inclusive quem recarrega a página no meio. Só o anfitrião avança a revelação.

## Segurança

As regras do Firestore garantem que só o anfitrião muda as configurações, começa o concurso e monta os grupos, que ninguém entra com a partida ou a votação em andamento nem passa do limite da sala (15 no Among Us, 40 no concurso), que no concurso a foto é obrigatória e que cada um só edita o próprio perfil. Os papéis da rodada ficam no documento da sala e a tela não mostra o papel dos outros. Quem abrir as ferramentas de desenvolvedor do navegador consegue ver os papéis: é uma brincadeira de festa, não um cassino.

## Estilos

- Cores, fontes e a espessura da moldura são variáveis CSS em `styles/tokens.css`.
- A moldura é a imagem do convite (`public/ornamentos/moldura.webp`) aplicada com `border-image`: os cantos ficam intactos e as laterais se repetem para caber em qualquer altura de tela.
- Telas cheias (revelação do papel, alerta de reunião, desfile, apuração, pódio) e modais usam `Overlay`, que renderiza no `body`, fora da área com rolagem. `.spotlight` (em `ui.css`) é o fundo escuro com holofote dessas telas.
- Cada feature/componente importa o próprio `.css`, com classes no padrão BEM (`bloco__elemento--modificador`).

## Testes

Vitest, ao lado do arquivo testado (`*.test.ts`). O foco é a regra de negócio pura: limite de jogadores, sorteio, reuniões, votação, ejeção, vitória, timer com pausas, códigos de sala e, no concurso, votos válidos, pontuação, desempate, revelação e duplas/trios.
