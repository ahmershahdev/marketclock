"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CITIES = [
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Toronto", lat: 43.65, lon: -79.38 },
  { name: "Sao Paulo", lat: -23.55, lon: -46.63 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Frankfurt", lat: 50.11, lon: 8.68 },
  { name: "Johannesburg", lat: -26.2, lon: 28.04 },
  { name: "Riyadh", lat: 24.71, lon: 46.68 },
  { name: "Karachi", lat: 24.86, lon: 67.0 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Hong Kong", lat: 22.32, lon: 114.17 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
];

const ROUTES: [string, string][] = [
  ["New York", "London"],
  ["London", "Frankfurt"],
  ["London", "Riyadh"],
  ["Riyadh", "Karachi"],
  ["Karachi", "Hong Kong"],
  ["Mumbai", "Tokyo"],
  ["Hong Kong", "Sydney"],
  ["Toronto", "Sao Paulo"],
  ["Frankfurt", "Johannesburg"],
  ["New York", "Tokyo"],
];

const DOTS = 7000;

function toVector(lat: number, lon: number, radius = 1) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string) => style.getPropertyValue(name).trim() || "#888888";
  return { dot: get("--ink-3"), base: get("--paper"), accent: get("--signal"), ink: get("--ink") };
}

function useThemeColors() {
  const [colors, setColors] = useState(readColors);
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return colors;
}

function fibonacciSphere(count: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    positions.set([Math.cos(golden * i) * r, y, Math.sin(golden * i) * r], i * 3);
  }
  return positions;
}

const atmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {
      float rim = pow(clamp(-dot(vNormal, vec3(0.0, 0.0, 1.0)) * 1.9, 0.0, 1.0), 2.5);
      gl_FragColor = vec4(uColor, rim * 0.45);
    }`,
};

function Arc({
  from,
  to,
  color,
  offset,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  offset: number;
}) {
  const traveller = useRef<THREE.Mesh>(null);
  const { curve, line } = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const lift = 1 + from.distanceTo(to) * 0.42;
    const curve = new THREE.QuadraticBezierCurve3(from, mid.normalize().multiplyScalar(lift), to);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
    return { curve, line: new THREE.Line(geometry, material) };
  }, [from, to]);

  useEffect(() => {
    (line.material as THREE.LineBasicMaterial).color.set(color);
  }, [line, color]);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.18 + offset) % 1;
    traveller.current?.position.copy(curve.getPoint(t));
  });

  return (
    <>
      <primitive object={line} />
      <mesh ref={traveller}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

function Marker({
  position,
  color,
  phase,
}: {
  position: THREE.Vector3;
  color: string;
  phase: number;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const quaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize(),
      ),
    [position],
  );

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime * 0.6 + phase) % 1;
    ring.current.scale.setScalar(1 + t * 2.4);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t);
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.016, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.022, 0.028, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Earth({ animate }: { animate: boolean }) {
  const colors = useThemeColors();
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dots = useMemo(() => fibonacciSphere(DOTS), []);
  const cities = useMemo(
    () => new Map(CITIES.map((city) => [city.name, toVector(city.lat, city.lon, 1.005)])),
    [],
  );
  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...atmosphereShader,
        uniforms: { uColor: { value: new THREE.Color() } },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    atmosphere.uniforms.uColor.value.set(colors.accent);
  }, [atmosphere, colors.accent]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!group.current || !animate) return;
    group.current.rotation.y += delta * 0.07;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      0.32 + pointer.current.y * 0.3,
      0.04,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      pointer.current.x * -0.15,
      0.04,
    );
  });

  return (
    <>
      <mesh scale={1.14} material={atmosphere}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <group ref={group} rotation={[0.32, -1.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.985, 64, 64]} />
          <meshBasicMaterial color={colors.base} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dots, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={colors.dot}
            size={0.0105}
            sizeAttenuation
            transparent
            opacity={0.85}
          />
        </points>
        {CITIES.map((city, index) => (
          <Marker
            key={city.name}
            position={cities.get(city.name)!}
            color={colors.accent}
            phase={index / CITIES.length}
          />
        ))}
        {ROUTES.map(([a, b], index) => (
          <Arc
            key={`${a}-${b}`}
            from={cities.get(a)!}
            to={cities.get(b)!}
            color={colors.accent}
            offset={index / ROUTES.length}
          />
        ))}
      </group>
    </>
  );
}

export default function GlobeScene() {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [reducedMotion] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrapper.current) observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);

  const animate = visible && !reducedMotion;

  return (
    <div
      ref={wrapper}
      className={`size-full transition-opacity duration-[1500ms] ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <Canvas
        camera={{ position: [0, 0, 4.3], fov: 38 }}
        dpr={[1, 2]}
        flat
        gl={{ antialias: true, alpha: true }}
        frameloop={animate ? "always" : "demand"}
        onCreated={() => setReady(true)}
      >
        <Earth animate={animate} />
      </Canvas>
    </div>
  );
}
