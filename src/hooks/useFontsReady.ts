import { useEffect, useState } from "react";


export function useFontsReady(timeoutMs = 1500) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));

    Promise.race([document.fonts.ready, timeout]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [timeoutMs]);

  return ready;
}