export const THEME_STORAGE_KEY = "spark:theme:v1";
export type ThemePreference = "system" | "light" | "dark";

// Runs in <head> before the first paint. Keep browser/storage access here so the
// server renders the same HTML for every user, including the cached offline shell.
// This is static application code; no user content is interpolated into the script.
export const themeBootstrap = `(() => {
  const key = ${JSON.stringify(THEME_STORAGE_KEY)};
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => value === 'light' || value === 'dark' ? value : 'system';
  let preference = 'system';
  try { preference = normalize(localStorage.getItem(key)); } catch {}
  function apply() {
    const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    let meta = document.getElementById('spark-theme-color');
    if (!meta) {
      meta = document.createElement('meta');
      meta.id = 'spark-theme-color';
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === 'dark' ? '#121622' : '#111742';
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
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  apply();
  document.addEventListener('DOMContentLoaded', apply, { once: true });
})();`;
