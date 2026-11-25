import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const GREEN = '#17693a';
const DEEP = '#0f3d22';
const SAGE = '#dfe9e1';
const SAND = '#e2b04a';

const SCREENS = ['/screens/qaya.webp', '/screens/thek.webp', '/screens/premiumphone.webp', '/screens/corny.webp', '/screens/khaleet.webp'];

/** One floating storefront: a thin rounded slab with the screenshot on its face. */
function Screen({ url, position, rotation, delay }) {
  const tex = useTexture(url);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  const w = 2.05, h = 1.28;
  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.45} floatingRange={[-0.06, 0.06]} position={position} rotation={rotation}>
      <group>
        <RoundedBox args={[w + 0.08, h + 0.2, 0.05]} radius={0.04} smoothness={4} position={[0, -0.04, -0.03]}>
          <meshStandardMaterial color="#fbfdfb" roughness={0.35} metalness={0.05} />
        </RoundedBox>
        {/* browser bar dots */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-w / 2 + 0.1 + i * 0.07, h / 2 - 0.0, 0.0]}>
            <circleGeometry args={[0.018, 16]} />
            <meshBasicMaterial color={['#e86a5f', '#e9b949', '#5bb974'][i]} />
          </mesh>
        ))}
        <mesh position={[0, -0.08, 0.0]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

/** The stage (منصّة): three stepped tiers with a gold ring and studs that make its rotation readable. */
function Podium() {
  const ref = useRef();
  const studs = useMemo(() => Array.from({ length: 28 }, (_, i) => (i / 28) * Math.PI * 2), []);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.12; });
  return (
    <group ref={ref} position={[0, -1.55, 0]}>
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.1, 3.25, 0.42, 96]} />
        <meshStandardMaterial color={DEEP} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[2.55, 2.7, 0.34, 96]} />
        <meshStandardMaterial color={GREEN} roughness={0.45} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[2.0, 2.1, 0.26, 96]} />
        <meshStandardMaterial color={SAGE} roughness={0.3} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.62, 0.025, 16, 128]} />
        <meshStandardMaterial color={SAND} roughness={0.25} metalness={0.85} />
      </mesh>
      {studs.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 2.9, 0.23, Math.sin(a) * 2.9]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={SAND} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Screens arranged in a shallow arc above the stage; the whole set follows the pointer and the page scroll. */
function Showcase({ reduced }) {
  const group = useRef();
  const { pointer } = useThree();
  const layout = useMemo(() => {
    const n = SCREENS.length;
    return SCREENS.map((url, i) => {
      const t = i - (n - 1) / 2;
      const a = t * 0.42;
      return {
        url,
        position: [Math.sin(a) * 3.2, 0.55 + Math.abs(t) * -0.12 + (i % 2 ? 0.28 : 0), Math.cos(a) * 1.6 - 1.4 - Math.abs(t) * 0.35],
        rotation: [0, -a * 0.9, 0],
        delay: i,
      };
    });
  }, []);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const scrollT = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
    const targetY = pointer.x * 0.22 + idle + scrollT * 0.6;
    const targetX = -pointer.y * 0.08 + scrollT * 0.12;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, 0.15 - scrollT * 0.6, 3, dt);
  });
  return (
    <group ref={group} scale={0.78} position={[0, 0.15, 0]}>
      {layout.map((s) => <Screen key={s.url} {...s} />)}
      <Podium />
    </group>
  );
}

function useVisible(ref) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

export default function HeroScene() {
  const wrap = useRef();
  const visible = useVisible(wrap);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const small = typeof window !== 'undefined' && window.innerWidth < 760;
  return (
    <div ref={wrap} className="hero-canvas" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, small ? 1.5 : 2]}
        camera={{ position: [0, 1.0, small ? 10.2 : 9.6], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 7, 5]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={null}>
          <Showcase reduced={reduced} />
          <Environment resolution={128}>
            <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[12, 3, 1]} />
            <Lightformer intensity={1.2} color={SAND} position={[-6, 1, 2]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
            <Lightformer intensity={1} position={[6, 2, 3]} scale={[3, 5, 1]} rotation-y={-Math.PI / 2} />
          </Environment>
        </Suspense>
        <ContactShadows position={[0, -1.36, 0]} opacity={0.32} scale={12} blur={2.6} far={4} color="#0f3d22" />
      </Canvas>
    </div>
  );
}
