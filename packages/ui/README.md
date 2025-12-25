# Shared UI Package (`@commertize/ui`)

A shared component library used across all Commertize applications to ensure brand consistency.

## Usage

Import components directly in your apps:

```tsx
import { Button, Logo, Chip } from "@commertize/ui";

export default function MyPage() {
	return (
		<div>
			<Logo theme="dark" />
			<Button variant="primary">Click Me</Button>
		</div>
	);
}
```

## Components

- **Button**: Primary, Secondary, Outlined, Ghost variants.
- **Input**: Standardized text inputs.
- **Logo**: Brand SVG logo.
- **Chip**: Status indicators.
- **Navbar**: Responsive navigation bar.

## Development

### Adding a New Component

1.  Create the component file (e.g., `NewComponent.tsx`).
2.  Create the CSS module (e.g., `NewComponent.module.css`).
3.  Export it in `index.ts`.

### Styling

We use **CSS Modules** for component isolation.

```css
/* Button.module.css */
.button {
	@apply px-4 py-2 rounded;
}
```
