// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel(),
    integrations: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
        }),
        keystatic(), 
        tailwind()
    ],
});
