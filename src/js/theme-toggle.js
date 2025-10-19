/**
 * Theme Toggle
 * Dark/Light mode switcher with persistence
 */

'use strict';

// ==========================================
// THEME CONFIGURATION
// ==========================================

const THEME_KEY = 'website-theme';
const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

// ==========================================
// THEME MANAGER
// ==========================================

class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getSystemPreference() || THEMES.LIGHT;
    this.themeToggle = document.querySelector('.theme-toggle');

    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme, false);

    // Setup toggle button listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());

      // Keyboard support
      this.themeToggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }

    // Listen for system theme changes
    this.watchSystemTheme();
  }

  /**
   * Get stored theme from localStorage
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      return null;
    }
  }

  /**
   * Get system theme preference
   */
  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return THEMES.LIGHT;
    }
    return null;
  }

  /**
   * Set theme
   */
  setTheme(theme, save = true) {
    // Validate theme
    if (!Object.values(THEMES).includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    // Update document attribute
    document.documentElement.setAttribute('data-theme', theme);

    // Update current theme
    this.currentTheme = theme;

    // Save to localStorage
    if (save) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        console.warn('Could not save theme to localStorage:', e);
      }
    }

    // Update toggle button aria-label and icon
    if (this.themeToggle) {
      const label = theme === THEMES.DARK ? 'Switch to light mode' : 'Switch to dark mode';
      this.themeToggle.setAttribute('aria-label', label);

      // Update icon emoji
      const icon = this.themeToggle.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === THEMES.DARK ? '☀️' : '🌙';
      }
    }

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(
      new CustomEvent('themechange', {
        detail: { theme },
      })
    );
  }

  /**
   * Toggle between themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    this.setTheme(newTheme);

    // Optional: Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Modern browsers
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', e => {
        // Only auto-switch if user hasn't manually set a preference
        if (!this.getStoredTheme()) {
          const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
          this.setTheme(newTheme, false);
        }
      });
    }
    // Legacy browsers
    else if (darkModeQuery.addListener) {
      darkModeQuery.addListener(e => {
        if (!this.getStoredTheme()) {
          const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
          this.setTheme(newTheme, false);
        }
      });
    }
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference() {
    try {
      localStorage.removeItem(THEME_KEY);
    } catch (e) {
      console.warn('Could not remove theme from localStorage:', e);
    }

    const systemTheme = this.getSystemPreference() || THEMES.DARK;
    this.setTheme(systemTheme, false);
  }
}

// ==========================================
// INITIALIZE THEME MANAGER
// ==========================================

let themeManager;

// Initialize as early as possible to prevent flash
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
  });
} else {
  themeManager = new ThemeManager();
}

// ==========================================
// EXPORT FOR OTHER SCRIPTS
// ==========================================

window.themeManager = themeManager;

// ==========================================
// FLASH PREVENTION
// ==========================================

// This runs immediately to prevent theme flash on page load
(function () {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const systemTheme =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  const theme = storedTheme || systemTheme || 'light';

  document.documentElement.setAttribute('data-theme', theme);
})();
