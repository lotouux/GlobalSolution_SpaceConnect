import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Inicializamos com o valor real para evitar piscadas de layout no telemóvel.
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Ouvinte de eventos
    mql.addEventListener("change", onChange);
    
    // Sincroniza logo na montagem
    setIsMobile(mql.matches);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}