# Design system — guia de cores e tipografia (Dark Neutral + Violet/Forest)

> Fundo neutro escuro (estilo interface do Claude), com **Violet** e **Forest Green** como cores de destaque (realce), não como fundo dominante.
> Fonte: Plus Jakarta Sans. Stack: Tailwind CSS.

---

## tailwind.config.js

Cole dentro de `theme.extend` (para referências legadas ou projetos baseados em config.js):

```js
fontFamily: {
  sans: ['"Plus Jakarta Sans"', 'sans-serif'],
},
fontSize: {
  'xs':   ['11px', { lineHeight: '1.5' }],
  'sm':   ['13px', { lineHeight: '1.5' }],
  'base': ['15px', { lineHeight: '1.7' }],
  'lg':   ['17px', { lineHeight: '1.6' }],
  'xl':   ['20px', { lineHeight: '1.4' }],
  '2xl':  ['24px', { lineHeight: '1.3' }],
  '3xl':  ['30px', { lineHeight: '1.2' }],
  '4xl':  ['38px', { lineHeight: '1.1' }],
},
colors: {
  brand: {
    DEFAULT: '#9B6DF0',
    light:   '#B594F5',
    lighter: '#4A3A6B',
    subtle:  '#251E38',
    dark:    '#7C4FE0',
    darker:  '#5A35A8',
  },
  accent: {
    DEFAULT: '#3F8F62',
    light:   '#5FAE7F',
    lighter: '#274A36',
    subtle:  '#16241C',
    dark:    '#2E6B48',
  },
  page:     '#1C1C1B',
  surface:  '#262624',
  surface2: '#302F2D',
  border:   '#3D3C39',
  body:     '#ECEBE8',
  muted:    '#9B9A94',
  success: '#4CAE7A',
  warning: '#D99A3D',
  error:   '#D65B6E',
},
```

