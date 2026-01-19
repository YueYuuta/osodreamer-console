import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'OsoDreamerConsole',
            fileName: (format) => `osodreamer-console.${format}.js`
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {}
            }
        }
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            rollupTypes: true
        })
    ]
});
