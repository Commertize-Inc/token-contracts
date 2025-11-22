# Commertize UI Style Guide

This document outlines the specific component styles and behaviors for the Commertize platform, based on the Material 3 inspired aesthetic.

## Components

### Buttons
**Base Style**: `.buttonBase`
- Shape: Subtle rounding (`var(--radius-md)` - 0.5rem/8px)
- Typography: Uppercase, tracking wide, font medium
- Animation: Transition all, active scale 0.95
- Layout: Flex center, gap 0.5rem

**Variants**:
- **Primary** (`.btnPrimary`):
  - Background: `var(--color-primary)`
  - Text: White
  - Hover: Darker Gold (`#A88218`), Shadow
- **Secondary** (`.btnSecondary`):
  - Background: Slate 900
  - Text: White
  - Hover: Slate 800, Shadow
- **Outlined** (`.btnOutlined`):
  - Border: 1px solid Slate 300
  - Text: Slate 900
  - Hover: Slate 50 bg, Slate 400 border
- **Text** (`.btnText`):
  - Background: Transparent
  - Text: Slate 600
  - Hover: Slate 100/50 bg, Text `var(--color-primary)`

### Chips / Tags
**Base Style**: `.chip`
- Shape: Subtle rounding (`var(--radius-md)` - 0.5rem/8px)
- Typography: Text xs, bold, tracking wider, uppercase
- Border: 1px solid

**States**:
- **Active** (`.chipActive`): Bg `var(--color-primary)`, Text White, Border `var(--color-primary)`
- **Inactive** (`.chipInactive`): Bg Transparent, Text Slate 500, Border Slate 200

### Cards & Containers
**Standard Card**:
- Background: White
- Border: 1px solid Slate 200
- Radius: `var(--radius-lg)` (0.75rem/12px)
- Shadow: Shadow sm

**Feature Card (Bento Grid)**: `.bentoCard`
- Radius: `var(--radius-xl)` (1rem/16px)
- Backgrounds:
    - Large: `.bentoLarge` (`#F5F5F7`)
    - Dark: `.bentoDark` (Slate 900)
    - Gold: `.bentoGold` (`#FDF8EA`)

### Hero Section
**Classes**:
- Container: `.hero`
- Title: `.heroTitle` (Serif, large)
- Description: `.heroDesc` (Border left primary)
- Visual Asset: `.cardAsset` (Rotated card with hover effect)

## Navigation Systems

### Public Website Navbar
**Classes**: `.navbar`
- **Initial State** (`.navbarTransparent`): Transparent background
- **Scrolled State** (`.navbarScrolled`): White 80% opacity, backdrop blur, border bottom

### Portal Sidebar (Dark Mode)
**Classes**: `.sidebar`
- **Background**: `var(--color-portal-sidebar)`
- **Item** (`.sidebarItem`):
  - **Active** (`.sidebarItemActive`): Bg `var(--color-primary)`, Text White
  - **Inactive** (`.sidebarItemInactive`): Text Slate 400, Hover White/5% bg

## Dashboard / Portal Layout
**Classes**: `.portalContainer`
- **Background**: `var(--color-portal-bg)`
- **Content**: `.portalContent` (Bg `#F2F2F2`)
- **Header**: `.portalHeader` (White, border bottom)
