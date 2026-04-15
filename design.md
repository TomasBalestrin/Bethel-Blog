# Design System

**Paleta:** Azul `#3D6EBF` + Dourado `#B19365` + Warm Gray Claude  
**Temas:** `light` | `dark`  
**Fonte:** Plus Jakarta Sans + JetBrains Mono  
**Versão:** 1.0.0

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Temas](#temas)
3. [Paleta de Cores](#paleta-de-cores)
4. [Tokens Semânticos](#tokens-semânticos)
5. [Tipografia](#tipografia)
6. [Espaçamento](#espaçamento)
7. [Border Radius](#border-radius)
8. [Sombras](#sombras)
9. [Componentes](#componentes)
10. [Instalação](#instalação)

---

## Visão Geral

Sistema de design com dois papéis de cor bem definidos:

- **Azul `#3D6EBF`** → ações principais, CTAs, links, focus ring, barra de seção
- **Dourado `#B19365`** → detalhes e premium: dot da sidebar, traço eyebrow, badge Pro, barra de card premium, botão upgrade

O dark mode usa o **cinza quente original do Claude** (escala warm) como base, mantendo identidade com a plataforma.

---

## Temas

O tema é controlado pelo atributo `data-theme` no `<html>`:

```html
<html data-theme="light">
<html data-theme="dark">
```

Troca via JavaScript:

```js
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
}
```

---

## Paleta de Cores

### Azul `#3D6EBF` — Primário

| Token | Hex | Uso |
|-------|-----|-----|
| `--blue-50` | `#EEF3FB` | Background sutil (hover, chips) |
| `--blue-100` | `#D5E3F5` | Background de badges e tags |
| `--blue-200` | `#ADC7EB` | Borda com accent |
| `--blue-300` | `#7EAADF` | Focus ring, primário dark hover |
| `--blue-400` | `#5A8DD4` | **Primário dark mode** |
| `--blue-500` | `#3D6EBF` | **Primário light mode ★** |
| `--blue-600` | `#2F5A9E` | Hover light |
| `--blue-700` | `#24487E` | Active / texto sobre bg azul claro |
| `--blue-800` | `#1A365E` | Texto escuro |
| `--blue-900` | `#112440` | — |
| `--blue-950` | `#0A1628` | — |

### Dourado `#B19365` — Accent / Detalhe

| Token | Hex | Uso |
|-------|-----|-----|
| `--gold-50` | `#FAF6EF` | Background sutil dourado |
| `--gold-100` | `#F2E8D4` | Background de badges premium |
| `--gold-200` | `#E4CFA6` | Borda dourada |
| `--gold-300` | `#D4B478` | Accent dark hover |
| `--gold-400` | `#C4A068` | **Accent dark mode** |
| `--gold-500` | `#B19365` | **Accent light mode ★** |
| `--gold-600` | `#957A50` | Hover light |
| `--gold-700` | `#78613D` | Texto sobre bg dourado claro |

### Warm Gray — Neutros & Base Dark Mode

| Token | Hex | Uso |
|-------|-----|-----|
| `--warm-50` | `#faf9f5` | — |
| `--warm-100` | `#f4f3ee` | Pampas — sidebar light |
| `--warm-200` | `#ece9e0` | Bordas, bg-muted |
| `--warm-300` | `#d1ccc4` | Borda padrão light |
| `--warm-400` | `#b1ada1` | **Cloudy** — texto disabled, placeholder |
| `--warm-500` | `#918d84` | Texto terciário |
| `--warm-600` | `#726e67` | Texto disabled dark |
| `--warm-700` | `#57534d` | Texto secundário |
| `--warm-800` | `#3d3a35` | Borda dark, bg-muted dark |
| `--warm-900` | `#2a2723` | bg-subtle dark |
| `--warm-950` | `#1a1815` | **Background do dark mode** |

### Status (fixos, não variam por tema)

| Nome | Hex | Background | Texto |
|------|-----|------------|-------|
| Success | `#22c55e` | `#dcfce7` | `#15803d` |
| Warning | `#eab308` | `#fef9c3` | `#a16207` |
| Error | `#ef4444` | `#fee2e2` | `#b91c1c` |

> No dark mode as cores de status usam fundo com `opacity` para integrar com o fundo quente.

---

## Tokens Semânticos

Sempre use estes tokens no código — nunca os valores brutos da paleta.

### Backgrounds

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#F2F4F8` | `#1a1815` |
| `--bg-s` | `#E8EBF2` | `#2a2723` |
| `--bg-m` | `#DDE1EA` | `#3d3a35` |
| `--surf` | `#FFFFFF` | `#252320` |
| `--surf-low` | `#F4F5F8` | `#1f1d1a` |

### Bordas

| Token | Light | Dark |
|-------|-------|------|
| `--bdr` | `#CDD0D8` | `#3d3a35` |
| `--bdr-s` | `#E4E6EC` | `#2e2b27` |
| `--bdr-h` | `#9CA3AF` | `#524e48` |

### Texto

| Token | Light | Dark |
|-------|-------|------|
| `--tx` | `#0D1117` | `#f4f3ee` |
| `--tx2` | `#374151` | `#d1ccc4` |
| `--tx3` | `#6B7280` | `#918d84` |
| `--tx4` | `#9CA3AF` | `#726e67` |

### Primário (azul — varia por tema)

| Token | Descrição |
|-------|-----------|
| `--pri` | Cor principal |
| `--pri-h` | Hover |
| `--pri-bg` | Background sutil (chips, hover) |
| `--pri-mu` | Background médio (badges, avatares) |
| `--pri-tx` | Texto sobre fundo primário |
| `--pri-bd` | Borda com cor primária |

### Dourado (accent — varia por tema)

| Token | Descrição |
|-------|-----------|
| `--gld` | Cor accent |
| `--gld-h` | Hover |
| `--gld-bg` | Background sutil |
| `--gld-mu` | Background médio (badges Pro) |
| `--gld-tx` | Texto sobre fundo dourado |
| `--gld-bd` | Borda dourada |

### Sidebar (preto & branco — sem tom de cor)

| Token | Light | Dark |
|-------|-------|------|
| `--sb-bg` | `#ffffff` | `#141210` |
| `--sb-tx` | `#111827` (preto) | `#e8e6e1` (branco) |
| `--sb-txa` | `#0D1117` | `#ffffff` |
| `--sb-tx3` | `#9CA3AF` | `#57534d` |

> A sidebar usa texto preto/branco propositalmente para criar contraste com o conteúdo azul. O único toque de cor é o dot dourado no item ativo e na versão.

---

## Tipografia

### Fontes

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Variável | Família | Uso |
|----------|---------|-----|
| `--font-sans` | Plus Jakarta Sans | Todo o texto de interface |
| `--font-mono` | JetBrains Mono | Tokens CSS, código, hexadecimais |

### Escala de Tamanhos

| Token | rem | px | Uso |
|-------|-----|----|-----|
| `--text-xs` | 0.75rem | 12px | Labels uppercase, captions |
| `--text-sm` | 0.875rem | 14px | Texto secundário, labels |
| `--text-base` | 1rem | 16px | Corpo de texto |
| `--text-lg` | 1.125rem | 18px | Corpo grande |
| `--text-xl` | 1.25rem | 20px | H3 |
| `--text-2xl` | 1.5rem | 24px | H2 |
| `--text-3xl` | 1.875rem | 30px | — |
| `--text-4xl` | 2.25rem | 36px | H1 |
| `--text-5xl` | 3rem | 48px | Display |
| `--text-7xl` | 4.5rem | 72px | Hero |

### Pesos

| Token | Valor | Uso |
|-------|-------|-----|
| `--fw-regular` | 400 | Corpo |
| `--fw-medium` | 500 | Labels, navegação |
| `--fw-semibold` | 600 | Itens da sidebar, subtítulos |
| `--fw-bold` | 700 | Títulos de seção, títulos de card |
| `--fw-extrabold` | 800 | Título da página |

---

## Espaçamento

Base de **4px** (`0.25rem`).

| Token | px |
|-------|----|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |
| `--space-24` | 96px |
| `--space-32` | 128px |

---

## Border Radius

| Token | Valor | Componente |
|-------|-------|------------|
| `--radius-none` | 0 | Divisores, tabelas |
| `--radius-sm` | 4px | Tags inline |
| `--radius-md` | 6px | Tooltips |
| `--radius-base` | 8px | Inputs, toast |
| `--radius-lg` | 12px | — |
| `--radius-xl` | 16px | — |
| `--radius-2xl` | 20px | — |
| `--radius-full` | 9999px | Badges, avatares, pills |
| `--radius-btn` | 9px | Botão médio |
| `--radius-btn-sm` | 7px | Botão pequeno |
| `--radius-btn-lg` | 11px | Botão grande |
| `--radius-input` | 8px | Inputs |
| `--radius-card` | 13px | Cards |

---

## Sombras

| Token | Uso |
|-------|-----|
| `--sh-sm` | Cards em repouso, dropdowns |
| `--sh-md` | Cards em hover |
| `--sh-lg` | Modais, overlays flutuantes |
| `--sh-bl` | Glow azul — botões e elementos primários |
| `--sh-gl` | Glow dourado — botões e elementos premium |

> Os valores das sombras são redefinidos por cada tema para acomodar fundo claro (opacidade baixa) e escuro (opacidade alta).

---

## Componentes

### Botões

6 variantes disponíveis:

| Classe | Uso |
|--------|-----|
| `.b-pri` | Ação principal — azul com glow |
| `.b-gld` | Ação premium — dourado com glow |
| `.b-sec` | Cancelar / ação secundária |
| `.b-gho` | Ghost — ação terciária discreta |
| `.b-out` | Outline dourado — upgrade |
| `.b-dan` | Danger — ações destrutivas |

**Tamanhos:**

| Classe | Altura | Fonte |
|--------|--------|-------|
| `.btn-sm` | 30px | 12px |
| `.btn` (padrão) | 38px | 13.5px |
| `.btn-lg` | 46px | 15px |

```html
<button class="btn b-pri">Confirmar</button>
<button class="btn b-gld btn-sm">
  <svg>...</svg> Premium
</button>
```

---

### Inputs

```html
<input class="inp" type="text" placeholder="Texto padrão">
<textarea class="inp" placeholder="Escreva aqui..."></textarea>
```

Focus ring: `0 0 0 3px rgba(61,110,191,.13)` com borda azul.

---

### Badges

| Classe | Cor | Uso |
|--------|-----|-----|
| `.bdg-bl` | Azul | Status padrão |
| `.bdg-gd` | Dourado | Pro / Premium |
| `.bdg-gr` | Verde | Ativo / Sucesso |
| `.bdg-ye` | Amarelo | Pendente / Aviso |
| `.bdg-re` | Vermelho | Inativo / Erro |
| `.bdg-gy` | Cinza | Rascunho / Neutro |

```html
<span class="bdg bdg-bl">Primário</span>
<span class="bdg bdg-gd">Pro</span>
```

---

### Avatares

| Classe | Tamanho |
|--------|---------|
| `.av-sm` | 28×28px |
| `.av-md` | 38×38px |
| `.av-lg` | 48×48px |

**Variantes de cor:**

| Classe | Fundo | Texto |
|--------|-------|-------|
| `.av-bl` | `--pri-mu` | `--pri-tx` |
| `.av-gl` | `--gld-mu` | `--gld-tx` |
| `.av-gy` | `--bg-m` | `--tx3` |

```html
<div class="av av-md av-bl">BS</div>
<div class="av av-md av-gl">JO</div>
```

---

### Cards

Cards suportam uma **linha de cor no topo** para indicar contexto:

```html
<!-- Card padrão — linha azul -->
<div class="card card-tl ctl-bl">
  <div class="card-bd">...</div>
</div>

<!-- Card premium — linha dourada -->
<div class="card card-tl ctl-gl">
  <div class="card-bd">...</div>
</div>
```

---

### Alertas

| Classe | Cor | Uso |
|--------|-----|-----|
| `.al-bl` | Azul | Info / destaque |
| `.al-gr` | Verde | Sucesso |
| `.al-ye` | Amarelo | Aviso |
| `.al-re` | Vermelho | Erro |

```html
<div class="alert al-gr">
  <svg>...</svg>
  <div><strong>Sucesso!</strong> Alterações salvas.</div>
</div>
```

---

### Tags

```html
<span class="tag">
  Design
  <span class="tx">×</span>
</span>
```

---

### Code block (syntax highlight)

```html
<div class="code">
  <span class="cc">/* comentário */</span>
  <span class="ck">.seletor</span> { color: <span class="cv">var(--pri)</span>; }
</div>
```

| Classe | Cor | Significado |
|--------|-----|-------------|
| `.ck` | Azul `--blue-400` | Keyword / seletor |
| `.cv` | Dourado `--gold-400` | Valor / variável |
| `.cc` | Cinza `--tx3` | Comentário |

---

## Instalação

### 1. Importar arquivos

```html
<head>
  <!-- Fontes -->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- Design System -->
  <link rel="stylesheet" href="design.css">
</head>
```

Ou via CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import './design.css';
```

### 2. Definir tema inicial

```html
<html lang="pt-BR" data-theme="light">
```

### 3. Usar tokens no seu CSS

```css
/* ✅ Certo — tokens semânticos */
.meu-card {
  background:    var(--surf);
  border:        1px solid var(--bdr);
  border-radius: var(--radius-card);
  box-shadow:    var(--sh-sm);
}

.meu-botao {
  background: var(--pri);
  box-shadow: var(--sh-bl);
  color:      white;
}

/* ❌ Errado — valor fixo não muda com o tema */
.meu-card {
  background: #ffffff;
}
```

### 4. Integração Tailwind (opcional)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:     'var(--pri)',
        'primary-bg':'var(--pri-bg)',
        gold:        'var(--gld)',
        surface:     'var(--surf)',
        border:      'var(--bdr)',
      },
      boxShadow: {
        blue: 'var(--sh-bl)',
        gold: 'var(--sh-gl)',
        sm:   'var(--sh-sm)',
        md:   'var(--sh-md)',
      },
    },
  },
}
```

---

## Estrutura de arquivos

```
/
├── design.css          ← tokens, temas, componentes
├── design.md           ← esta documentação
└── design-system.html  ← referência visual interativa
```

---

## Referência rápida

```css
/* Aplicar tema */
[data-theme="light"] { --pri: #3D6EBF; --bg: #F2F4F8; }
[data-theme="dark"]  { --pri: #5A8DD4; --bg: #1a1815; }

/* Dourado — apenas para detalhes premium */
/* dot sidebar, eyebrow, badge Pro, barra de card, botão upgrade */
--gld: #B19365 (light) / #C4A068 (dark)

/* Sidebar — propositalmente preto & branco */
/* sem tom de cor para criar contraste com o conteúdo */
--sb-tx:  #111827 (light) / #e8e6e1 (dark)
--sb-txa: #0D1117 (light) / #ffffff (dark)
```

---

*Design System — Baseado na identidade visual do Claude / Anthropic*
