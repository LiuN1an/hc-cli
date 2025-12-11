import { useLocalStorage as useLocalStorageBase } from "usehooks-ts";

/**
 * Re-export useLocalStorage from usehooks-ts
 *
 * Usage:
 * const [value, setValue, removeValue] = useLocalStorage('my-key', defaultValue);
 *
 * Features:
 * - Type-safe localStorage access
 * - Automatic JSON serialization/deserialization
 * - SSR-safe (returns default value during SSR)
 * - Syncs across tabs/windows
 *
 * @example
 * // String value
 * const [name, setName] = useLocalStorage('user-name', '');
 *
 * // Object value
 * const [settings, setSettings] = useLocalStorage('settings', {
 *   theme: 'dark',
 *   language: 'en',
 * });
 *
 * // Array value
 * const [favorites, setFavorites] = useLocalStorage<number[]>('favorites', []);
 */
export { useLocalStorageBase as useLocalStorage };

/**
 * Hook for managing theme preference in localStorage
 */
export function useThemePreference() {
  const [theme, setTheme] = useLocalStorageBase<"light" | "dark" | "system">(
    "theme-preference",
    "system"
  );

  return { theme, setTheme };
}

/**
 * Hook for managing sidebar collapsed state
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useLocalStorageBase(
    "sidebar-collapsed",
    false
  );

  const toggle = () => setIsCollapsed(!isCollapsed);

  return { isCollapsed, setIsCollapsed, toggle };
}

