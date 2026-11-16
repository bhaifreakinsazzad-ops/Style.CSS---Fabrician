import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sun,
  User,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Language } from '../../types';
import { ShowroomGarment } from '../../data/showroomCatalog';
import {
  BuiltShowroomResources,
  buildBlousonJacketMesh,
  createShowroomFabricTextures,
  detectSoftwareWebGL,
  playAtelierTone,
} from '../../utils/showroomProcedural';

export type ShowroomViewMode = 'rack' | 'model';
export type ShowroomStudioMood = 'warm' | 'cool';

interface VirtualShowroomCanvasProps {
  garments: ShowroomGarment[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  viewMode: ShowroomViewMode;
  onChangeViewMode: (mode: ShowroomViewMode) => void;
  studioMood: ShowroomStudioMood;
  onToggleStudioMood: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  language: Language;
}

export const VirtualShowroomCanvas: React.FC<VirtualShowroomCanvasProps> = ({
  garments,
  selectedIndex,
  onSelectIndex,
  viewMode,
  onChangeViewMode,
  studioMood,
  onToggleStudioMood,
  soundEnabled,
  onToggleSound,
  isFullscreen = false,
  onToggleFullscreen,
  language,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudExpanded, setHudExpanded] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  // Mutable refs for the WebGL loop (no canvas re-init when UI state changes)
  const selectedIndexRef = useRef(selectedIndex);
  const viewModeRef = useRef<ShowroomViewMode>(viewMode);
  const studioMoodRef = useRef<ShowroomStudioMood>(studioMood);
  const soundEnabledRef = useRef(soundEnabled);
  const onSelectIndexRef = useRef(onSelectIndex);

  const isDraggingRef = useRef(false);
  const prevPointerXRef = useRef(0);
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const pointerDownTimeRef = useRef(0);

  const garmentRotYRef = useRef(0.2);
  const targetGarmentRotYRef = useRef(0.2);
  const modelRotYRef = useRef(0);
  const targetModelRotYRef = useRef(0);
  const zoomOffsetRef = useRef(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rackGroupRef = useRef<THREE.Group | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const rackGarmentsRef = useRef<THREE.Group[]>([]);
  const modelJacketsRef = useRef<THREE.Group[]>([]);

  const cameraPosRef = useRef(new THREE.Vector3(0, 1.52, 2.35));
  const targetCameraPosRef = useRef(new THREE.Vector3(0, 1.52, 2.35));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 1.48, 0));
  const targetCameraLookAtRef = useRef(new THREE.Vector3(0, 1.48, 0));

