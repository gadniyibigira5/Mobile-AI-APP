// src/health.ts
//
// M5 · Check whether the Python API is reachable.
//
// The function takes a `base` URL as its first argument so it can be tested
// against a fake server on a random port. Do not read API_URL inside here.

/** Default timeout for a health check, in milliseconds. */
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * Ping `<base>/health`.
 *
 *   - server answers with any 2xx  -> 'ok'
 *   - server answers with 4xx/5xx  -> 'offline'
 *   - nothing listening / timeout  -> 'offline'
 *
 * The function never throws.
 */
export async function checkHealth(
  base: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<'ok' | 'offline'> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}/health`, { signal: controller.signal });
    return res.ok ? 'ok' : 'offline';
  } catch {
    return 'offline';
  } finally {
    clearTimeout(timer);
  }
}