> [!NOTE]
> Este projeto usa **Tailwind CSS v4**. Os valores acima estão declarados sob o bloco `@theme inline` dentro do arquivo [globals.css](file:///home/rebeca/Github/aliance-strategy/src/frontend/styles/globals.css).

### Import da fonte (HTML ou CSS global)

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&display=swap" rel="stylesheet">
```

Ou no CSS global (utilizado em `globals.css`):

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&display=swap');
```

---

## Tipografia

### Família
Plus Jakarta Sans — fonte única do projeto. Não misturar com outras famílias.

### Pesos
| Peso | Tailwind | Uso |
|---|---|---|
| 400 regular | `font-normal` | Parágrafos, labels, placeholders |
| 500 medium | `font-medium` | Headings, botões, badges, nav |

> Nunca usar `font-semibold` (600) ou `font-bold` (700).

### Escala

| Classe | Tamanho | Uso |
|---|---|---|
| `text-xs` | 11px | Metadados, tooltips, legendas |
| `text-sm` | 13px | Labels, badges, texto secundário |
| `text-base` | 15px | Corpo de texto principal |
| `text-lg` | 17px | Subtítulos, destaques |
| `text-xl` | 20px | Títulos de seção |
| `text-2xl` | 24px | Headings secundários |
| `text-3xl` | 30px | Headings principais |
| `text-4xl` | 38px | Hero / display |

---

## Filosofia da paleta

O fundo é **neutro cinza-escuro** (não roxo, não verde) — igual a interfaces tipo Claude, onde o background nunca briga com o conteúdo. **Violet** e **Forest Green** entram só como realce (ações, links, badges, estados), nunca como cor de fundo em larga escala.

- **Violet** → ação primária (botões principais, links ativos, foco)
- **Forest Green** → ação secundária / confirmação / destaque alternativo (badges, tags, estados positivos)
- Os dois nunca competem no mesmo elemento — um é sempre dominante por contexto (ex: botão primário = violet, badge de "concluído" = forest)

---

## Tokens e uso

### Neutros (fundo — a base de tudo)

| Token | Hex | Uso |
|---|---|---|
| `page` | `#1C1C1B` | Fundo da página (`<body>`) — cinza-escuro neutro |
| `surface` | `#262624` | Cards, modais, inputs, dropdowns |
| `surface2` | `#302F2D` | Elementos elevados sobre surface (hover, popover, header sticky) |
| `border` | `#3D3C39` | Divisores e bordas |
| `body` | `#ECEBE8` | Texto principal |
| `muted` | `#9B9A94` | Texto secundário, placeholders |

### Brand — Violet (realce primário)

| Token | Hex | Uso |
|---|---|---|
| `brand` | `#9B6DF0` | Botões primários, links ativos, foco, ícones de destaque |
| `brand-light` | `#B594F5` | Hover de botões e elementos interativos |
| `brand-lighter` | `#4A3A6B` | Bordas suaves, chips, badges sobre fundo escuro |
| `brand-subtle` | `#251E38` | Fundo de cards com contexto brand |
| `brand-dark` | `#7C4FE0` | Estado active/pressed |
| `brand-darker` | `#5A35A8` | Headings sobre `brand-subtle` |

### Accent — Forest Green (realce secundário)

| Token | Hex | Uso |
|---|---|---|
| `accent` | `#3F8F62` | Ações secundárias, ícones alternativos, tags |
| `accent-light` | `#5FAE7F` | Hover de elementos accent |
| `accent-lighter` | `#274A36` | Bordas suaves em contexto accent |
| `accent-subtle` | `#16241C` | Fundo de cards/badges com contexto accent |
| `accent-dark` | `#2E6B48` | Estado active/pressed em contexto accent |

### Funcionais

| Token | Hex | Uso |
|---|---|---|
| `success` | `#4CAE7A` | Confirmações, toasts de sucesso (próximo do accent, mas token separado p/ semântica) |
| `warning` | `#D99A3D` | Alertas e avisos |
| `error` | `#D65B6E` | Erros de formulário, estados destrutivos |

> `success` fica intencionalmente próximo de `accent` — ambos são "verdes" — mas são tokens diferentes: `accent` is decorativo/de marca, `success` is semântico de estado. Não substitua um pelo outro.

---

## Acessibilidade WCAG 2.1 (estimado)

| Combinação | Contraste aprox. | Nível |
|---|---|---|
| `#9B6DF0` (brand) sobre `#1C1C1B` (page) | ~7.0:1 | AA + AAA ✓ |
| `#3F8F62` (accent) sobre `#1C1C1B` (page) | ~4.7:1 | AA ✓ (texto normal) |
| `#ECEBE8` (body) sobre `#1C1C1B` (page) | ~14.5:1 | AA + AAA ✓ |
| `#9B9A94` (muted) sobre `#1C1C1B` (page) | ~6.2:1 | AA ✓ |
| `#1C1C1B` sobre `#9B6DF0` (texto em botão brand) | ~7.0:1 | AA + AAA ✓ |

> `accent` sobre `page` fica na faixa AA — evite usar em texto pequeno (abaixo de 13px); prefira `accent-light` (`#5FAE7F`) se precisar de texto fino sobre fundo escuro.

---

## Componentes de referência

### Botão primário (Violet)
```html
<button class="bg-brand text-page px-4 py-2 rounded-lg
               hover:bg-brand-light active:bg-brand-dark transition-colors">
  Confirmar
</button>
```

### Botão secundário (Forest Green)
```html
<button class="bg-accent text-page px-4 py-2 rounded-lg
               hover:bg-accent-light active:bg-accent-dark transition-colors">
  Aprovar
</button>
```

### Botão outline (neutro, com foco violet)
```html
<button class="border border-border text-body px-4 py-2 rounded-lg
               hover:bg-surface2 focus:ring-2 focus:ring-brand/40 transition-colors">
  Cancelar
</button>
```

### Card
```html
<div class="bg-surface border border-border rounded-xl p-6">
  <h2 class="text-body font-medium">Título</h2>
  <p class="text-muted text-sm">Descrição secundária</p>
</div>
```

### Badge — Violet
```html
<span class="bg-brand-subtle text-brand-light text-xs font-medium px-3 py-1 rounded-full">
  Novo
</span>
```

### Badge — Forest Green
```html
<span class="bg-accent-subtle text-accent-light text-xs font-medium px-3 py-1 rounded-full">
  Concluído
</span>
```

### Input com erro
```html
<input class="bg-surface border border-error rounded-lg px-3 py-2 text-body
              focus:outline-none focus:ring-2 focus:ring-error/30" />
<p class="text-error text-sm mt-1">Campo obrigatório</p>
```

### Layout raiz
```html
<body class="bg-page text-body">
```

---

## Regras rápidas

- Fundo de página → sempre `bg-page` (cinza-escuro neutro, nunca violet nem verde)
- Fundo de card → `bg-surface`; elementos elevados sobre card → `bg-surface2`
- Texto principal → sempre `text-body`, nunca `text-white`
- Texto secundário → sempre `text-muted`, nunca `text-gray-400`
- Bordas → sempre `border-border`
- **Violet é a cor de ação primária.** Use em botões principais, links, foco
- **Forest Green é realce secundário.** Use em ações alternativas, badges de sucesso/concluído, tags — nunca no mesmo botão que já usa violet
- Nunca colocar `bg-brand` and `bg-accent` lado a lado competindo pela mesma hierarquia visual (ex: dois botões de mesmo peso, cores diferentes, na mesma ação) — escolha um por vez
- Nunca usar cores nativas do Tailwind (`gray`, `purple`, `green`) — usar apenas os tokens acima
- Nunca usar cores arbitrárias como `text-[#9B6DF0]`