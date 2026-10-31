import { Canvas } from '@react-three/fiber';
import { Suspense, type ReactNode } from 'react';
import WebGLFallback from './components/WebGLFallback';
import { useWebGLSupport } from './hooks/useWebGLSupport';

type ThreeGameCanvasProps = {
  children: ReactNode;
};

export default function ThreeGameCanvas({ children }: ThreeGameCanvasProps) {
  const { isSupported, errorMessage } = useWebGLSupport();

  if (!isSupported) {
    return <WebGLFallback message={errorMessage} />;
  }

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#0A1118]">
      <Canvas
        camera={{ position: [0, 3, -6], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
