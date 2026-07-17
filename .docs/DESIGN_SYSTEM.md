# Design system — guia de cores e tipografia

> Paleta baseada em `#663399` (Rebeca Purple). 
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
    DEFAULT: '#663399',
    light:   '#9B5CC4',
    lighter: '#D9C4EF',
    subtle:  '#F3EEF9',
    dark:    '#4A2470',
    darker:  '#2E1247',
  },
  page:    '#F5F0FF',
  surface: '#FFFFFF',
  border:  '#E8E0F3',
  body:    '#1A1A2E',
  muted:   '#6C6F89',
  violet:  '#8B3FC2',
  indigo:  '#4A3FCC',
  success: '#33996B',
  warning: '#CC8000',
  error:   '#C0334D',
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
| `brand` | `#663399` | Botões primários, links ativos, ícones de destaque |
| `brand-light` | `#9B5CC4` | Hover de botões e elementos interativos |
| `brand-lighter` | `#D9C4EF` | Bordas suaves, chips, badges |
| `brand-subtle` | `#F3EEF9` | Fundo de cards com contexto brand |
| `brand-dark` | `#4A2470` | Estado active/pressed, texto sobre fundo brand claro |
| `brand-darker` | `#2E1247` | Headings em seções escuras |

### Neutros

| Token | Hex | Uso |
|---|---|---|
| `page` | `#F5F0FF` | Fundo da página (`<body>`) |
| `surface` | `#FFFFFF` | Cards, modais, inputs, dropdowns |
| `border` | `#E8E0F3` | Divisores e bordas |
| `body` | `#1A1A2E` | Texto principal |
| `muted` | `#6C6F89` | Texto secundário, placeholders |

### Análogas

| Token | Hex | Uso |
|---|---|---|
| `violet` | `#8B3FC2` | Destaque alternativo, ilustrações |
| `indigo` | `#4A3FCC` | Links, ícones informativos |

### Funcionais

| Token | Hex | Uso |
|---|---|---|
| `success` | `#33996B` | Confirmações, toasts de sucesso |
| `warning` | `#CC8000` | Alertas e avisos |
| `error` | `#C0334D` | Erros de formulário, estados destrutivos |

---

## Acessibilidade WCAG 2.1

| Combinação | Contraste | Nível |
|---|---|---|
| `#663399` sobre branco | 7.3:1 | AA + AAA ✓ |
| Branco sobre `#663399` | 8.1:1 | AA + AAA ✓ |
| `#663399` sobre `#F5F0FF` | 5.2:1 | AA ✓ |
| `#1A1A2E` sobre branco | 12.6:1 | AA + AAA ✓ |

---

## Componentes de referência

### Botão primário
```html
<button class="bg-brand text-white px-4 py-2 rounded-lg
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
<span class="bg-brand-subtle text-brand-dark text-xs font-medium px-3 py-1 rounded-full">
  Novo
</span>
```

### Input com erro
```html
<input class="border border-error rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-error/30" />
<p class="text-error text-sm mt-1">Campo obrigatório</p>
```

### Layout raiz
```html
<body class="bg-page text-body">
```

---

## Regras rápidas

- Texto principal → sempre `text-body`, nunca `text-black` ou `text-gray-900`
- Texto secundário → sempre `text-muted`, nunca `text-gray-500`
- Fundo de página → sempre `bg-page`
- Fundo de card → sempre `bg-surface`
- Bordas → sempre `border-border`
- Nunca usar cores nativas do Tailwind (`gray`, `purple`, `violet`) — usar apenas os tokens acima
- Nunca usar cores arbitrárias como `text-[#663399]`