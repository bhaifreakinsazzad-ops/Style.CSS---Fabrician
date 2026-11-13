import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sparkles, ChevronUp, ChevronDown, RotateCcw, Wind } from 'lucide-react';
import { ThreePieceItem } from '../../data/threePieceCatalog';

interface ThreePiece3DViewerProps {
  selectedItem: ThreePieceItem;
  onClose?: () => void;
}

export const ThreePiece3DViewer: React.FC<ThreePiece3DViewerProps> = ({
  selectedItem,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudExpanded, setHudExpanded] = useState<boolean>(true);
  const [activeFinish, setActiveFinish] = useState<'lawn' | 'batik' | 'mirror' | 'silk'>('lawn');
  const [waveSpeed, setWaveSpeed] = useState<number>(1.2);
  const [activeViewPreset, setActiveViewPreset] = useState<'front' | 'macro' | 'shoulder' | 'flat'>('front');
  const [contextLost, setContextLost] = useState<boolean>(false);

  // Three.js mutable state refs
  const waveSpeedRef = useRef<number>(waveSpeed);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const fabricMeshRef = useRef<THREE.Mesh | null>(null);
  const dupattaMeshRef = useRef<THREE.Mesh | null>(null);
  const fabricMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 2.8));
  const isDragging = useRef<boolean>(false);
  const previousPointerX = useRef<number>(0);
  const previousPointerY = useRef<number>(0);
  const rotationGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    waveSpeedRef.current = waveSpeed;
  }, [waveSpeed]);

  // Generate procedural woven/batik canvas texture for the active product
  const createProceduralTexture = (item: ThreePieceItem, finish: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base background color from product palette
    const baseColor = item.colors[0]?.hex || '#16223B';
    const accentColor = item.colors[1]?.hex || '#E5A93B';
    const contrastColor = item.colors[2]?.hex || '#FFFFFF';

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // Micro fabric grain lines (high resolution weave simulation)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1024; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();
    }

    if (finish === 'batik' || item.subCollection === 'Alfi Boutique' || item.subCollection === 'Mome Boutique') {
      // Batik wax crackle effect and organic circular swirls
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 28; i++) {
        const cx = (i * 137) % 1024;
        const cy = (i * 219) % 1024;
        ctx.beginPath();
        ctx.arc(cx, cy, 32 + (i % 24), 0, Math.PI * 2);
        ctx.stroke();

        // Radiating crackle lines
        for (let j = 0; j < 6; j++) {
          const angle = (j * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70);
          ctx.stroke();
        }
      }
    } else if (finish === 'mirror' || item.subCollection === 'Embroidery & Mirror') {
      // Diamond embroidery grid with reflective mirror circles
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.85;
      const step = 80;
      for (let x = 0; x < 1024; x += step) {
        for (let y = 0; y < 1024; y += step) {
          ctx.strokeRect(x + step / 4, y + step / 4, step / 2, step / 2);

          // Mirror medallion at intersections
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Swiss Lawn Royal Botanical Paisley & Leaf Vignettes
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 40; i++) {
        const x = (i * 93) % 980 + 30;
        const y = (i * 127) % 980 + 30;
        ctx.beginPath();
        ctx.ellipse(x, y, 18, 38, (i * 45 * Math.PI) / 180, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = contrastColor;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentColor;
      }
    }

    // Border decorative band (representing the tailored hem)
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 930, 1024, 94);
    ctx.fillStyle = contrastColor;
    ctx.fillRect(0, 955, 1024, 12);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    return texture;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.Fog(0x09090b, 3.5, 7.5);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20);
    camera.position.set(0, 0.4, 2.8);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 3. Studio Environment Map (PMREMGenerator + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.HemisphereLight(0xfff8ee, 0x111116, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.4);
    keyLight.position.set(2.5, 4.0, 3.0);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd5ba80, 1.8);
    rimLight.position.set(-3.0, 2.0, -2.5);
    scene.add(rimLight);

    // 5. Procedural 3D Model: Mannequin + 3-Piece Draped Ensemble
    const rotationGroup = new THREE.Group();
    scene.add(rotationGroup);
    rotationGroupRef.current = rotationGroup;

    // A. Mannequin Torso & Stand (Matte Ebony Ceramic)
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.35,
      metalness: 0.2,
    });

    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.9, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = 0.45;
    torsoMesh.castShadow = !isSoftwareGl;
    rotationGroup.add(torsoMesh);

    const shoulderGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.22, 32);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, torsoMat);
    shoulderMesh.position.y = 0.85;
    rotationGroup.add(shoulderMesh);

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.25, 24);
    const neckMesh = new THREE.Mesh(neckGeo, torsoMat);
    neckMesh.position.y = 1.05;
    rotationGroup.add(neckMesh);

    const rodGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 16);
    const rodMesh = new THREE.Mesh(rodGeo, torsoMat);
    rodMesh.position.y = -0.4;
    rotationGroup.add(rodMesh);

    const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.06, 32);
    const baseMesh = new THREE.Mesh(baseGeo, torsoMat);
    baseMesh.position.y = -0.98;
    rotationGroup.add(baseMesh);

    // B. Draped Kameez Front Fabric Mesh with Subdivision for Vertex Wave Physics
    const fabricTex = createProceduralTexture(selectedItem, activeFinish);
    const fabricMat = new THREE.MeshPhysicalMaterial({
      map: fabricTex,
      roughness: activeFinish === 'mirror' ? 0.2 : 0.65,
      metalness: activeFinish === 'mirror' ? 0.4 : 0.05,
      clearcoat: activeFinish === 'mirror' ? 0.8 : 0.15,
      side: THREE.DoubleSide,
    });
    fabricMaterialRef.current = fabricMat;

    const fabricGeo = new THREE.PlaneGeometry(0.72, 1.25, 36, 48);
    const posAttr = fabricGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const zOffset = -Math.cos(x * 3.5) * 0.12 + 0.14;
      posAttr.setZ(i, zOffset);
    }
    fabricGeo.computeVertexNormals();

    const fabricMesh = new THREE.Mesh(fabricGeo, fabricMat);
    fabricMesh.position.set(0, 0.4, 0.1);
    fabricMesh.castShadow = !isSoftwareGl;
    fabricMesh.receiveShadow = !isSoftwareGl;
    rotationGroup.add(fabricMesh);
    fabricMeshRef.current = fabricMesh;

    // C. Flowing Dupatta Drape over left shoulder
    const dupattaGeo = new THREE.PlaneGeometry(0.38, 1.5, 28, 36);
    const dupattaMat = new THREE.MeshPhysicalMaterial({
      map: fabricTex,
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
    });
    const dupattaMesh = new THREE.Mesh(dupattaGeo, dupattaMat);
    dupattaMesh.position.set(-0.35, 0.35, 0.16);
    dupattaMesh.rotation.set(0.1, 0.2, -0.15);
    rotationGroup.add(dupattaMesh);
    dupattaMeshRef.current = dupattaMesh;

    // D. Soft Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.0;
    scene.add(shadowMesh);

    // 6. Interactive Drag to Rotate Mannequin
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerX.current = clientX;
      previousPointerY.current = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !rotationGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - previousPointerX.current;
      const deltaY = clientY - previousPointerY.current;

      rotationGroupRef.current.rotation.y += deltaX * 0.008;
      rotationGroupRef.current.rotation.x = Math.max(
        -0.2,
        Math.min(0.2, rotationGroupRef.current.rotation.x + deltaY * 0.003)
      );

      previousPointerX.current = clientX;
      previousPointerY.current = clientY;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    dom.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    dom.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 7. Animation Loop with Organic Fabric Wave Physics
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const originalPositions = fabricGeo.attributes.position.clone();
    const originalDupattaPositions = dupattaGeo.attributes.position.clone();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const currentSpeed = waveSpeedRef.current;

      // Idle smooth auto-rotation when user is not dragging
      if (!isDragging.current && rotationGroupRef.current) {
        rotationGroupRef.current.rotation.y += 0.003;
      }

      // Smooth camera position damping
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPos.current, 0.05);
      }

      // Procedural Fabric Wave Dynamics
      if (fabricMeshRef.current) {
        const positions = fabricMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const u = positions.getX(i);
          const v = positions.getY(i);
          const origZ = originalPositions.getZ(i);

          const wave =
            Math.sin(v * 4.0 + elapsedTime * currentSpeed * 2.0) * 0.025 +
            Math.cos(u * 5.0 + elapsedTime * currentSpeed * 1.5) * 0.015;

          positions.setZ(i, origZ + wave);
        }
        positions.needsUpdate = true;
      }

      // Dupatta Wave
      if (dupattaMeshRef.current) {
        const dPositions = dupattaMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < dPositions.count; i++) {
          const v = dPositions.getY(i);
          const origZ = originalDupattaPositions.getZ(i);
          const wave = Math.sin(v * 3.5 + elapsedTime * currentSpeed * 2.5) * 0.04;
          dPositions.setZ(i, origZ + wave);
        }
        dPositions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 8. Resize Handler + ResizeObserver
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nextWidth = Math.max(container.clientWidth, 1);
      const nextHeight = Math.max(container.clientHeight, 1);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);
      dom.removeEventListener('mousedown', handlePointerDown);
      dom.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      dom.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      envTarget.dispose();
      fabricGeo.dispose();
      dupattaGeo.dispose();
      torsoGeo.dispose();
      shoulderGeo.dispose();
      neckGeo.dispose();
      rodGeo.dispose();
      baseGeo.dispose();
      shadowGeo.dispose();
      fabricTex.dispose();
      fabricMat.dispose();
      dupattaMat.dispose();
      torsoMat.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, [selectedItem, activeFinish]);

  // View Preset Handler
  const handleSetPreset = (preset: 'front' | 'macro' | 'shoulder' | 'flat') => {
    setActiveViewPreset(preset);
    if (preset === 'front') {
      targetCameraPos.current.set(0, 0.4, 2.8);
      if (rotationGroupRef.current) rotationGroupRef.current.rotation.set(0, 0, 0);
    } else if (preset === 'macro') {
      targetCameraPos.current.set(0, 0.45, 1.4);
    } else if (preset === 'shoulder') {
      targetCameraPos.current.set(-0.8, 0.6, 2.0);
      if (rotationGroupRef.current) rotationGroupRef.current.rotation.y = 0.5;
    } else if (preset === 'flat') {
      targetCameraPos.current.set(0, 0.4, 2.2);
      if (rotationGroupRef.current) {
        rotationGroupRef.current.rotation.x = 0.3;
        rotationGroupRef.current.rotation.y = 0;
      }
    }
  };

  const handleResetRotation = () => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.set(0, 0, 0);
    }
    targetCameraPos.current.set(0, 0.4, 2.8);
    setActiveViewPreset('front');
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-2xl overflow-hidden bg-[#09090B] border border-white/10 shadow-2xl">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {contextLost && (
        <div className="absolute inset-0 bg-[#09090B]/95 flex flex-col items-center justify-center text-center p-6 z-30">
          <p className="font-serif-luxury text-xl text-[#F5F2EB] mb-2">Restoring 3D Textile Viewport</p>
          <p className="text-xs font-mono text-[#77777D]">Graphics context interrupted — reinitializing studio...</p>
        </div>
      )}

      {/* Top Spec Badge */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 border border-white/10 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#B69A60]" />
          <span className="text-[#D5BA80] font-semibold">{selectedItem.code}</span>
          <span className="text-white/20">·</span>
          <span className="text-[#F5F2EB]">{selectedItem.nameEn}</span>
        </div>

        <button
          onClick={handleResetRotation}
          className="pointer-events-auto p-2 rounded-full bg-black/90 border border-white/10 hover:border-[#B69A60] text-[#D8D3C9] hover:text-white transition-colors cursor-pointer"
          title="Reset 3D Perspective"
          aria-label="Reset 3D Perspective"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Touch Interaction Hint */}
      <div className="absolute top-16 left-5 text-[11px] font-mono text-[#77777D] pointer-events-none">
        Drag to inspect 360° · Real-time drape dynamics
      </div>

      {/* Unified Bottom Control Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-20 transition-all duration-300">
        {/* Toggle Collapse/Expand Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setHudExpanded(!hudExpanded)}
            className="px-3 py-1 rounded-t-lg bg-[#171719] border border-b-0 border-white/15 text-[11px] font-mono uppercase tracking-wider text-[#D8D3C9] hover:text-white flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            {hudExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>Hide Controls</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>Show 3D Studio Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Surface (Solid/High-Contrast surface over WebGL) */}
        {hudExpanded && (
          <div className="p-4 rounded-xl bg-[#171719]/95 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* View Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#77777D] mr-1 hidden sm:inline">
                Preset:
              </span>
              {[
                { id: 'front', label: 'Front Drape' },
                { id: 'macro', label: 'Fabric Macro' },
                { id: 'shoulder', label: 'Shoulder View' },
                { id: 'flat', label: 'Flat-Lay' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSetPreset(p.id as 'front' | 'macro' | 'shoulder' | 'flat')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    activeViewPreset === p.id
                      ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                      : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Fabric Material Finish Swatches */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-[#77777D] hidden md:inline">
                Texture Weave:
              </span>
              {[
                { id: 'lawn', label: 'Swiss Lawn' },
                { id: 'batik', label: 'Wax Batik' },
                { id: 'mirror', label: 'Mirror Zari' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFinish(f.id as 'lawn' | 'batik' | 'mirror')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    activeFinish === f.id
                      ? 'border border-[#B69A60] text-[#D5BA80] bg-[#B69A60]/10 font-bold'
                      : 'border border-white/10 text-[#77777D] hover:text-[#D8D3C9]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Ripple Wave Speed Slider */}
            <div className="flex items-center gap-2 text-[#77777D] font-mono text-[10px]">
              <Wind className="w-3.5 h-3.5 text-[#B69A60]" />
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={waveSpeed}
                onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B69A60]"
                aria-label="Fabric Wave Intensity"
                title="Fabric Wave Intensity"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
