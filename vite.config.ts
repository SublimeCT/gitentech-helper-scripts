import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { PagesInfoMap } from './src/Pages'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://hub.gientech.com/sites/all/themes/hisoft_portal/favicon.ico',
        namespace: 'gientech.com',
        author: 'xx',
        include: Object.values(PagesInfoMap).map(info => info.pattern),
      },
    }),
  ],
  server: {
    port: 20129,
  }
});
