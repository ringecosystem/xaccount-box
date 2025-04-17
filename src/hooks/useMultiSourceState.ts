import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
/**
 * one hook that supports multiple sources of state management,
 * including URL parameters, localStorage, and default values.
 *
 * @param options
 * @param options.key localStorage  key
 * @param options.urlParam
 * @param options.defaultValue
 * @returns a tuple containing the current state and the update function
 */
export function useMultiSourceState<T>(options: {
  key: string;
  urlParam?: string | null;
  defaultValue: T;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { key, urlParam, defaultValue } = options;

  // Initialize state with the URL parameter or localStorage value directly
  const getInitialState = (): T => {
    // Check if we're in the browser environment
    const isBrowser = typeof window !== 'undefined';

    try {
      // First check URL parameter
      if (urlParam !== undefined && urlParam !== null) {
        try {
          // Try to parse it as JSON
          const parsedValue = JSON.parse(urlParam);
          // Update localStorage as well
          if (isBrowser) {
            window.localStorage.setItem(key, urlParam);
          }
          return parsedValue;
        } catch {
          // If parsing fails, treat as simple string
          if (isBrowser) {
            window.localStorage.setItem(key, JSON.stringify(urlParam));
          }
          return urlParam as unknown as T;
        }
      }

      // No URL parameter, try localStorage
      if (isBrowser) {
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }
    } catch (error) {
      console.warn(`Error initializing state, localStorage key "${key}"`, error);
    }

    // Fall back to default value
    return defaultValue;
  };

  const [state, setStateOriginal] = useState<T>(getInitialState());

  // Update state if URL parameter changes
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    try {
      if (urlParam !== undefined && urlParam !== null) {
        try {
          const parsedValue = JSON.parse(urlParam);
          setStateOriginal(parsedValue);
          if (isBrowser) {
            window.localStorage.setItem(key, urlParam);
          }
        } catch {
          setStateOriginal(urlParam as unknown as T);
          if (isBrowser) {
            window.localStorage.setItem(key, JSON.stringify(urlParam));
          }
        }
      }
    } catch (error) {
      console.warn(`Error updating state from URL parameter, key "${key}"`, error);
    }
  }, [key, urlParam]);

  /**
   * update the state, also update the localStorage
   * note: this will not update the URL parameter, because the URL parameter is usually controlled by the router
   */
  const setState = (newState: T | ((prevState: T) => T)) => {
    const isBrowser = typeof window !== 'undefined';
    try {
      const newStateValue =
        typeof newState === 'function' ? (newState as (prevState: T) => T)(state) : newState;

      if (isBrowser) {
        window.localStorage.setItem(key, JSON.stringify(newStateValue));
      }
      setStateOriginal(newStateValue);
      const params = new URLSearchParams(searchParams);

      if (typeof newStateValue === 'string') {
        params.set(key, newStateValue);
      } else {
        params.set(key, JSON.stringify(newStateValue));
      }

      router.push(`?${params.toString()}`);
    } catch (error) {
      console.warn(`error setting the localStorage, key "${key}":`, error);
      setStateOriginal(newState);
    }
  };

  return [state, setState] as const;
}
