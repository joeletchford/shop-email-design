// Build-time stamped version + runtime auto-reloader.
//
// Each `pnpm build` writes a unique build ID into the bundle (via vite.config
// define) and into /version.json (via the build-version-stamp plugin).
// At runtime we poll /version.json every minute; if the live ID differs from
// the bundled one, we reload the page so the user gets the new bundle.

declare const __BUILD_ID__: string;

export const BUILD_ID: string = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'dev';

let pollHandle: number | null = null;
let reloadingScheduled = false;

async function fetchLiveVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { build?: string };
    return typeof json.build === 'string' ? json.build : null;
  } catch {
    return null;
  }
}

function scheduleReload(reason: string) {
  if (reloadingScheduled) return;
  reloadingScheduled = true;
  console.info(`[version] new build available (${reason}); reloading\u2026`);
  // Tiny delay so the console log flushes and the user sees something
  // happen if they're watching.
  setTimeout(() => {
    window.location.reload();
  }, 250);
}

export function startVersionPolling(intervalMs = 60_000): void {
  if (pollHandle != null) return;
  // Don't poll in dev (no server-side version.json) or when there's no build ID.
  if (BUILD_ID === 'dev') return;
  const tick = async () => {
    const live = await fetchLiveVersion();
    if (live && live !== BUILD_ID) {
      scheduleReload(`bundle=${BUILD_ID} live=${live}`);
    }
  };
  // First check 5s after load so the app renders before any reload could fire.
  window.setTimeout(tick, 5_000);
  pollHandle = window.setInterval(tick, intervalMs);
}
