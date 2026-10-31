import { Canvas } from '@react-three/fiber';
import { Component, Suspense, useState, type ReactNode } from 'react';
import WebGLFallback from './components/WebGLFallback';
import { useWebGLSupport } from './hooks/useWebGLSupport';

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

  if (!isSupported || contextLostMessage) {
    return <WebGLFallback message={contextLostMessage ?? errorMessage} />;
  }

  return (
    <CanvasErrorBoundary>
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
          onCreated={({ gl }) => {
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
