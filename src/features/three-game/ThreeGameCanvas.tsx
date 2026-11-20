import { Canvas } from '@react-three/fiber';
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import WebGLFallback from './components/WebGLFallback';
import { useWebGLSupport } from './hooks/useWebGLSupport';
import { getActiveGraphicsProfile, type GraphicsProfile } from './config/graphicsQuality';

type ThreeGameCanvasProps = {
  children: ReactNode;
};

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMessage?: string }
> {
  state = { hasError: false, errorMessage: undefined as string | undefined };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : '3D renderer initialization failed.',
    };
  }

  render() {
    if (this.state.hasError) {
      return <WebGLFallback message={this.state.errorMessage} />;
    }
    return this.props.children;
  }
}

export default function ThreeGameCanvas({ children }: ThreeGameCanvasProps) {
  const { isSupported, errorMessage } = useWebGLSupport();
  const [contextLostMessage, setContextLostMessage] = useState<string | undefined>(undefined);
  const [isBooting, setIsBooting] = useState(true);
  const [profile, setProfile] = useState<GraphicsProfile>(getActiveGraphicsProfile);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsBooting(false), 250);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleProfileChange = () => {
      setProfile(getActiveGraphicsProfile());
    };
    window.addEventListener('khmer:graphics-quality-change', handleProfileChange);
    return () => window.removeEventListener('khmer:graphics-quality-change', handleProfileChange);
  }, []);

  if (contextLostMessage || (!isSupported && !isBooting)) {
    return <WebGLFallback message={contextLostMessage ?? errorMessage} />;
  }

  return (
    <CanvasErrorBoundary>
      <div className="relative h-full w-full select-none overflow-hidden bg-gradient-to-b from-[#0284C7] via-[#38BDF8] to-[#FDE68A]">
        <Canvas
          shadows={profile.shadows}
          camera={{ position: [0, 3.2, -7.2], fov: 54, near: 0.1, far: profile.maxDrawDistance }}
          dpr={[profile.dprMin, profile.dprMax]}
          gl={{
            antialias: profile.quality !== 'low',
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
            gl.outputColorSpace = THREE.SRGBColorSpace;
            if (profile.shadows) {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }
            if (import.meta.env.DEV) {
              const debugWindow = window as typeof window & {
                __threeRenderStats?: () => { calls: number; triangles: number; points: number; lines: number };
              };
              debugWindow.__threeRenderStats = () => ({ ...gl.info.render });
            }

            const canvas = gl.domElement;
            const handleContextLost = (event: Event) => {
              event.preventDefault();
              setContextLostMessage('WebGL graphics context was lost.');
            };
            canvas.addEventListener('webglcontextlost', handleContextLost, { once: true });
          }}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
