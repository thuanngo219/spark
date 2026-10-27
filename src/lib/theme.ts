export const THEME_STORAGE_KEY = "spark:theme:v1";
export type ThemePreference = "system" | "light" | "dark";

// Runs in <head> before the first paint. Keep browser/storage access here so the
// server renders the same HTML for every user, including the cached offline shell.
// This is static application code; no user content is interpolated into the script.
export const themeBootstrap = `(() => {
  const key = ${JSON.stringify(THEME_STORAGE_KEY)};
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const mobile = window.matchMedia('(max-width: 699px)');
  const normalize = value => value === 'light' || value === 'dark' ? value : 'system';
  let preference = 'system';
  let sidebarOpen = false;
  try { preference = normalize(localStorage.getItem(key)); } catch {}
  function apply() {
    const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    const sidebar = sidebarOpen && mobile.matches;
    const color = sidebar ? '#111742' : theme === 'dark' ? '#121622' : '#f7f8fa';
    const scheme = sidebar ? 'dark' : theme;
    root.style.colorScheme = scheme;
    // Available before CSS/hydration, including an explicit theme opposite to OS.
    root.style.backgroundColor = color;
    root.style.setProperty('--browser-background', color);
    let meta = document.getElementById('spark-theme-color');
    if (!meta) {
      meta = document.createElement('meta');
      meta.id = 'spark-theme-color';
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = color;
    let schemeMeta = document.getElementById('spark-color-scheme');
    if (!schemeMeta) {
      schemeMeta = document.createElement('meta');
      schemeMeta.id = 'spark-color-scheme';
      schemeMeta.name = 'color-scheme';
      document.head.appendChild(schemeMeta);
    }
    schemeMeta.content = scheme;
    window.dispatchEvent(new Event('spark:theme-change'));
  }
  window.addEventListener('spark:theme-select', event => {
    preference = normalize(event.detail);
    try { localStorage.setItem(key, preference); } catch {}
    apply();
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = normalize(event.newValue);
      apply();
    }
  });
  window.addEventListener('spark:theme-refresh', apply);
  window.addEventListener('spark:sidebar-chrome', event => {
    sidebarOpen = event.detail === true;
    apply();
  });
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  mobile.addEventListener('change', apply);
  apply();
  document.addEventListener('DOMContentLoaded', apply, { once: true });
})();`;
