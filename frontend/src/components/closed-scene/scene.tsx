"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion, useThemeColors } from "@/lib/use-theme-colors";

const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
};

const CELL = 0.3;
const GRID_COLUMNS = 31;
const GRID_ROWS = 13;

type Tile = { target: THREE.Vector3; start: THREE.Vector3; delay: number; lit: boolean };

function layout(text: string): Tile[] {
  const random = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const lit = new Set<string>();
  const width = text.length * 6 - 1;
  [...text].forEach((char, index) => {
    (GLYPHS[char] ?? GLYPHS["0"]).forEach((row, y) =>
      [...row].forEach((bit, x) => {
        if (bit === "1")
          lit.add(`${index * 6 + x + Math.floor((GRID_COLUMNS - width) / 2)},${y + 3}`);
      }),
    );
  });

  const tiles: Tile[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      const on = lit.has(`${x},${y}`);
      if (!on && random(x * 31 + y) > 0.42) continue;
      const seed = x * 97 + y * 13;
      tiles.push({
        target: new THREE.Vector3(
          (x - (GRID_COLUMNS - 1) / 2) * CELL,
          ((GRID_ROWS - 1) / 2 - y) * CELL,
          on ? 0 : -0.5,
        ),
        start: new THREE.Vector3(
          (random(seed) - 0.5) * 14,
          (random(seed + 1) - 0.5) * 9,
          (random(seed + 2) - 0.5) * 10 - 4,
        ),
        delay: on ? random(seed + 3) * 0.5 : 0.3 + random(seed + 4) * 0.8,
        lit: on,
      });
    }
  }
  return tiles;
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);

function placeTiles(
  mesh: THREE.InstancedMesh | null,
  tiles: readonly Tile[],
  depth: number,
  time: number,
  pointer: THREE.Vector3,
  helper: THREE.Object3D,
) {
  if (!mesh) return;
  tiles.forEach((tile, index) => {
    const t = easeOut((time - tile.delay) / 1.6);
    helper.position.lerpVectors(tile.start, tile.target, t);
    const distance = Math.hypot(tile.target.x - pointer.x, tile.target.y - pointer.y);
    const push = Math.max(0, 1 - distance / 1.4);
    const wave = Math.sin(time * 1.4 - tile.target.x * 0.6 - tile.target.y * 0.4);
    helper.position.z += (wave * 0.06 + push * 0.55) * depth * t;
    helper.rotation.set(
      (1 - t) * 3 + push * 0.9 + wave * 0.05,
      (1 - t) * -2.4 + push * 0.6,
      (1 - t) * 1.2,
    );
    helper.scale.setScalar(0.2 + 0.8 * t);
    helper.updateMatrix();
    mesh.setMatrixAt(index, helper.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

function Tiles({ text, animate }: { text: string; animate: boolean }) {
  const colors = useThemeColors();
  const tiles = useMemo(() => layout(text), [text]);
  const lit = useMemo(() => tiles.filter((tile) => tile.lit), [tiles]);
  const dim = useMemo(() => tiles.filter((tile) => !tile.lit), [tiles]);
  const litMesh = useRef<THREE.InstancedMesh>(null);
  const dimMesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const moved = useRef(false);
  const hit = useRef(new THREE.Vector3(100, 100, 0));
  const { camera, invalidate } = useThree();
  const three = useRef({
    helper: new THREE.Object3D(),
    raycaster: new THREE.Raycaster(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
  });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      moved.current = true;
      pointer.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => invalidate(), [colors, invalidate]);

  useFrame(({ clock }) => {
    const { helper, raycaster, plane } = three.current;
    const time = animate ? clock.elapsedTime : 10;
    if (moved.current) {
      raycaster.setFromCamera(pointer.current, camera);
      raycaster.ray.intersectPlane(plane, hit.current);
    }

    placeTiles(litMesh.current, lit, 1, time, hit.current, helper);
    placeTiles(dimMesh.current, dim, 0.5, time, hit.current, helper);

    if (group.current && animate) {
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        pointer.current.y * -0.18,
        0.05,
      );
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        pointer.current.x * 0.28,
        0.05,
      );
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={litMesh} args={[undefined, undefined, lit.length]}>
        <boxGeometry args={[CELL * 0.86, CELL * 0.86, CELL * 0.86]} />
        <meshStandardMaterial color={colors.closed} roughness={0.35} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={dimMesh} args={[undefined, undefined, dim.length]}>
        <boxGeometry args={[CELL * 0.7, CELL * 0.7, CELL * 0.12]} />
        <meshStandardMaterial color={colors.dot} roughness={0.8} transparent opacity={0.45} />
      </instancedMesh>
    </group>
  );
}

export default function ClosedScene({ text }: { text: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrapper.current) observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);

  const animate = visible && !reducedMotion;

  return (
    <div
      ref={wrapper}
      className={`size-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop={animate ? "always" : "demand"}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 8]} intensity={2.2} />
        <directionalLight position={[-6, -3, 4]} intensity={0.6} />
        <Tiles text={text} animate={animate} />
      </Canvas>
    </div>
  );
}
