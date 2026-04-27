import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// One build ID per `pnpm build`. Embedded into the bundle as the constant
// __BUILD_ID__ AND written to /version.json. The app polls /version.json
// at runtime; if the live ID differs from the bundled one, the app reloads
// itself. Avoids "hard refresh" gymnastics after every deploy.
const BUILD_ID = String(Date.now());

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'build-version-stamp',
      apply: 'build',
      closeBundle() {
        // Source lives at <repo>/source/, build output goes to <repo>/.
        // version.json is polled by /version.ts at runtime to auto-reload
        // the app after a deploy.
        const outDir = resolve(__dirname, '..');
        try {
          mkdirSync(outDir, { recursive: true });
          writeFileSync(
            resolve(outDir, 'version.json'),
            JSON.stringify({ build: BUILD_ID, generated_at: new Date().toISOString() })
          );
          console.log(`[build-version-stamp] wrote version.json with build=${BUILD_ID}`);
        } catch (e) {
          console.warn('[build-version-stamp] failed to write version.json:', e);
        }
      },
    },
  ],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  build: {
    // Output to <repo>/, not <repo>/source/dist. emptyOutDir: false so we
    // don't wipe the deployed README, favicon, version.json, etc. when
    // building. Old hashed JS bundles in /assets must be deleted manually
    // before commit (see README "Deploying" section).
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'assets',
  },
})
