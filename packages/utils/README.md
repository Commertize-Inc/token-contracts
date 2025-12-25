# Utils Package (`@commertize/utils`)

Shared utility functions and common logic.

## Modules

- **Client**: Utilities safe for browser usage.
- **Server**: Utilities for Node.js environment.
- **Env**: Environment variable parsing and validation.

## Usage

Import from the specific subpath to avoid bundling node-only code in the browser:

```ts
import { ... } from "@commertize/utils/client";
import { ... } from "@commertize/utils/server";
```