  useEffect(() => {
    onSelectIndexRef.current = onSelectIndex;
  }, [onSelectIndex]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Sync garment selection targets
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    targetGarmentRotYRef.current = 0.16;

    rackGarmentsRef.current.forEach((g, idx) => {
      const isSelected = idx === selectedIndex;
      const targetPos = g.userData.targetPos as THREE.Vector3 | undefined;
      if (!targetPos) return;
      if (isSelected) {
        targetPos.set(0.12, 1.56, 0.18);
        g.userData.targetScale = 1.04;
      } else {
        const offsetOrder = idx < selectedIndex ? idx : idx - 1;
        targetPos.set(-0.46 - offsetOrder * 0.24, 1.56, -0.18 - offsetOrder * 0.14);
        g.userData.targetScale = 0.94;
      }
    });

    modelJacketsRef.current.forEach((wj, idx) => {
      wj.visible = idx === selectedIndex;
    });
  }, [selectedIndex]);

  // Sync view mode (Rack vs On-Model)
  useEffect(() => {
    viewModeRef.current = viewMode;
    if (rackGroupRef.current && modelGroupRef.current) {
      if (viewMode === 'rack') {
        rackGroupRef.current.visible = true;
        modelGroupRef.current.visible = false;
        targetCameraPosRef.current.set(0, 1.52, 2.35 + zoomOffsetRef.current);
        targetCameraLookAtRef.current.set(0, 1.48, 0);
      } else {
        rackGroupRef.current.visible = false;
        modelGroupRef.current.visible = true;
        targetModelRotYRef.current = 0;
        targetCameraPosRef.current.set(0, 1.38, 2.55 + zoomOffsetRef.current);
        targetCameraLookAtRef.current.set(0, 1.32, 0);
      }
    }
  }, [viewMode]);

  // Sync studio lighting mood
  useEffect(() => {
    studioMoodRef.current = studioMood;
    if (!sceneRef.current || !keyLightRef.current) return;
    if (studioMood === 'warm') {
      keyLightRef.current.color.set('#FFF8EE');
      sceneRef.current.background = new THREE.Color('#DCE0E6');
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.set('#DCE0E6');
      }
    } else {
      keyLightRef.current.color.set('#EBF4FF');
      sceneRef.current.background = new THREE.Color('#D0D8E3');
      if (sceneRef.current.fog instanceof THREE.FogExp2) {
        sceneRef.current.fog.color.set('#D0D8E3');
      }
    }
  }, [studioMood]);

  // Initialize Three.js WebGL Showroom once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#DCE0E6');
    scene.fog = new THREE.FogExp2('#DCE0E6', 0.055);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.copy(cameraPosRef.current);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
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

    // Studio IBL Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#C6CBD4', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF8EE', 1.25);
    keyLight.position.set(2.8, 4.2, 3.4);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.camera.left = -3.5;
      keyLight.shadow.camera.right = 3.5;
      keyLight.shadow.camera.top = 3.5;
      keyLight.shadow.camera.bottom = -1;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight('#DCE8F7', 0.6);
    fillLight.position.set(-3.2, 2.4, 2.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#FFFFFF', 0.48);
    rimLight.position.set(0, 3.0, -3.5);
    scene.add(rimLight);

    const resources: BuiltShowroomResources = {
      geometries: [],
      materials: [],
      textures: [],
    };

    // Studio Architecture (Cyclorama Gallery + Brushed Chrome Garment Rail)
    const studioGroup = new THREE.Group();
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#D5D9E0',
      roughness: 0.88,
      metalness: 0.04,
    });
    resources.geometries.push(floorGeo);
    resources.materials.push(floorMat);

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    studioGroup.add(floor);

    const wallCurve = new THREE.CylinderGeometry(
      6.5,
      6.5,
      6.5,
      64,
      1,
      true,
      Math.PI * 0.65,
      Math.PI * 0.7
    );
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#E3E6EC',
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.BackSide,
    });
    resources.geometries.push(wallCurve);
    resources.materials.push(wallMat);

    const backWall = new THREE.Mesh(wallCurve, wallMat);
    backWall.position.set(0, 3.2, 1.8);
    backWall.receiveShadow = !isSoftwareGl;
    studioGroup.add(backWall);

    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#D4D8DF',
      roughness: 0.2,
      metalness: 0.9,
    });
    const railGeo = new THREE.CylinderGeometry(0.016, 0.016, 3.6, 24);
    const bracketGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.95, 16);
    resources.geometries.push(railGeo, bracketGeo);
    resources.materials.push(chromeMat);

    const railBar = new THREE.Mesh(railGeo, chromeMat);
    railBar.rotation.z = Math.PI / 2;
    railBar.position.set(-0.2, 2.02, -0.35);
    railBar.castShadow = !isSoftwareGl;
    studioGroup.add(railBar);

    const leftBracket = new THREE.Mesh(bracketGeo, chromeMat);
    leftBracket.rotation.x = Math.PI / 2;
    leftBracket.position.set(-1.95, 2.02, -0.82);
    studioGroup.add(leftBracket);

    const rightBracket = new THREE.Mesh(bracketGeo, chromeMat);
    rightBracket.rotation.x = Math.PI / 2;
    rightBracket.position.set(1.55, 2.02, -0.82);
    studioGroup.add(rightBracket);

    scene.add(studioGroup);

    // Procedural High-Res Fabric Textures
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const garmentTextures = garments.map((g) => {
      const pair = createShowroomFabricTextures(g.patternType, g.hex, maxAniso);
      resources.textures.push(pair.map, pair.bumpMap);
      return pair;
    });

    // Rack Garments Group
    const rackGroup = new THREE.Group();
    rackGroup.visible = viewModeRef.current === 'rack';
    scene.add(rackGroup);
    rackGroupRef.current = rackGroup;

    const builtRackGarments: THREE.Group[] = [];
    garments.forEach((garment, idx) => {
      const gMesh = buildBlousonJacketMesh(
        garment,
        garmentTextures[idx],
        false,
        isSoftwareGl,
        resources
      );
      const isSelected = idx === selectedIndexRef.current;
      const offsetOrder = idx < selectedIndexRef.current ? idx : idx - 1;
      const targetPos = isSelected
        ? new THREE.Vector3(0.12, 1.56, 0.18)
        : new THREE.Vector3(-0.46 - offsetOrder * 0.24, 1.56, -0.18 - offsetOrder * 0.14);
      const targetScale = isSelected ? 1.04 : 0.94;

      gMesh.userData.targetPos = targetPos;
      gMesh.userData.targetScale = targetScale;
      gMesh.position.copy(targetPos);
      gMesh.scale.setScalar(targetScale);
      gMesh.rotation.y = garmentRotYRef.current;

      rackGroup.add(gMesh);
      builtRackGarments.push(gMesh);
    });
    rackGarmentsRef.current = builtRackGarments;

    // Editorial 3D Model Group ("Try On Model" View)
    const modelGroup = new THREE.Group();
    modelGroup.visible = viewModeRef.current === 'model';
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const skinMat = new THREE.MeshStandardMaterial({
      color: '#E5BFA8',
      roughness: 0.62,
      metalness: 0.02,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: '#5C4332',
      roughness: 0.78,
    });
    const trouserMat = new THREE.MeshStandardMaterial({
      color: '#EAE3D9',
      roughness: 0.85,
    });
    resources.materials.push(skinMat, hairMat, trouserMat);

    const neckGeo = new THREE.CylinderGeometry(0.056, 0.064, 0.14, 24);
    const headGeo = new THREE.SphereGeometry(0.105, 32, 32);
    const hairGeo = new THREE.SphereGeometry(
      0.109,
      32,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58
    );
    const handGeo = new THREE.SphereGeometry(0.036, 16, 16);
    const legGeo = new THREE.CylinderGeometry(0.088, 0.068, 0.96, 24);
    const pelvisGeo = new THREE.CylinderGeometry(0.175, 0.165, 0.16, 28);
    const contactShadowGeo = new THREE.CircleGeometry(0.45, 32);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: '#111827',
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    resources.geometries.push(
      neckGeo,
      headGeo,
      hairGeo,
      handGeo,
      legGeo,
      pelvisGeo,
      contactShadowGeo
    );
    resources.materials.push(contactShadowMat);

    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 1.62, 0.01);
    neck.castShadow = !isSoftwareGl;
    modelGroup.add(neck);

    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(0.88, 1.14, 0.96);
    head.position.set(0, 1.76, 0.018);
    head.castShadow = !isSoftwareGl;
    modelGroup.add(head);

    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.scale.set(0.9, 1.12, 0.98);
    hair.position.set(0, 1.775, 0.012);
    hair.rotation.x = -0.18;
    modelGroup.add(hair);

    [-1, 1].forEach((side) => {
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.scale.set(0.85, 1.4, 0.65);
      hand.position.set(side * 0.3, 0.99, 0.045);
      hand.castShadow = !isSoftwareGl;
      modelGroup.add(hand);

      const leg = new THREE.Mesh(legGeo, trouserMat);
      leg.position.set(side * 0.095, 0.52, 0.01);
      leg.castShadow = !isSoftwareGl;
      leg.receiveShadow = !isSoftwareGl;
      modelGroup.add(leg);
    });

    const pelvis = new THREE.Mesh(pelvisGeo, trouserMat);
    pelvis.scale.set(1.05, 1, 0.68);
    pelvis.position.set(0, 1.02, 0.005);
    modelGroup.add(pelvis);

    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.02, 0);
    modelGroup.add(contactShadow);

    // Background Mini Rack in Model Scene
    const bgRackGroup = new THREE.Group();
    bgRackGroup.position.set(-1.15, 0.05, -1.35);
    bgRackGroup.scale.set(0.78, 0.78, 0.78);
    garments.forEach((garment, i) => {
      const miniJacket = buildBlousonJacketMesh(
        garment,
        garmentTextures[i],
        false,
        isSoftwareGl,
        resources
      );
      miniJacket.position.set(i * 0.16, 1.56, 0);
      miniJacket.rotation.y = 0.35;
      bgRackGroup.add(miniJacket);
    });
    modelGroup.add(bgRackGroup);

    // Worn Jackets on Model
    const builtModelJackets: THREE.Group[] = [];
    garments.forEach((garment, idx) => {
      const worn = buildBlousonJacketMesh(
        garment,
        garmentTextures[idx],
        true,
        isSoftwareGl,
        resources
      );
      worn.position.set(0, 1.35, 0.005);
      worn.scale.set(1.02, 1.02, 1.04);
      worn.visible = idx === selectedIndexRef.current;
      modelGroup.add(worn);
      builtModelJackets.push(worn);
    });
    modelJacketsRef.current = builtModelJackets;

    // Raycaster & Pointer Controls
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const dom = renderer.domElement;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerXRef.current = clientX;
      pointerDownPosRef.current = { x: clientX, y: clientY };
      pointerDownTimeRef.current = performance.now();
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevPointerXRef.current;
      prevPointerXRef.current = clientX;

      if (viewModeRef.current === 'rack') {
        targetGarmentRotYRef.current += deltaX * 0.012;
      } else {
        targetModelRotYRef.current += deltaX * 0.012;
      }
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
      const dist = Math.hypot(
        clientX - pointerDownPosRef.current.x,
        clientY - pointerDownPosRef.current.y
      );
      const elapsed = performance.now() - pointerDownTimeRef.current;

      // Tap / Click on a garment hanging on the rack to focus it
      if (dist < 8 && elapsed < 300 && viewModeRef.current === 'rack') {
        const rect = dom.getBoundingClientRect();
        pointerNdc.x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        pointerNdc.y = -((clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);

        for (let i = 0; i < rackGarmentsRef.current.length; i++) {
          const hits = raycaster.intersectObjects(rackGarmentsRef.current[i].children, true);
          if (hits.length > 0 && i !== selectedIndexRef.current) {
            playAtelierTone(440 + i * 90, soundEnabledRef.current);
            onSelectIndexRef.current(i);
            break;
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomOffsetRef.current = THREE.MathUtils.clamp(
        zoomOffsetRef.current + e.deltaY * 0.0018,
        -0.75,
        0.9
      );
      const baseZ = viewModeRef.current === 'rack' ? 2.35 : 2.55;
      targetCameraPosRef.current.z = baseZ + zoomOffsetRef.current;
    };

    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop (Delta-damped, zero per-frame allocations)
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      const camFactor = 1 - Math.exp(-6.5 * dt);
      cameraPosRef.current.lerp(targetCameraPosRef.current, camFactor);
      cameraLookAtRef.current.lerp(targetCameraLookAtRef.current, camFactor);
      camera.position.copy(cameraPosRef.current);
      camera.lookAt(cameraLookAtRef.current);

      if (!isDraggingRef.current) {
        if (viewModeRef.current === 'rack') {
          targetGarmentRotYRef.current += Math.sin(t * 0.75) * 0.04 * dt;
        } else {
          targetModelRotYRef.current += Math.sin(t * 0.65) * 0.06 * dt;
        }
      }

      garmentRotYRef.current = THREE.MathUtils.damp(
        garmentRotYRef.current,
        targetGarmentRotYRef.current,
        7,
        dt
      );
      modelRotYRef.current = THREE.MathUtils.damp(
        modelRotYRef.current,
        targetModelRotYRef.current,
        7,
        dt
      );

      const rackFactor = 1 - Math.exp(-7 * dt);
      rackGarmentsRef.current.forEach((g, idx) => {
        const targetPos = g.userData.targetPos as THREE.Vector3;
        const targetScale = g.userData.targetScale as number;
        g.position.lerp(targetPos, rackFactor);
        const nextScale = THREE.MathUtils.damp(g.scale.x, targetScale, 7, dt);
        g.scale.setScalar(nextScale);

        if (idx === selectedIndexRef.current) {
          g.rotation.y = garmentRotYRef.current;
        } else {
          g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0.28, 5, dt);
        }
      });

      modelGroup.rotation.y = modelRotYRef.current;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const nextW = Math.max(container.clientWidth, 1);
      const nextH = Math.max(container.clientHeight, 1);
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    };
    window.addEventListener('resize', handleResize);
    const resizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObs?.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      resizeObs?.disconnect();
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      dom.removeEventListener('wheel', onWheel);

      envTarget.dispose();
      resources.textures.forEach((tex) => tex.dispose());
      resources.geometries.forEach((geo) => geo.dispose());
      resources.materials.forEach((mat) => mat.dispose());
      renderer.dispose();
    };
    // Initialize WebGL scene once; garment switches & view modes mutate via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeGarment = garments[selectedIndex] || garments[0];

  const handleResetView = () => {
    playAtelierTone(540, soundEnabled);
    zoomOffsetRef.current = 0;
    if (viewMode === 'rack') {
      targetGarmentRotYRef.current = 0.2;
      targetCameraPosRef.current.set(0, 1.52, 2.35);
      targetCameraLookAtRef.current.set(0, 1.48, 0);
    } else {
      targetModelRotYRef.current = 0;
      targetCameraPosRef.current.set(0, 1.38, 2.55);
      targetCameraLookAtRef.current.set(0, 1.32, 0);
    }
  };

  const handleZoomStep = (delta: number) => {
    playAtelierTone(delta < 0 ? 600 : 480, soundEnabled);
    zoomOffsetRef.current = THREE.MathUtils.clamp(zoomOffsetRef.current + delta, -0.75, 0.9);
    const baseZ = viewMode === 'rack' ? 2.35 : 2.55;
    targetCameraPosRef.current.z = baseZ + zoomOffsetRef.current;
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#DCE0E6] border border-white/15 shadow-2xl ${
        isFullscreen ? 'h-full rounded-none border-0' : 'h-[500px] sm:h-[560px] lg:h-[640px] rounded-2xl'
      }`}
    >
      {/* Isolated WebGL Viewport Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        aria-label="Interactive 3D Virtual Fashion Showroom"
      />

      {contextLost && (
        <div className="absolute inset-0 bg-[#14171A] flex flex-col items-center justify-center text-center p-6 z-30">
          <p className="font-serif-luxury text-xl text-[#F5F2EB] mb-1">
            Restoring 3D Atelier Showroom
          </p>
          <p className="text-xs font-mono text-[#9A9892]">
            Graphics context interrupted — reinitializing studio...
          </p>
        </div>
      )}

      {/* Minimal Top Overlay Bar (No backdrop-blur over WebGL, Clean Unboxed Metadata + Functional Utility Icons) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none z-20">
        <div className="px-3.5 py-2 rounded-xl bg-white/95 border border-slate-200/90 shadow-md text-slate-900 pointer-events-auto flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500">
            {activeGarment.sku}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="text-xs font-semibold truncate max-w-[160px] sm:max-w-xs">
            {language === 'en' ? activeGarment.titleEn : activeGarment.titleBn}
          </span>
          <span className="hidden md:inline text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="hidden md:inline text-[11px] font-medium text-slate-500">
            {language === 'en' ? 'Drag 360°' : '৩৬০° ঘোরান'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              playAtelierTone(610, soundEnabled);
              onToggleStudioMood();
            }}
            className="px-3 py-2 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 shadow-md text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title={language === 'en' ? 'Toggle Warm / Cool Studio Light' : 'লাইটিং পরিবর্তন'}
          >
            <Sun
              className={`w-3.5 h-3.5 ${
                studioMood === 'warm' ? 'text-amber-600' : 'text-sky-600'
              }`}
            />
            <span className="hidden sm:inline">
              {studioMood === 'warm'
                ? language === 'en'
                  ? 'Warm Light'
                  : 'ওয়ার্ম'
                : language === 'en'
                ? 'Cool Studio'
                : 'কুল'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 shadow-md text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Showroom Audio' : 'Enable Showroom Audio'}
            aria-label={soundEnabled ? 'Mute Showroom Audio' : 'Enable Showroom Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={() => {
                playAtelierTone(640, soundEnabled);
                onToggleFullscreen();
              }}
              className="p-2 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 shadow-md text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen Showroom' : 'Expand Fullscreen Showroom'}
              aria-label={isFullscreen ? 'Exit Fullscreen Showroom' : 'Expand Fullscreen Showroom'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Single Collapsible Bottom Control Dock (Zero Viewport Center Occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl z-20">
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setHudExpanded((v) => !v)}
            className="px-3.5 py-1 rounded-t-lg bg-[#14171A] border border-b-0 border-white/15 text-[10px] font-mono uppercase tracking-widest text-white hover:text-[#D5BA80] flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            {hudExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#D5BA80]" />
                <span>{language === 'en' ? 'Hide Controls' : 'কন্ট্রোল লুকান'}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#D5BA80]" />
                <span>{language === 'en' ? 'Showroom Controls' : 'শোরুম কন্ট্রোল'}</span>
              </>
            )}
          </button>
        </div>

        {hudExpanded && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-800">
            {/* Mode Switcher: Showroom Rack vs Try On Model */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  playAtelierTone(480, soundEnabled);
                  onChangeViewMode('rack');
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === 'rack'
                    ? 'bg-[#14171A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'en' ? 'Showroom Rack' : 'শোরুম র‍্যাক'}
              </button>
              <button
                type="button"
                onClick={() => {
                  playAtelierTone(680, soundEnabled);
                  onChangeViewMode('model');
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'model'
                    ? 'bg-[#14171A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3 h-3" />
                <span>{language === 'en' ? 'Try On Model' : '৩ডি মডেল ট্রাই-অন'}</span>
              </button>
            </div>

            {/* Quick Garment / Colorway Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {garments.map((g, idx) => {
                const active = idx === selectedIndex;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      playAtelierTone(440 + idx * 90, soundEnabled);
                      onSelectIndex(idx);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap border ${
                      active
                        ? 'bg-[#14171A] text-white border-[#14171A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: g.hex }}
                    />
                    <span>{language === 'en' ? g.colorNameEn.split(' ')[0] : g.colorNameBn}</span>
                  </button>
                );
              })}
            </div>

            {/* Zoom & Reset Controls */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => handleZoomStep(-0.3)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title={language === 'en' ? 'Zoom In' : 'জুম ইন'}
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleZoomStep(0.3)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title={language === 'en' ? 'Zoom Out' : 'জুম আউট'}
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title={language === 'en' ? 'Reset 3D Angle' : 'ভিউ রিসেট'}
                aria-label="Reset 3D Angle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
