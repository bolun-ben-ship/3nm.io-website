import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://3nm.io', output: 'static', build: { format: 'file' }, trailingSlash: 'never' });
