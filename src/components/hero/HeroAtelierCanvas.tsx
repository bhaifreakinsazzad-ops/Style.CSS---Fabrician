import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeroAtelierCanvasProps {
  intensity?: number;
}

export const HeroAtelierCanvas: React.FC<HeroAtelierCanvasProps> = ({ intensity = 1 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const intensityRef = useRef<number>(intensity);
  const [disabledFallback, setDisabledFallback] = useState(false);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisabledFallback(true);
      return;
    }

    // Software WebGL detection per threejs guidelines
    const isSoftwareGl = (() => {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 40);
    camera.position.set(0, 0.3, 6.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setDisabledFallback(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);

    // 1. Custom GLSL ShaderMaterial Woven Jamdani Gold Silk Wave Ribbon
    const ribbonGeo = new THREE.PlaneGeometry(14, 4.6, isSoftwareGl ? 48 : 96, isSoftwareGl ? 18 : 36);
    const ribbonMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: intensityRef.current },
        uGoldCore: { value: new THREE.Color(0xd5ba80) },
        uGoldDeep: { value: new THREE.Color(0x8e723d) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vUv = uv;
          vec3 pos = position;

          float waveA = sin(pos.x * 0.72 + uTime * 0.65) * 0.36;
          float waveB = cos(pos.y * 1.4 - uTime * 0.45 + pos.x * 0.25) * 0.22;
          float pointerRipple = sin(distance(pos.xy, uPointer * 3.5) * 1.6 - uTime * 1.4) * 0.12;

          pos.z += waveA + waveB + pointerRipple;
          pos.y += sin(pos.x * 0.4 + uTime * 0.35) * 0.18 + uPointer.y * 0.25;

          vElevation = waveA + waveB;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uGoldCore;
        uniform vec3 uGoldDeep;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          // Subtle artisanal warp-weft grid lines
          float warp = pow(abs(sin(vUv.x * 95.0)), 14.0);
          float weft = pow(abs(sin(vUv.y * 40.0 + uTime * 0.15)), 16.0);
          float diamondMotif = pow(abs(sin((vUv.x * 16.0 + vUv.y * 8.0) * 3.14159)), 20.0);

          float threadPattern = max(warp * 0.55, weft * 0.45) + diamondMotif * 0.35;

          // Vignette fade at horizontal and vertical edges so text contrast stays clean
          float edgeFade = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)
                         * smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);

          float shimmer = 0.55 + 0.45 * clamp(vElevation * 1.5 + 0.5, 0.0, 1.0);
          vec3 color = mix(uGoldDeep, uGoldCore, shimmer);
          float alpha = threadPattern * edgeFade * 0.22 * uIntensity;

          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.rotation.set(-0.38, 0.06, -0.08);
    ribbonMesh.position.set(0, -0.35, -0.5);
    scene.add(ribbonMesh);

    // 2. Floating Woven Gold Dust Micro-Filaments
    const particleCount = isSoftwareGl ? 70 : 180;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      speeds[i] = 0.25 + Math.random() * 0.65;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0xd5ba80,
      size: 0.045,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Pointer tracking smoothed with THREE.MathUtils.damp
    const targetPointer = { x: 0, y: 0 };
    const currentPointer = { x: 0, y: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      targetPointer.x = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      targetPointer.y = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setDisabledFallback(true);
    };
    const handleContextRestored = () => {
      setDisabledFallback(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    let rafId = 0;
    let isVisible = true;
    const clock = new THREE.Clock();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container) return;
      const nextW = Math.max(container.clientWidth, 1);
      const nextH = Math.max(container.clientHeight, 1);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const animateLoop = () => {
      rafId = requestAnimationFrame(animateLoop);
      if (!isVisible || document.hidden) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const activeIntensity = intensityRef.current;

      currentPointer.x = THREE.MathUtils.damp(currentPointer.x, targetPointer.x, 4.5, delta);
      currentPointer.y = THREE.MathUtils.damp(currentPointer.y, targetPointer.y, 4.5, delta);

      ribbonMat.uniforms.uTime.value = elapsed;
      ribbonMat.uniforms.uPointer.value.set(currentPointer.x, currentPointer.y);
      ribbonMat.uniforms.uIntensity.value = THREE.MathUtils.damp(
        ribbonMat.uniforms.uIntensity.value,
        activeIntensity,
        5,
        delta
      );

      particles.rotation.y = currentPointer.x * 0.08 + elapsed * 0.015;
      particles.rotation.x = currentPointer.y * 0.05;
      particlesMat.opacity = 0.4 * activeIntensity;

      const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i) + speeds[i] * delta * 0.14;
        if (y > 3.8) y = -3.8;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, currentPointer.x * 0.25, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.3 + currentPointer.y * 0.16, 4, delta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animateLoop();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      ribbonGeo.dispose();
      ribbonMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (disabledFallback) return null;

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 z-[1] pointer-events-none opacity-90"
    />
  );
};
