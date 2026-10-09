const SCAN_RANGES = [
  '192.168.43',  // common hotspot
  '172.20.10',   // iOS hotspot
  '192.168.1',   // common home router
];

const SERVER_PORT = 3001;
const API_PATH = '/api/info';
const TIMEOUT_MS = 1500;

async function checkHost(baseUrl) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${baseUrl}${API_PATH}`, {
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(id);
    if (res.ok) {
      const data = await res.json();
      return { url: baseUrl, ...data };
    }
  } catch (_) {
    // ignore
  }
  return null;
}

function getBaseUrl(host, port = SERVER_PORT) {
  return `http://${host}:${port}`;
}

export async function scanNetwork() {
  const results = [];
  const sameHost = getBaseUrl(window.location.hostname);
  const same = await checkHost(sameHost);
  if (same) results.push(same);

  const promises = [];
  for (const prefix of SCAN_RANGES) {
    for (let i = 1; i <= 254; i++) {
      const host = `${prefix}.${i}`;
      if (host === window.location.hostname) continue;
      promises.push(checkHost(getBaseUrl(host)).then((r) => (r ? results.push(r) : null)));
    }
  }
  await Promise.all(promises);
  return results;
}

export function getDefaultServerUrl() {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  return getBaseUrl(window.location.hostname);
}
