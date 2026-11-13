import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  X, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Wind, 
  Sun, 
  ShoppingBag,
  Check
} from 'lucide-react';
import { Product, Language, CartItem } from '../../types';

interface GarmentTryOn3DModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: Omit<CartItem, 'id'>) => void;
  language: Language;
}

export const GarmentTryOn3DModal: React.FC<GarmentTryOn3DModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  language,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudExpanded, setHudExpanded] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<'full' | 'collar' | 'shoulder' | 'side'>('full');
  const [activeSize, setActiveSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [fabricWeave, setFabricWeave] = useState<'cotton' | 'silk' | 'linen' | 'brocade'>('cotton');
  const [lightingPreset, setLightingPreset] = useState<'atelier' | 'golden' | 'dramatic'>('atelier');
  const [waveSpeed, setWaveSpeed] = useState<number>(1.1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  // Three.js mutable state refs
  const waveSpeedRef = useRef<number>(waveSpeed);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rotationGroupRef = useRef<THREE.Group | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const fabricMeshRef = useRef<THREE.Mesh | null>(null);
  const dupattaMeshRef = useRef<THREE.Mesh | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 3.1));

  // Pointer drag state
  const isDragging = useRef<boolean>(false);
  const previousPointerX = useRef<number>(0);
  const previousPointerY = useRef<number>(0);

  useEffect(() => {
    waveSpeedRef.current = waveSpeed;
  }, [waveSpeed]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Procedural dynamic texture generation tailored to the product color & fabric
  const createProductTexture = (prod: Product, weave: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const baseColor = prod.colors[0]?.hex || '#1E1B18';
    const accentColor = prod.colors[1]?.hex || '#C6A767';
    const highlightColor = prod.colors[2]?.hex || '#FFFFFF';

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // Microscopic textile grain weave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
    for (let x = 0; x < 1024; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    if (weave === 'silk') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      for (let d = -1024; d < 2048; d += 16) {
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + 1024, 1024);
        ctx.stroke();
      }
    } else if (weave === 'brocade' || weave === 'linen') {
      ctx.strokeStyle = accentColor;
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.65;
      const step = 64;
      for (let x = 0; x < 1024; x += step) {
        for (let y = 0; y < 1024; y += step) {
          ctx.strokeRect(x + 16, y + 16, 32, 32);
          ctx.beginPath();
          ctx.arc(x + 32, y + 32, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.strokeStyle = accentColor;
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 36; i++) {
        const x = (i * 127) % 1000 + 12;
        const y = (i * 191) % 1000 + 12;
        ctx.strokeRect(x, y, 14, 14);
      }
    }

    // Collar / Placket embroidery band simulation
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = accentColor;
    ctx.fillRect(496, 0, 32, 450);
    ctx.fillStyle = highlightColor;
    for (let btnY = 60; btnY < 420; btnY += 70) {
      ctx.beginPath();
      ctx.arc(512, btnY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Hem band border
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 940, 1024, 84);
    ctx.fillStyle = highlightColor;
    ctx.fillRect(0, 960, 1024, 6);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.2, 1.2);
    return texture;
  };

  useEffect(() => {
    if (!isOpen || !product) return;
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
    scene.background = new THREE.Color(0x0a0a0d);
    scene.fog = new THREE.Fog(0x0a0a0d, 4.0, 9.0);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 25);
    camera.position.set(0, 0.45, 3.1);
    cameraRef.current = camera;

    // 2. High-Performance Renderer
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

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 3. Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x111116, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    keyLight.position.set(2.5, 4.2, 3.0);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const rimLight = new THREE.DirectionalLight(0xd5ba80, 1.8);
    rimLight.position.set(-3.0, 2.5, -2.5);
    scene.add(rimLight);

    const frontFillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontFillLight.position.set(0, 1.5, 3.5);
    scene.add(frontFillLight);

    // 5. Procedural 3D Subject Group
    const rotationGroup = new THREE.Group();
    scene.add(rotationGroup);
    rotationGroupRef.current = rotationGroup;

    // A. Mannequin Torso & Stand
    const mannequinGroup = new THREE.Group();
    rotationGroup.add(mannequinGroup);
    mannequinGroupRef.current = mannequinGroup;

    const mannequinMat = new THREE.MeshStandardMaterial({
      color: 0x151518,
      roughness: 0.28,
      metalness: 0.35,
    });

    const brassAccentMat = new THREE.MeshStandardMaterial({
      color: 0xb69a60,
      roughness: 0.18,
      metalness: 0.9,
    });

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.28, 32);
    const neckMesh = new THREE.Mesh(neckGeo, mannequinMat);
    neckMesh.position.y = 1.08;
    mannequinGroup.add(neckMesh);

    const neckCapGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.04, 32);
    const neckCapMesh = new THREE.Mesh(neckCapGeo, brassAccentMat);
    neckCapMesh.position.y = 1.23;
    mannequinGroup.add(neckCapMesh);

    const shoulderGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.22, 32);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, mannequinMat);
    shoulderMesh.position.y = 0.86;
    mannequinGroup.add(shoulderMesh);

    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.21, 0.85, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, mannequinMat);
    torsoMesh.position.y = 0.44;
    mannequinGroup.add(torsoMesh);

    const rodGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.35, 24);
    const rodMesh = new THREE.Mesh(rodGeo, brassAccentMat);
    rodMesh.position.y = -0.42;
    mannequinGroup.add(rodMesh);

    const baseGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.08, 32);
    const baseMesh = new THREE.Mesh(baseGeo, mannequinMat);
    baseMesh.position.y = -1.04;
    mannequinGroup.add(baseMesh);

    // B. Draped Garment Mesh
    const garmentGroup = new THREE.Group();
    rotationGroup.add(garmentGroup);
    garmentGroupRef.current = garmentGroup;

    const fabricTex = createProductTexture(product, fabricWeave);
    const isLustrous = fabricWeave === 'silk' || fabricWeave === 'brocade';

    const garmentMat = new THREE.MeshPhysicalMaterial({
      map: fabricTex,
      roughness: isLustrous ? 0.25 : 0.65,
      metalness: isLustrous ? 0.35 : 0.05,
      clearcoat: isLustrous ? 0.75 : 0.1,
      side: THREE.DoubleSide,
    });

    const isPanjabi = product.nameEn.toLowerCase().includes('panjabi') || product.category === 'Traditional';
    const isThreePiece = product.sizes.includes('Unstitched Set') || product.nameEn.toLowerCase().includes('kameez') || product.category === 'Women';

    const garmentLength = isPanjabi ? 1.55 : isThreePiece ? 1.4 : 1.15;
    const garmentWidth = 0.78;
    const fabricGeo = new THREE.PlaneGeometry(garmentWidth, garmentLength, 40, 48);

    const pos = fabricGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const zCurvature = -Math.cos(x * 3.2) * 0.14 + 0.16;
      const hemSpread = y < -0.3 ? (0.3 - y) * 0.04 : 0;
      pos.setZ(i, zCurvature);
      pos.setX(i, x * (1 + hemSpread));
    }
    fabricGeo.computeVertexNormals();

    const fabricMesh = new THREE.Mesh(fabricGeo, garmentMat);
    fabricMesh.position.set(0, isPanjabi ? 0.25 : 0.35, 0.12);
    fabricMesh.castShadow = !isSoftwareGl;
    fabricMesh.receiveShadow = !isSoftwareGl;
    garmentGroup.add(fabricMesh);
    fabricMeshRef.current = fabricMesh;

    const collarRadius = 0.15;
    const collarGeo = new THREE.CylinderGeometry(collarRadius, collarRadius + 0.02, 0.1, 32, 1, true);
    const collarMesh = new THREE.Mesh(collarGeo, garmentMat);
    collarMesh.position.set(0, 1.05, 0);
    garmentGroup.add(collarMesh);

    let dupattaGeo: THREE.PlaneGeometry | null = null;
    let dupattaMat: THREE.MeshPhysicalMaterial | null = null;
    if (isThreePiece || isPanjabi) {
      dupattaGeo = new THREE.PlaneGeometry(0.38, 1.6, 28, 36);
      dupattaMat = new THREE.MeshPhysicalMaterial({
        map: fabricTex,
        roughness: 0.45,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
      const dupattaMesh = new THREE.Mesh(dupattaGeo, dupattaMat);
      dupattaMesh.position.set(-0.38, 0.32, 0.18);
      dupattaMesh.rotation.set(0.08, 0.22, -0.16);
      garmentGroup.add(dupattaMesh);
      dupattaMeshRef.current = dupattaMesh;
    } else {
      dupattaMeshRef.current = null;
    }

    // C. Soft Contact Shadow Plane Grounding the Model
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.06;
    scene.add(shadowMesh);

    // 6. Interactive Drag Rotation Handling
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
        Math.min(0.25, rotationGroupRef.current.rotation.x + deltaY * 0.003)
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

    // 7. Animation Loop with Organic Fabric Wave Dynamics
    let animationFrameId = 0;
    const clock = new THREE.Clock();
    const originalPositions = fabricGeo.attributes.position.clone();
    const originalDupattaPos = dupattaGeo ? dupattaGeo.attributes.position.clone() : null;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const currentSpeed = waveSpeedRef.current;

      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPos.current, 0.06);
      }

      if (!isDragging.current && rotationGroupRef.current) {
        rotationGroupRef.current.rotation.y += 0.0025;
      }

      if (fabricMeshRef.current) {
        const positions = fabricMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const u = positions.getX(i);
          const v = positions.getY(i);
          const origZ = originalPositions.getZ(i);

          const wave =
            Math.sin(v * 4.2 + elapsedTime * currentSpeed * 2.2) * 0.022 +
            Math.cos(u * 5.2 + elapsedTime * currentSpeed * 1.6) * 0.012;

          positions.setZ(i, origZ + wave);
        }
        positions.needsUpdate = true;
      }

      if (dupattaMeshRef.current && originalDupattaPos) {
        const dPositions = dupattaMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < dPositions.count; i++) {
          const v = dPositions.getY(i);
          const origZ = originalDupattaPos.getZ(i);
          const wave = Math.sin(v * 3.6 + elapsedTime * currentSpeed * 2.6) * 0.035;
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
      if (dupattaGeo) dupattaGeo.dispose();
      torsoGeo.dispose();
      shoulderGeo.dispose();
      neckGeo.dispose();
      neckCapGeo.dispose();
      rodGeo.dispose();
      baseGeo.dispose();
      shadowGeo.dispose();
      collarGeo.dispose();
      fabricTex.dispose();
      garmentMat.dispose();
      if (dupattaMat) dupattaMat.dispose();
      mannequinMat.dispose();
      brassAccentMat.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, [isOpen, product, fabricWeave]);

  // Adjust mannequin size scale dynamically
  useEffect(() => {
    if (!mannequinGroupRef.current || !garmentGroupRef.current) return;
    const scaleFactor = activeSize === 'S' ? 0.94 : activeSize === 'M' ? 1.0 : activeSize === 'L' ? 1.06 : 1.12;
    mannequinGroupRef.current.scale.set(scaleFactor, 1.0, scaleFactor);
    garmentGroupRef.current.scale.set(scaleFactor, 1.0, scaleFactor);
  }, [activeSize]);

  // Lighting Preset Switcher
  useEffect(() => {
    if (!keyLightRef.current || !sceneRef.current) return;
    if (lightingPreset === 'atelier') {
      keyLightRef.current.color.setHex(0xffeedd);
      keyLightRef.current.intensity = 2.5;
      sceneRef.current.background = new THREE.Color(0x0a0a0d);
      sceneRef.current.fog = new THREE.Fog(0x0a0a0d, 4.0, 9.0);
    } else if (lightingPreset === 'golden') {
      keyLightRef.current.color.setHex(0xffb86c);
      keyLightRef.current.intensity = 3.2;
      sceneRef.current.background = new THREE.Color(0x130e0b);
      sceneRef.current.fog = new THREE.Fog(0x130e0b, 3.8, 8.5);
    } else if (lightingPreset === 'dramatic') {
      keyLightRef.current.color.setHex(0xffffff);
      keyLightRef.current.intensity = 3.6;
      sceneRef.current.background = new THREE.Color(0x050507);
      sceneRef.current.fog = new THREE.Fog(0x050507, 3.2, 7.5);
    }
  }, [lightingPreset]);

  // View Preset Handler
  const handleSetPreset = (preset: 'full' | 'collar' | 'shoulder' | 'side') => {
    setActivePreset(preset);
    if (preset === 'full') {
      targetCameraPos.current.set(0, 0.45, 3.1);
      if (rotationGroupRef.current) rotationGroupRef.current.rotation.set(0, 0, 0);
    } else if (preset === 'collar') {
      targetCameraPos.current.set(0, 0.95, 1.35);
      if (rotationGroupRef.current) rotationGroupRef.current.rotation.set(0, 0, 0);
    } else if (preset === 'shoulder') {
      targetCameraPos.current.set(-0.7, 0.7, 2.0);
      if (rotationGroupRef.current) rotationGroupRef.current.rotation.set(0, 0.6, 0);
    } else if (preset === 'side') {
      targetCameraPos.current.set(1.4, 0.45, 2.2);
      if (rotationGroupRef.current) rotationGroupRef.current.rotation.set(0, -1.2, 0);
    }
  };

  const handleReset = () => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.set(0, 0, 0);
    }
    targetCameraPos.current.set(0, 0.45, 3.1);
    setActivePreset('full');
  };

  const handleDirectAdd = () => {
    if (!product || !onAddToCart) return;
    onAddToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: activeSize,
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1800);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Dark Ambient Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/90 transition-opacity" 
      />

      <div className="relative w-full max-w-5xl h-[88vh] bg-[#0c0c0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* 3D Canvas Mount */}
        <div 
          ref={mountRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        />

        {contextLost && (
          <div className="absolute inset-0 bg-[#09090B]/95 flex flex-col items-center justify-center text-center p-6 z-30">
            <p className="font-serif-luxury text-xl text-[#F5F2EB] mb-2">Restoring 3D Atelier Viewport</p>
            <p className="text-xs font-mono text-[#77777D]">Graphics context interrupted — reinitializing...</p>
          </div>
        )}

        {/* Top Floating Spec Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/90 border border-white/15 text-xs font-mono pointer-events-auto shadow-lg">
            <img
              src="/assets/aistudio/Untitled_design_a468bd14.png"
              alt="Fabrician Emblem"
              className="w-5 h-5 object-contain"
            />
            <span className="text-[#D5BA80] font-semibold uppercase tracking-wider hidden sm:inline">
              Virtual Atelier Try-On
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-[#F5F2EB] font-serif-luxury text-sm">
              {language === 'en' ? product.nameEn : product.nameBn}
            </span>
            <span className="hidden sm:inline text-white/30">·</span>
            <span className="hidden sm:inline text-[#D5BA80] font-bold tabular-nums">
              ৳ {product.priceBDT.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-black/90 border border-white/15 hover:border-[#B69A60] text-[#D8D3C9] hover:text-white transition-colors cursor-pointer"
              title="Reset 3D Angle"
              aria-label="Reset Camera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/90 border border-white/15 hover:border-red-400 text-[#D8D3C9] hover:text-white transition-colors cursor-pointer"
              aria-label="Close Try-On"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Helper Tip */}
        <div className="absolute top-16 left-4 text-[11px] font-mono text-[#77777D] pointer-events-none hidden sm:block">
          360° Drag Rotation · Real-Time Cloth Draping &amp; Lighting Simulation
        </div>

        {/* Unified Bottom Control Dock */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 transition-all duration-300">
          {/* Collapse / Expand Toggle Button */}
          <div className="flex justify-center mb-1.5">
            <button
              onClick={() => setHudExpanded(!hudExpanded)}
              className="px-3.5 py-1 rounded-t-lg bg-[#171719] border border-b-0 border-white/15 text-[11px] font-mono uppercase tracking-wider text-[#D8D3C9] hover:text-white flex items-center gap-1.5 cursor-pointer shadow-xl"
            >
              {hudExpanded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>Hide Studio Controls</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>Show 3D Studio Controls</span>
                </>
              )}
            </button>
          </div>

          {/* Dock Body */}
          {hudExpanded && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#171719]/95 border border-white/15 shadow-2xl flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* 1. Camera Angle Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#77777D] mr-1 hidden md:inline">
                    Angle:
                  </span>
                  {[
                    { id: 'full', label: 'Full Drape' },
                    { id: 'collar', label: 'Collar & Placket' },
                    { id: 'shoulder', label: 'Shoulder Drape' },
                    { id: 'side', label: 'Profile' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSetPreset(p.id as 'full' | 'collar' | 'shoulder' | 'side')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        activePreset === p.id
                          ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                          : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* 2. Mannequin Fit Size Tailoring */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#77777D] mr-1 hidden sm:inline">
                    Mannequin Fit:
                  </span>
                  {(['S', 'M', 'L', 'XL'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setActiveSize(sz)}
                      className={`w-7 h-7 rounded text-[11px] font-mono uppercase font-semibold transition-all cursor-pointer ${
                        activeSize === sz
                          ? 'bg-[#D5BA80] text-[#09090B] shadow scale-105'
                          : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* 3. Direct Add to Bag Action */}
                {onAddToCart && (
                  <button
                    onClick={handleDirectAdd}
                    disabled={addedAnimation}
                    className={`px-4 py-1.5 rounded text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ml-auto ${
                      addedAnimation
                        ? 'bg-[#B69A60] text-[#09090B]'
                        : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added (Size {activeSize})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Bag This Fit (৳ {product.priceBDT.toLocaleString()})</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Secondary Controls Bar: Lighting & Weave Finish */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#77777D] uppercase text-[10px] hidden sm:inline">Fabric Simulation:</span>
                  {[
                    { id: 'cotton', label: 'Fine Cotton' },
                    { id: 'silk', label: 'Mulberry Silk' },
                    { id: 'linen', label: 'Handloom Linen' },
                    { id: 'brocade', label: 'Zari Brocade' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setFabricWeave(w.id as 'cotton' | 'silk' | 'linen' | 'brocade')}
                      className={`px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
                        fabricWeave === w.id
                          ? 'border border-[#B69A60] text-[#D5BA80] bg-[#B69A60]/10 font-bold'
                          : 'border border-white/10 text-[#77777D] hover:text-[#D8D3C9]'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span className="text-[#77777D] uppercase text-[10px] hidden sm:inline">Lighting:</span>
                  {[
                    { id: 'atelier', label: 'Atelier Runway' },
                    { id: 'golden', label: 'Golden Hour' },
                    { id: 'dramatic', label: 'Spotlight' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLightingPreset(l.id as 'atelier' | 'golden' | 'dramatic')}
                      className={`px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
                        lightingPreset === l.id
                          ? 'border border-[#B69A60] text-[#D5BA80] bg-[#B69A60]/10 font-bold'
                          : 'border border-white/10 text-[#77777D] hover:text-[#D8D3C9]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[#77777D]">
                  <Wind className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span className="uppercase text-[10px] hidden md:inline">Air Drift:</span>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={waveSpeed}
                    onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#B69A60]"
                    aria-label="Cloth Air Drift Speed"
                    title="Cloth Air Drift Speed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
