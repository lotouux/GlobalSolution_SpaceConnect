import type { SatNode } from "../components/OrbitalGlobe";

export function generateConstellation(seed = 42): SatNode[] {
  // Gerador Pseudo-aleatório previsível (para os satélites nascerem sempre no mesmo lugar)
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const nodes: SatNode[] = [];
  const planes = 6;
  const perPlane = 8;
  let i = 0;

  for (let p = 0; p < planes; p++) {
    // Inclinação orbital
    const inc = -60 + (120 * p) / (planes - 1);
    
    for (let k = 0; k < perPlane; k++) {
      // Cálculo Geográfico
      const lon = -180 + (360 * k) / perPlane + p * 12;
      const lat = inc + Math.sin(k * 0.9 + p) * 8;
      
      const normalizedLon = ((lon + 540) % 360) - 180;
      const inEclipse = normalizedLon < -90 || normalizedLon > 90;

      nodes.push({
        id: `SAT-${String(i).padStart(3, "0")}`,
        name: `ORION-${p}${k}`,
        lat,
        lon: normalizedLon,
        alt: rand(), // Pequenas variações de altitude na LEO
        
        // Simulação de Telemetria Dinâmica baseada em Eclipse
        inEclipse,
        battery: inEclipse ? 25 + Math.floor(rand() * 20) : 85 + Math.floor(rand() * 15),
        gpuTemp: inEclipse ? 15 + Math.floor(rand() * 10) : 65 + Math.floor(rand() * 25),
        workload: inEclipse ? Math.floor(rand() * 10) : 60 + Math.floor(rand() * 35),
      });
      i++;
    }
  }
  return nodes;
}

export function generateLinks(
  nodes: SatNode[],
  failedSet: Set<string> = new Set(),
): Array<{ from: string; to: string; state: "active" | "failed" | "dim" }> {
  const links: Array<{ from: string; to: string; state: "active" | "failed" | "dim" }> = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const b = nodes[(i + 1) % nodes.length];
    
    const failed = failedSet.has(a.id) || failedSet.has(b.id);
    const dim = a.inEclipse && b.inEclipse;
    
    links.push({
      from: a.id,
      to: b.id,
      state: failed ? "failed" : dim ? "dim" : "active",
    });

    if (i % 4 === 0) {
      const c = nodes[(i + 9) % nodes.length];
      const failed2 = failedSet.has(a.id) || failedSet.has(c.id);
      
      links.push({
        from: a.id,
        to: c.id,
        state: failed2 ? "failed" : a.inEclipse && c.inEclipse ? "dim" : "active",
      });
    }
  }
  return links;
}