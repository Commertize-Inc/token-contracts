# Commertize Brand Identity & Design System

## 1. Brand Vision

**Mission**: To democratize access to premium real estate investments through blockchain technology, bridging the gap between traditional finance and DeFi.
**Core Values**: Trust, Innovation, Transparency, Exclusivity.

## 2. Target Audience

- **Investors**: Seeking fractional ownership, liquidity, and diversification.
- **Sponsors**: Real estate owners looking for capital and tokenization.
- **Admins**: Managing the ecosystem.

## 3. Design Philosophy

- **Premium & Trustworthy**: The design must exude high-end financial stability.
- **Modern & Dynamic**: Utilizing glassmorphism, subtle animations, and depth to reflect the blockchain nature.
- **Clean & Intuitive**: Complex financial data presented simply.

## 4. Visual Identity

### Color Palette

_Material 3 Inspired Tones_

- **Primary**: `#C59B26` (Commertize Gold) - `var(--color-primary)` - Main brand color, buttons, highlights.
- **On Primary**: `#FFFFFF` - `var(--color-on-primary)` - Text on primary backgrounds.
- **Primary Container**: `#FDF8EA` - `var(--color-primary-container)` - Subtle backgrounds for active states.
- **On Primary Container**: `#423306` - `var(--color-on-primary-container)` - Text on primary container.

**Gold Palette** (for gradients and variations):

- `--color-gold-50`: `#FDF8EA` - Lightest gold background
- `--color-gold-100`: `#FBF0D5` - Light gold background
- `--color-gold-400`: `#D6AE45` - Medium gold accent
- `--color-gold-500`: `#C59B26` - Primary brand color
- `--color-gold-600`: `#A88218` - Darker gold (hover states)
- `--color-gold-900`: `#423306` - Darkest gold (text on gold backgrounds)

- **Surface**: `#FFFFFF` - `var(--color-surface)` - Default card/page background.
- **Surface Dim**: `#DEDFD6` - `var(--color-surface-dim)` - Secondary backgrounds.
- **Surface Container**: `#F3F4F6` - `var(--color-surface-container)` - Section backgrounds.

- **Outline**: `#79747E` - `var(--color-outline)` - Borders, dividers.
- **Outline Variant**: `#C4C7C5` - `var(--color-outline-variant)` - Subtle borders.

- **Text**:
  - **Main**: `#191C1C` - `var(--color-text-main)` - Primary headings and body.
  - **Body**: `#404944` - `var(--color-text-body)` - Secondary text, descriptions.

- **Dark Mode (Portal)**:
  - **Background**: `#111111` - `var(--color-portal-bg)`
  - **Sidebar**: `#0A0A0A` - `var(--color-portal-sidebar)`
  - **Text**: `#FFFFFF` - `var(--color-portal-text)` / `#94A3B8` (Slate 400) - `var(--color-portal-text-muted)`

### Typography

- **Headings**: **Playfair Display** (Serif) - Used for institutional messaging, hero headlines like "Tangible Yield", and section titles.
  - CSS variable: `var(--font-serif)` or `var(--font-playfair)`
  - CSS class: `.font-serif`
- **Body**: **Plus Jakarta Sans** (Sans-Serif) - Used for modern UI elements, body text, and general content.
  - CSS variable: `var(--font-sans)` or `var(--font-jakarta)`
  - CSS class: `.font-sans`
- **Data/Financial**: **Space Mono** (Monospace) - Used for financial data, numbers, percentages, and code.
  - CSS variable: `var(--font-mono)` or `var(--font-space)`
  - CSS class: `.font-mono` or `.financial-data` (includes font-weight: 700 and color: primary)

**Usage Examples (CSS Modules)**:

```css
/* Hero Title - Institutional Serif */
.heroTitle {
	font-family: var(--font-serif);
	font-size: var(--font-size-6xl);
	font-weight: 500;
	color: var(--color-slate-900);
}

/* Body Text - Modern Sans */
.bodyText {
	font-family: var(--font-sans);
	font-size: var(--font-size-base);
	color: var(--color-slate-500);
}

/* Financial Data - Monospace */
.targetIRR {
	font-family: var(--font-mono);
	font-weight: 700;
	color: var(--color-primary);
	font-size: var(--font-size-2xl);
}
```

### Logo & Iconography

- **Logo Symbol**: A building icon inside a rounded square with a gradient from `#C59B26` to `#8C6D1F`.
- **Logo Text**: "COMMERTIZE" in bold, tracking-tighter, serif/sans mix.
- **Icons**: `Lucide React` (Building, Wallet, Users, etc.).

### UI Design Language

- **Shape**: Professional, subtle rounded corners (avoiding overly rounded elements).
  - Buttons: `var(--radius-md)` (0.5rem/8px) - Subtle, professional rounding
  - Cards: `var(--radius-lg)` (0.75rem/12px) to `var(--radius-xl)` (1rem/16px)
  - Chips: `var(--radius-md)` (0.5rem/8px) - Consistent with buttons
  - Small elements: `var(--radius-sm)` (0.375rem/6px) or `var(--radius-xs)` (0.25rem/4px)
- **Elevation**:
  - Soft shadows: `shadow-lg shadow-[#C59B26]/20` for primary actions.
  - Glassmorphism: `backdrop-blur-md` for sticky navbars and overlays.
- **Interaction**:
  - Ripple effects on buttons.
  - Hover states with scale (`active:scale-95`) and shadow expansion.

## 5. Technology Stack

- **Framework**: Next.js 15 (App Router) - Scalable, SEO-friendly, Vercel-optimized.
- **Language**: TypeScript - Type safety for financial data.
- **Styling**: CSS Modules (Vanilla CSS) - Scoped, performant, no Tailwind dependency.
- **State Management**: Zustand (for global state, especially with Privy/Plaid data).
- **Icons**: Lucide React or Heroicons.
