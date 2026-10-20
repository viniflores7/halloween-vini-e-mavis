# Arquitetura

SPA em React + Vite, sem servidor próprio. A Vercel serve os arquivos estáticos e o navegador conversa direto com o Firebase. Cada celular entra com login anônimo, e o `uid` identifica o jogador. As regras em `firestore.rules` protegem os dados.

```
Navegador ──► Vercel (HTML, JS, CSS, moldura)
    │
    └──────► Firebase
               ├─ Authentication: login anônimo (um uid por celular)
               └─ Firestore: rooms/{código}, rooms/{código}/players/{uid}, clocks/{uid}
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
│   ├── costume-contest/     # Concurso de melhor fantasia (em breve)
│   ├── room-entry/          # Criar sala ou entrar com o código
│   ├── game/                # /sala/:código: escuta a sala e escolhe a tela da fase atual
│   ├── player-setup/        # Nome e foto (câmera)
│   ├── lobby/               # Código, convite, QR code, jogadores e regras da rodada
│   ├── round/               # Revelação do papel, timer, emergência e denúncia
│   ├── meeting/             # Alerta, votação e resultado da ejeção
│   └── round-end/           # Vitória e quem eram os impostores
│
├── content/                 # Textos editáveis, sem lógica
├── data/                    # Acesso a dados
│   ├── firebase.ts          # Inicialização e detecção do modo demonstração
│   ├── rooms/               # Tipos, regras do jogo, timer e repositório das salas
│   └── demo/                # Banco em localStorage para o modo demonstração
│
├── shared/                  # Reaproveitável e sem regra de negócio
│   ├── components/          # Modal, Overlay, Avatar, Crewmate, ícones
│   ├── hooks/               # useNow, useWakeLock, useAsyncAction, useCopyToClipboard
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
- Uma feature não importa arquivos internos de outra, só o `index.ts` dela (ex.: `@/features/lobby`). Só a `game` compõe as outras telas da partida.
- Componentes não falam com o Firebase diretamente: sempre via `getRoomRepository()`.
- Imports entre pastas usam o alias `@/`. O ESLint bloqueia caminhos relativos do tipo `../outra-pasta/...`.

## Regras do jogo e repositório

Toda a lógica da partida está em `data/rooms/gameRules.ts`, em funções puras que recebem a sala e devolvem a sala nova (ou lançam `GameRuleError`): entrar, sortear impostores, convocar reunião, votar, encerrar votação, fim do tempo. O timer está em `data/rooms/roundTimer.ts`.

`roomRepository.ts` aplica essas funções sobre um `RoomStore`, que só sabe ler e gravar:

| Implementação        | Quando é usada                                              |
| -------------------- | ----------------------------------------------------------- |
| `firestoreRoomStore` | Variáveis `VITE_FIREBASE_*` preenchidas                     |
| `demoRoomStore`      | Sem Firebase: salas no `localStorage`, uma aba = um jogador |

No Firestore cada mudança roda numa transação, então votos simultâneos não se perdem. `lazyRepository` carrega o SDK do Firebase só quando ele está configurado.

## Sincronização

- **Tempo real**: cada celular escuta o documento da sala e a lista de jogadores (`onSnapshot`).
- **Timer igual em todos**: a sala guarda o início da rodada e as pausas; cada celular calcula o tempo restante. Na entrada, o celular grava `clocks/{uid}` com o horário do servidor para corrigir a diferença do relógio dele.
- **Avanço automático**: quando o tempo da rodada ou da votação acaba, o anfitrião grava a mudança na hora. Se ele estiver offline, os outros celulares assumem alguns segundos depois. A transação garante que só a primeira gravação vale.

## Segurança

As regras do Firestore garantem que só o anfitrião muda as configurações, que ninguém entra com a partida em andamento nem passa de 15 jogadores, e que cada um só edita o próprio perfil. Os papéis da rodada ficam no documento da sala e a tela não mostra o papel dos outros. Quem abrir as ferramentas de desenvolvedor do navegador consegue ver os papéis: é uma brincadeira de festa, não um cassino.

## Estilos

- Cores, fontes e a espessura da moldura são variáveis CSS em `styles/tokens.css`.
- A moldura é a imagem do convite (`public/ornamentos/moldura.webp`) aplicada com `border-image`: os cantos ficam intactos e as laterais se repetem para caber em qualquer altura de tela.
- Telas cheias (revelação do papel, alerta de reunião, resultado) e modais usam `Overlay`, que renderiza no `body`, fora da área com rolagem.
- Cada feature/componente importa o próprio `.css`, com classes no padrão BEM (`bloco__elemento--modificador`).

## Testes

Vitest, ao lado do arquivo testado (`*.test.ts`). O foco é a regra de negócio pura: limite de jogadores, sorteio, reuniões, votação, ejeção, vitória, timer com pausas e códigos de sala.
