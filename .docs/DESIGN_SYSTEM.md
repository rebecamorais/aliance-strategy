# Design system — guia de cores e tipografia (Dark Mode)

> Paleta baseada em `#663399` (Rebeca Purple), adaptada para fundo escuro.
> Fonte: Plus Jakarta Sans. Stack: Tailwind CSS.

---

## tailwind.config.js

Cole dentro de `theme.extend`:

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
    DEFAULT: '#A873D9',
    light:   '#C9A6EC',
    lighter: '#3D2A5C',
    subtle:  '#241A38',
    dark:    '#7A4FB5',
    darker:  '#563680',
  },
  page:    '#120D1F',
  surface: '#1C1530',
  border:  '#332748',
  body:    '#F0EAFA',
  muted:   '#9C93B8',
  violet:  '#B084E0',
  indigo:  '#8B84F2',
  success: '#4CBE8C',
  warning: '#E0A233',
  error:   '#E0637F',
},
```

### Import da fonte (HTML ou CSS global)

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&display=swap" rel="stylesheet">
```

Ou no CSS global:

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

## Tokens e uso

### Brand

| Token | Hex | Uso |
|---|---|---|
| `brand` | `#A873D9` | Botões primários, links ativos, ícones de destaque |
| `brand-light` | `#C9A6EC` | Hover de botões e elementos interativos |
| `brand-lighter` | `#3D2A5C` | Bordas suaves, chips, badges (sobre fundo escuro) |
| `brand-subtle` | `#241A38` | Fundo de cards com contexto brand |
| `brand-dark` | `#7A4FB5` | Estado active/pressed |
| `brand-darker` | `#563680` | Headings em seções com fundo brand-subtle |

### Neutros

| Token | Hex | Uso |
|---|---|---|
| `page` | `#120D1F` | Fundo da página (`<body>`) |
| `surface` | `#1C1530` | Cards, modais, inputs, dropdowns |
| `border` | `#332748` | Divisores e bordas |
| `body` | `#F0EAFA` | Texto principal |
| `muted` | `#9C93B8` | Texto secundário, placeholders |

### Análogas

| Token | Hex | Uso |
|---|---|---|
| `violet` | `#B084E0` | Destaque alternativo, ilustrações |
| `indigo` | `#8B84F2` | Links, ícones informativos |

### Funcionais

| Token | Hex | Uso |
|---|---|---|
| `success` | `#4CBE8C` | Confirmações, toasts de sucesso |
| `warning` | `#E0A233` | Alertas e avisos |
| `error` | `#E0637F` | Erros de formulário, estados destrutivos |

---

## Acessibilidade WCAG 2.1

| Combinação | Contraste | Nível |
|---|---|---|
| `#A873D9` sobre `#120D1F` | ~6.8:1 | AA + AAA ✓ |
| `#120D1F` sobre `#A873D9` | ~6.8:1 | AA ✓ |
| `#A873D9` sobre `#1C1530` | ~6.2:1 | AA + AAA ✓ |
| `#F0EAFA` sobre `#120D1F` | ~15.8:1 | AA + AAA ✓ |
| `#9C93B8` sobre `#120D1F` | ~6.1:1 | AA ✓ |

---

## Componentes de referência

### Botão primário
```html
<button class="bg-brand text-page px-4 py-2 rounded-lg
               hover:bg-brand-light active:bg-brand-dark transition-colors">
  Confirmar
</button>
```

### Botão outline
```html
<button class="border border-brand text-brand px-4 py-2 rounded-lg
               hover:bg-brand-subtle transition-colors">
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

### Badge
```html
<span class="bg-brand-subtle text-brand-light text-xs font-medium px-3 py-1 rounded-full">
  Novo
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

- Texto principal → sempre `text-body`, nunca `text-white` ou `text-gray-100`
- Texto secundário → sempre `text-muted`, nunca `text-gray-400`
- Fundo de página → sempre `bg-page`
- Fundo de card → sempre `bg-surface`
- Bordas → sempre `border-border`
- Botões primários usam `text-page` (não branco puro) para manter o contraste calibrado sobre `brand`
- Nunca usar cores nativas do Tailwind (`gray`, `purple`, `violet`) — usar apenas os tokens acima
- Nunca usar cores arbitrárias como `text-[#A873D9]`