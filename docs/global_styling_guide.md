# Global Styling & Font Size Improvements

## What Was Done

### 1. Global CSS Design System (`globals.css`)

Created comprehensive design tokens and utility classes:

#### Design Tokens Added
- **Colors:** Full palette with CSS variables
  - `--color-primary`, `--color-slate-*`, etc.
- **Font Sizes:** Increased base sizes (16px → 17px desktop)
  - `--font-size-xs` through `--font-size-6xl`
- **Spacing:** Consistent spacing scale
- **Shadows:** Reusable shadow variables

#### Increased Font Sizes
- **Base:** `1rem` → `1.0625rem` (17px)
- **Small:** `0.875rem` → `0.9375rem` (15px)
- **Large:** `1.125rem` → `1.1875rem` (19px)
- **Headings:** Proportionally increased

#### Responsive Typography
```css
html {
  font-size: 16px; /* mobile */
}
@media (min-width: 768px) {
  html { font-size: 17px; } /* tablet */
}
@media (min-width: 1024px) {
  html { font-size: 18px; } /* desktop */
}
```

#### Utility Classes
- `.text-on-dark` - White text for dark backgrounds
- `.card-dark` - Dark card with proper text colors
- `.glass` - Glassmorphic effects
- `.text-gradient` - Gradient text effect

### 2. Updated Page Styles

Replaced hardcoded values with CSS variables:

**Before:**
```css
.bentoTitle {
  font-size: 1.875rem;
  color: #0f172a;
}
```

**After:**
```css
.bentoTitle {
  font-size: var(--font-size-3xl);
  color: var(--color-slate-900);
}
```

#### Sections Updated
- Bento cards (titles, text)
- Technology section (all typography)
- Spacing values
- Color references

### 3. Benefits

✅ **Consistency:** All components use same design tokens
✅ **Maintainability:** Change once in globals.css, applies everywhere
✅ **Readability:** Larger base font sizes (17px desktop vs 16px)
✅ **Scalability:** Easy to add new components with consistent styling
✅ **Dark Mode Ready:** Proper dark background text utilities

## Font Size Comparison

| Element | Before | After |
|---------|--------|-------|
| Base text | 16px | 17px (desktop) |
| Small text | 14px | 15px |
| Bento title | 30px | 32px |
| Tech title | 24px | 26px |
| Section title | 36px | 40px |
| Hero title | 48px | 52px |

## Usage Examples

### For Future Components

**Dark Card with proper contrast:**
```tsx
<div className="card-dark">
  <h3 className="text-on-dark">Title</h3>
  <p className="text-on-dark-secondary">Description</p>
</div>
```

**Using font size variables:**
```css
.myComponent {
  font-size: var(--font-size-lg);
  color: var(--color-slate-600);
  padding: var(--spacing-md);
}
```

## Build Status
✅ All changes compiled successfully
✅ No breaking changes
✅ Backward compatible

---

**Result:** The landing page now has better readability with larger fonts, and all styling is centralized for easy maintenance and future component development.
