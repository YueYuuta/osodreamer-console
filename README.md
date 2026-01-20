# OsoDreamer Console

Una consola de desarrollador ligera y agnóstica del framework para aplicaciones web.
Perfecta para depuración en móvil, entornos de staging o pruebas en dispositivos donde no tienes acceso a las DevTools.

![OsoDreamer Console Demo](https://via.placeholder.com/800x400?text=OsoDreamer+Console+Preview)

> [!WARNING]
> **SOLO PARA DESARROLLO**: Esta librería interactúa con la función `eval()` e intercepta cabeceras de red protegidas para fines de depuración. **NO** es segura para entornos de producción. Asegúrate de eliminar este código o importarlo condicionalmente solo en builds de `development` o `staging`.

## Características

- 🖥️ **Consola Virtual**: Captura `console.log`, `warn`, `error`, e `info` con **Deduplicación** y **Stack Traces de Error**.
- 🌐 **Inspector de Red**: Intercepta peticiones `Fetch` y `XHR` con detalles de cabeceras y cuerpo.
- 🃏 **Sistema de Mocking**: Crea, alterna y gestiona mocks de red directamente desde la UI o código.
- ⚡ **Monitor del Sistema**: Rastreo de FPS y uso de Memoria en tiempo real.
- 💾 **Visor de Almacenamiento**: Ve y gestiona `localStorage` y `sessionStorage`.
- 🎨 **Totalmente Personalizable**: Soporte para temas y botón disparador arrastrable.
- 📱 **Optimizado para Móvil**: Interfaz amigable al tacto.
- 🔷 **Listo para TypeScript**: Escrito en TS con definiciones de tipos completas incluidas.
- 📦 **Cero Dependencias**: Ligero y fácil de integrar.

## Instalación

```bash
npm install osodreamer-console
```

## Uso

Importa e inicializa la consola en el punto de entrada de tu aplicación (e.g., `main.ts`, `index.js`).

```javascript
import OsoDreamerConsole from 'osodreamer-web-console';

// Inicialización Recomendada (El método estático evita advertencias de "variable no usada")
OsoDreamerConsole.init();
```

### Uso con TypeScript

La librería incluye definiciones de tipos integradas. Puedes importar interfaces para una configuración estrictamente tipada:

```typescript
import OsoDreamerConsole, { ConsoleConfig } from 'osodreamer-web-console';

const config: ConsoleConfig = {
    theme: {
        primary: '#6366f1' // Auto-completado habilitado
    }
};

OsoDreamerConsole.init(config);
```

### Con Configuración

Puedes personalizar el comportamiento y apariencia de la consola:

```javascript
OsoDreamerConsole.init({
    maxLogs: 200, // Límite de logs almacenados
    theme: {
        primary: '#10b981',    // Color de Acento/Marca
        background: 'rgba(22, 22, 24, 0.95)',
        text: '#ecfdf5'
    },
    trigger: {
        position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
        color: '#059669',
        text: 'DEBUG' // Opcional: Cambia el punto flotante por un botón de texto
    }
});
```

Para usarlo directamente en el navegador (vía CDN o UMD):

```html
<script src="path/to/osodreamer-console.umd.js"></script>
<script>
    new window.OsoDreamerConsole();
</script>
```

## API de Configuración

| Opción | Tipo | Por Defecto | Descripción |
|---|---|---|---|
| `maxLogs` | `number` | `300` | Número máximo de entradas de log a mantener en memoria. |
| `theme` | `object` | `{}` | Personalizar colores. |
| `trigger` | `object` | `{}` | Personalizar el botón flotante. |

### Objeto Theme
```typescript
{
    primary?: string;    // Color de acento (por defecto: azul)
    background?: string; // Fondo del panel
    text?: string;       // Color de texto principal
}
```

### Objeto Trigger
```typescript
{
    color?: string;      // Color de fondo del botón
    text?: string;       // Si se establece, renderiza texto en lugar de un punto
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

## Network Mocking (Simulación de Red) 🃏

OsoDreamer Console te permite interceptar y simular (mock) peticiones HTTP (`fetch` o `XHR`) directamente desde el navegador. Esto es útil para simular respuestas de API, probar estados de error o trabajar sin conexión.

### 1. API Programática

Puedes programar mocks al inicializar o en tiempo de ejecución.

```typescript
// Añadir una regla de mock
OsoDreamerConsole.store.addMock({
  id: 'mock-auth',
  active: true,
  method: 'POST', // 'GET', 'POST', 'PUT', 'DELETE' o '*'
  urlPattern: '/api/login', // Strings son tratados como coincidencias "contiene"
  status: 200,
  responseBody: '{"token": "fake-jwt-123", "user": "admin"}',
  delay: 1000 // Simular 1s de latencia de red
});

// Mockear un Error 500
OsoDreamerConsole.store.addMock({
  id: 'mock-error',
  active: true,
  method: 'GET',
  urlPattern: '/api/users',
  status: 500,
  responseBody: '{"error": "Error Interno del Servidor"}',
  delay: 200
});

// Alternar un mock por ID
OsoDreamerConsole.store.toggleMock('mock-auth');

// Eliminar un mock
OsoDreamerConsole.store.removeMock('mock-error');
```

### 2. Gestión desde la UI

También puedes gestionar mocks visualmente sin escribir código:

1. Abre la Consola y navega a la pestaña **Mocks**.
2. Haz clic en el botón **+ Add** en la cabecera.
3. Rellena los campos:
    - **URL Pattern**: Parte de la URL a coincidir (e.g., `/api`).
    - **Status Code**: Estado HTTP (e.g., `200`, `404`).
    - **Response JSON**: El cuerpo a devolver (e.g., `{"ok":true}`).
4. Usa el botón **ON/OFF** para habilitar o deshabilitar reglas específicas al instante.
5. Haz clic en cualquier fila de mock para inspeccionar el cuerpo completo de la respuesta.

## Desarrollo

Para ejecutar el proyecto localmente:

1. Clona el repo
2. Instala dependencias: `npm install`
3. Ejecuta el servidor de desarrollo: `npm run dev`
4. Ejecuta tests: `npm run test:coverage`

## Licencia

MIT © [YueYuuta](https://github.com/YueYuuta)
