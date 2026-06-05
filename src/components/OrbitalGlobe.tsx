import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

export interface SatNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  alt: number; // 0..1 above globe
  inEclipse: boolean;
  battery: number;
  gpuTemp: number;
  workload: number;
  failed?: boolean;
}

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const EARTH_R = 2;

function Earth({ sunDir }: { sunDir: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });

  // Wireframe-ish dotted globe
  return (
    <group>
      {/* Core glow sphere */}
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.02, 48, 48]} />
        <meshBasicMaterial color="#1e3a5f" transparent opacity={0.15} />
      </mesh>
      {/* Wireframe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_R, 48, 32]} />
        <meshBasicMaterial
          color="#3b6fa0"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Day/night shader sphere */}
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.005, 96, 64]} />
        <shaderMaterial
          transparent
          uniforms={{ uSun: { value: sunDir } }}
          vertexShader={`
            varying vec3 vN;
            void main() {
              vN = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vN;
            uniform vec3 uSun;
            void main() {
              float d = dot(normalize(vN), normalize(uSun));
              float day = smoothstep(-0.2, 0.4, d);
              vec3 dayCol = vec3(0.18, 0.42, 0.58);
              vec3 nightCol = vec3(0.04, 0.06, 0.12);
              vec3 col = mix(nightCol, dayCol, day);
              float term = 1.0 - smoothstep(0.0, 0.15, abs(d));
              col += vec3(0.95, 0.65, 0.25) * term * 0.35;
              gl_FragColor = vec4(col, 0.55);
            }
          `}
        />
      </mesh>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.12, 64, 64]} />
        <meshBasicMaterial color="#5cbdb9" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Satellite({
  node,
  onClick,
  selected,
}: {
  node: SatNode;
  onClick: () => void;
  selected: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const pos = useMemo(
    () => latLonToVec3(node.lat, node.lon, EARTH_R + 0.35 + node.alt * 0.5),
    [node.lat, node.lon, node.alt],
  );

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2 + node.lat) * 0.08;
      ref.current.scale.setScalar(selected ? s * 1.6 : s);
    }
  });

  const color = node.failed
    ? "#ef4444"
    : node.inEclipse
      ? "#64748b"
      : "#10b981";
  const opacity = node.inEclipse ? 0.5 : 1;

  return (
    <group ref={ref} position={pos} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function LaserLink({
  a,
  b,
  state,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  state: "active" | "failed" | "dim";
}) {
  const points = useMemo(() => {
    const mid = a.clone().lerp(b, 0.5).multiplyScalar(1.08);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return curve.getPoints(32);
  }, [a, b]);

  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  const color = state === "failed" ? "#ef4444" : state === "dim" ? "#3b6fa0" : "#10b981";
  const opacity = state === "active" ? 0.7 : state === "dim" ? 0.2 : 0.6;

  return (
    <line>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

export function OrbitalGlobe({
  nodes,
  links,
  onSelectNode,
  selectedId,
}: {
  nodes: SatNode[];
  links: Array<{ from: string; to: string; state: "active" | "failed" | "dim" }>;
  onSelectNode: (n: SatNode | null) => void;
  selectedId?: string | null;
}) {
  const sunDir = useMemo(() => new THREE.Vector3(5, 1.5, 3), []);
  const positions = useMemo(() => {
    const m = new Map<string, THREE.Vector3>();
    nodes.forEach((n) => m.set(n.id, latLonToVec3(n.lat, n.lon, EARTH_R + 0.35 + n.alt * 0.5)));
    return m;
  }, [nodes]);

  // Lógica de câmara responsiva adicionada aqui
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Executa ao carregar o componente
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Define a distância da câmara baseada no tamanho da tela
  const cameraZ = isMobile ? 11 : 6.5;

  return (
    <Canvas
      camera={{ position: [0, 1.5, cameraZ], fov: 45 }}
      onPointerMissed={() => onSelectNode(null)}
    >
      <color attach="background" args={["#0a0f1f"]} />
      <Suspense fallback={null}>
        <Stars radius={60} depth={40} count={3000} factor={3} fade speed={0.5} />
        <ambientLight intensity={0.4} />
        <directionalLight position={sunDir} intensity={1.2} />
        <Earth sunDir={sunDir} />

        {links.map((l, i) => {
          const a = positions.get(l.from);
          const b = positions.get(l.to);
          if (!a || !b) return null;
          return <LaserLink key={i} a={a} b={b} state={l.state} />;
        })}

        {nodes.map((n) => (
          <Satellite
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            onClick={() => onSelectNode(n)}
          />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={4}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={0.4}
        />
      </Suspense>
    </Canvas>
  );
}