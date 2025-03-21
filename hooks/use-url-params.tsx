// useUrlParams.ts - FIXED to prevent router updates during rendering
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export function useUrlParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use a ref to store pending URL updates
  const pendingUrlUpdate = useRef<string | null>(null);

  // Create a function to prepare URL updates without immediately executing them
  const prepareUrlUpdate = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      const urlWithCommas = `?${newParams.toString().replace(/%2C/g, ",")}`;

      // Store the update in the ref instead of immediately calling router.push
      pendingUrlUpdate.current = urlWithCommas;
    },
    [searchParams]
  );

  // Use an effect to actually perform the router update
  useEffect(() => {
    if (pendingUrlUpdate.current !== null) {
      const url = pendingUrlUpdate.current;
      pendingUrlUpdate.current = null;

      // Schedule the update for the next tick to ensure it's not during rendering
      setTimeout(() => {
        router.push(url, { scroll: false });
      }, 0);
    }
  }, [router, pendingUrlUpdate.current]);

  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  return {
    updateUrl: prepareUrlUpdate,
    getParam,
    searchParams,
  };
}
