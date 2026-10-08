// @ts-check
import { defineConfig } from 'astro/config';

// Si es publica en una subcarpeta, posa-la a «base». Tots els enllaços del joc la fan servir.
export default defineConfig({
  base: '/',
  server: { port: 4325 },
});
