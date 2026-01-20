# OsoDreamer Console

A lightweight, framework-agnostic developer console for web applications. 
Perfect for mobile debugging, staging environments, or testing on devices where you don't have access to DevTools.

![OsoDreamer Console Demo](https://via.placeholder.com/800x400?text=OsoDreamer+Console+Preview)

> [!WARNING]
> **DEVELOPMENT ONLY**: This library interacts with the `eval()` function and intercepts protected network headers for debugging purposes. It is **NOT** secure for production environments. Ensure this code is stripped or conditionally imported only in `development` or `staging` builds.

## Features

- 🖥️ **Virtual Console**: Captures `console.log`, `warn`, `error`, and `info`.
- 🌐 **Network Inspector**: Intercepts `Fetch` and `XHR` requests with header/body details.
- ⚡ **System Monitor**: Real-time FPS and Memory usage tracking.
- 💾 **Storage Viewer**: View and manage `localStorage` and `sessionStorage`.
- 🎨 **Fully Customizable**: Theming support and draggable trigger button.
- 📱 **Mobile Optimized**: Touch-friendly interface.
- � **TypeScript Ready**: Written in TS with full type definitions included.
- �📦 **Zero Dependencies**: Lightweight and easy to integrate.

## Installation

```bash
npm install osodreamer-console
```

## Usage

Import and initialize the console at the entry point of your application (e.g., `main.ts`, `index.js`).

```javascript
import OsoDreamerConsole from 'osodreamer-web-console';

// Recommended Initialization (Static method avoids "unused variable" warnings)
OsoDreamerConsole.init();
```

### TypeScript Usage

The library includes built-in type definitions. You can import interfaces for strictly typed configuration:

```typescript
import OsoDreamerConsole, { ConsoleConfig } from 'osodreamer-web-console';

const config: ConsoleConfig = {
    theme: {
        primary: '#6366f1' // Auto-complete enabled
    }
};

OsoDreamerConsole.init(config);
```

### With Configuration

You can customize the console's behavior and appearance:

```javascript
OsoDreamerConsole.init({
    maxLogs: 200, // Limit stored logs
    theme: {
        primary: '#10b981',    // Brand/Accent color
        background: 'rgba(22, 22, 24, 0.95)',
        text: '#ecfdf5'
    },
    trigger: {
        position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
        color: '#059669',
        text: 'DEBUG' // Optional: Changes floating dot to a text button
    }
});
```

To use it in the browser directly (via CDN or UMD):

```html
<script src="path/to/osodreamer-console.umd.js"></script>
<script>
    new window.OsoDreamerConsole();
</script>
```

## Configuration API

| Option | Type | Default | Description |
|osodreamer-console|---|---|---|
| `maxLogs` | `number` | `300` | Maximum number of log entries to keep in memory. |
| `theme` | `object` | `{}` | Customize colors. |
| `trigger` | `object` | `{}` | Customize the floating button. |

### Theme Object
```typescript
{
    primary?: string;    // Accent color (default: blue)
    background?: string; // Panel background
    text?: string;       // Main text color
}
```

### Trigger Object
```typescript
{
    color?: string;      // Button background color
    text?: string;       // If set, renders text instead of a dot
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

## Development

To run the project locally:

1. Clone the repo
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Run tests: `npm run test:coverage`

## License

MIT © [YueYuuta](https://github.com/YueYuuta)
