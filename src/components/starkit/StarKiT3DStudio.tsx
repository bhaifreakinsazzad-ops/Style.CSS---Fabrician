import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import {
  GraphicArchiveProduct,
  GraphicArchiveVariant,
} from '../../data/graphicArchiveCatalog';
import { CartItem, Language } from '../../types';

interface StarKiT3DStudioProps {
  products: GraphicArchiveProduct[];
  initialProduct?: GraphicArchiveProduct;
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
}

type StudioPreset = 'front' | 'back' | 'sleeve' | 'full';

function createFleeceBumpMap(maxAniso: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Diagonal micro-knit fleece weave pattern
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const shade = 112 + ((x * 7 + y * 13) % 36);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAniso;
  return tex;
}

function createFrontCrestTexture(
  product: GraphicArchiveProduct,
  variant: GraphicArchiveVariant,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const isLightBody = variant.color === 'Cream';
  const plaqueBg = isLightBody ? '#170000' : '#FFFFFF';
  const plaqueFg = isLightBody ? '#FFFFFF' : '#170000';
  const subFg = isLightBody ? '#170000' : '#FFFFFF';

  ctx.clearRect(0, 0, 512, 512);

  // Official Horizontal Plaque Lockup
  ctx.fillStyle = plaqueBg;
  ctx.fillRect(64, 130, 384, 178);

  ctx.fillStyle = plaqueFg;
  ctx.font = 'bold 58px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ستاركيت', 256, 218);

  ctx.font = '600 22px sans-serif';
  ctx.fillText('S  T  Λ  R  K  I  T', 256, 274);

  // Drop & SKU stamp
  ctx.fillStyle = subFg;
  ctx.font = '600 18px monospace';
  ctx.fillText(`${product.stkCode || product.id} · ${product.name.toUpperCase()}`, 256, 355);

  ctx.font = '500 14px monospace';
  ctx.fillText('COMMUNITY · STYLE · AUTHENTICITY', 256, 390);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createBackArtworkTexture(
  product: GraphicArchiveProduct,
  variant: GraphicArchiveVariant,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 896;
  const ctx = canvas.getContext('2d')!;

  const isLightBody = variant.color === 'Cream';
  const fg = isLightBody ? '#170000' : '#FFFFFF';
  const cardBg = isLightBody ? '#FFFFFF' : '#170000';
  const borderColor = isLightBody ? '#170000' : '#FFFFFF';
  const mutedLine = isLightBody ? 'rgba(23,0,0,0.45)' : 'rgba(255,255,255,0.45)';

  ctx.clearRect(0, 0, 768, 896);

  // Editorial Back Graphic Frame
  ctx.fillStyle = cardBg;
  ctx.fillRect(56, 56, 656, 784);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(56, 56, 656, 784);

  // Top Monochrome Header Bar
  ctx.fillStyle = fg;
  ctx.fillRect(56, 56, 656, 44);

  ctx.fillStyle = cardBg;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`STΛRKIT ARCHIVE // ${product.stkCode || product.id}`, 78, 84);
  ctx.textAlign = 'right';
  ctx.fillText(`${variant.gsm}`, 690, 84);

  // Center Motif Art Geometry driven by Product Category
  const cx = 384;
  const cy = 365;
  ctx.save();
  ctx.translate(cx, cy);

  if (product.category === 'Anime Archive') {
    ctx.strokeStyle = fg;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 128, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = mutedLine;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 158, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = fg;
    ctx.lineWidth = 5;
    for (let r = 0; r < 6; r++) {
      const a = (r * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 35, Math.sin(a) * 35);
      ctx.lineTo(Math.cos(a) * 124, Math.sin(a) * 124);
      ctx.stroke();
    }
  } else if (product.category === 'Moto Culture') {
    ctx.strokeStyle = fg;
    ctx.lineWidth = 10;
    ctx.strokeRect(-145, -125, 290, 250);
    ctx.fillStyle = fg;
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(i * 38 - 14, -125, 24, 34);
      ctx.fillRect(-i * 38 - 10, 91, 24, 34);
    }
    ctx.fillStyle = fg;
    ctx.font = '900 68px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RPM', 0, 24);
  } else {
    ctx.strokeStyle = fg;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -155);
    ctx.lineTo(155, 0);
    ctx.lineTo(0, 155);
    ctx.lineTo(-155, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = mutedLine;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 96, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Headline Typography
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.font = '700 44px sans-serif';
  ctx.fillText(product.name.toUpperCase(), 384, 608);

  ctx.fillStyle = mutedLine;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(product.editorial, 384, 654);

  // Bottom Spec Seal
  ctx.strokeStyle = fg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 700);
  ctx.lineTo(668, 700);
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.font = 'bold 20px monospace';
  ctx.fillText('DHAKA · COMMUNITY · STYLE · AUTHENTICITY', 384, 745);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('ستاركيت  //  S T Λ R K I T', 384, 788);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createSleeveTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 512);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(68, 40, 120, 432);
  ctx.fillStyle = '#170000';
  ctx.save();
  ctx.translate(128, 256);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S T Λ R K I T', 0, 0);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export const StarKiT3DStudio: React.FC<StarKiT3DStudioProps> = ({
  products,
  initialProduct,
  language,
  onAddToCart,
  onBuyNow,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || products[0]?.id || 'FAB-H001'
  );
  const activeProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedVariantSku, setSelectedVariantSku] = useState<string>(
    () => (initialProduct || products[0])?.variants[0]?.sku || ''
  );
  const activeVariant =
    activeProduct.variants.find((v) => v.sku === selectedVariantSku) ||
    activeProduct.variants[0];

  const [gsmValue, setGsmValue] = useState<number>(350);
  const [selectedSize, setSelectedSize] = useState<'M' | 'L' | 'XL' | 'XXL'>('L');
  const [preset, setPreset] = useState<StudioPreset>('front');
  const [autoOrbit, setAutoOrbit] = useState<boolean>(true);
  const [hudExpanded, setHudExpanded] = useState<boolean>(true);
  const [contextLost, setContextLost] = useState<boolean>(false);

  // Sync external initialProduct if parent selects one
  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
      setSelectedVariantSku(initialProduct.variants[0]?.sku || '');
    }
  }, [initialProduct]);

  // Keep variant valid when product switches
  useEffect(() => {
    if (!activeProduct.variants.some((v) => v.sku === selectedVariantSku)) {
      setSelectedVariantSku(activeProduct.variants[0]?.sku || '');
    }
  }, [activeProduct, selectedVariantSku]);

  const autoOrbitRef = useRef(autoOrbit);
  const gsmRef = useRef(gsmValue);
  const targetCameraPos = useRef(new THREE.Vector3(0, 0.25, 2.75));
  const targetGroupRotY = useRef(0);
  const hoodieGroupRef = useRef<THREE.Group | null>(null);
  const fabricMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const ribMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const frontDecalMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const backDecalMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const maxAnisoRef = useRef(4);

  useEffect(() => {
    autoOrbitRef.current = autoOrbit;
  }, [autoOrbit]);

  useEffect(() => {
    gsmRef.current = gsmValue;
    if (fabricMaterialRef.current) {
      const normalized = (gsmValue - 280) / 200; // 0..1
      fabricMaterialRef.current.bumpScale = 0.008 + normalized * 0.022;
      fabricMaterialRef.current.roughness = 0.88 - normalized * 0.14;
      fabricMaterialRef.current.sheen = 0.35 + normalized * 0.4;
    }
  }, [gsmValue]);

  // Initialize Three.js Studio Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x170000);
    scene.fog = new THREE.Fog(0x170000, 4.2, 9.0);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 24);
    camera.position.set(0, 0.25, 2.75);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    maxAnisoRef.current = Math.min(8, renderer.capabilities.getMaxAnisotropy());

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

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const hemi = new THREE.HemisphereLight(0xffffff, 0x220c0c, 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff5ec, 2.3);
    keyLight.position.set(2.4, 3.8, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const warmKeyRim = new THREE.DirectionalLight(0xf3efea, 1.35);
    warmKeyRim.position.set(-2.8, 1.6, -2.5);
    scene.add(warmKeyRim);

    const backFill = new THREE.DirectionalLight(0xdce8ff, 1.15);
    backFill.position.set(0.5, 1.4, -3.2);
    scene.add(backFill);

    // Composite Hoodie Group
    const hoodieGroup = new THREE.Group();
    scene.add(hoodieGroup);
    hoodieGroupRef.current = hoodieGroup;

    const bumpTex = createFleeceBumpMap(maxAnisoRef.current);
    const bodyColor = new THREE.Color(activeVariant.colorHex);

    const fabricMat = new THREE.MeshPhysicalMaterial({
      color: bodyColor,
      bumpMap: bumpTex,
      bumpScale: 0.014,
      roughness: 0.82,
      metalness: 0.02,
      sheen: 0.55,
      sheenRoughness: 0.68,
      sheenColor: new THREE.Color(0xffffff),
    });
    fabricMaterialRef.current = fabricMat;

    const ribMat = new THREE.MeshPhysicalMaterial({
      color: bodyColor.clone().multiplyScalar(0.92),
      bumpMap: bumpTex,
      bumpScale: 0.02,
      roughness: 0.88,
      metalness: 0.02,
    });
    ribMaterialRef.current = ribMat;

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [fabricMat, ribMat];

    // 1. Torso Main Body (Boxy Drop-Shoulder Silhouette)
    const torsoGeo = new THREE.CylinderGeometry(0.45, 0.43, 0.96, 36, 12);
    torsoGeo.scale(1.04, 1, 0.62);
    geometries.push(torsoGeo);
    const torsoMesh = new THREE.Mesh(torsoGeo, fabricMat);
    torsoMesh.position.y = 0.14;
    torsoMesh.castShadow = !isSoftwareGl;
    torsoMesh.receiveShadow = !isSoftwareGl;
    hoodieGroup.add(torsoMesh);

    // 2. Ribbed Waistband Hem
    const hemGeo = new THREE.CylinderGeometry(0.425, 0.405, 0.14, 36);
    hemGeo.scale(1.04, 1, 0.62);
    geometries.push(hemGeo);
    const hemMesh = new THREE.Mesh(hemGeo, ribMat);
    hemMesh.position.y = -0.39;
    hemMesh.castShadow = !isSoftwareGl;
    hoodieGroup.add(hemMesh);

    // 3. Drop-Shoulder Sleeves & Ribbed Cuffs
    const sleeveGeo = new THREE.CylinderGeometry(0.145, 0.105, 0.84, 24);
    const cuffGeo = new THREE.CylinderGeometry(0.105, 0.095, 0.1, 24);
    geometries.push(sleeveGeo, cuffGeo);

    [-1, 1].forEach((side) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.45, 0.49, 0);
      armPivot.rotation.z = side * -0.38;
      armPivot.rotation.x = 0.08;

      const sleeve = new THREE.Mesh(sleeveGeo, fabricMat);
      sleeve.position.y = -0.37;
      sleeve.castShadow = !isSoftwareGl;
      armPivot.add(sleeve);

      const cuff = new THREE.Mesh(cuffGeo, ribMat);
      cuff.position.y = -0.82;
      armPivot.add(cuff);

      hoodieGroup.add(armPivot);
    });

    // Sleeve Kinetic Patch on Left Arm
    const sleeveTex = createSleeveTexture(maxAnisoRef.current);
    const sleeveDecalGeo = new THREE.PlaneGeometry(0.11, 0.34);
    const sleeveDecalMat = new THREE.MeshBasicMaterial({
      map: sleeveTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    geometries.push(sleeveDecalGeo);
    materials.push(sleeveDecalMat);
    const sleevePatch = new THREE.Mesh(sleeveDecalGeo, sleeveDecalMat);
    sleevePatch.position.set(-0.59, 0.17, 0.11);
    sleevePatch.rotation.y = -Math.PI / 2;
    sleevePatch.rotation.z = 0.38;
    hoodieGroup.add(sleevePatch);

    // 4. Double-Lined Hood Cowl + Collar
    const hoodGeo = new THREE.SphereGeometry(0.28, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.72);
    hoodGeo.scale(0.95, 1.08, 1.12);
    geometries.push(hoodGeo);
    const hoodMesh = new THREE.Mesh(hoodGeo, fabricMat);
    hoodMesh.position.set(0, 0.68, -0.06);
    hoodMesh.rotation.x = -0.25;
    hoodMesh.castShadow = !isSoftwareGl;
    hoodieGroup.add(hoodMesh);

    const collarGeo = new THREE.TorusGeometry(0.195, 0.055, 14, 32);
    geometries.push(collarGeo);
    const collarMesh = new THREE.Mesh(collarGeo, ribMat);
    collarMesh.position.set(0, 0.59, 0.03);
    collarMesh.rotation.x = Math.PI / 2 - 0.18;
    hoodieGroup.add(collarMesh);

    // 5. Drawcords + Metallic Brushed Aglets
    const cordGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.31, 10);
    const agletGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.035, 10);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.7 });
    const agletMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.85,
      roughness: 0.22,
    });
    geometries.push(cordGeo, agletGeo);
    materials.push(cordMat, agletMat);

    [-0.065, 0.065].forEach((offsetX) => {
      const cord = new THREE.Mesh(cordGeo, cordMat);
      cord.position.set(offsetX, 0.42, 0.275);
      cord.rotation.x = -0.06;
      hoodieGroup.add(cord);

      const aglet = new THREE.Mesh(agletGeo, agletMat);
      aglet.position.set(offsetX, 0.255, 0.284);
      hoodieGroup.add(aglet);
    });

    // 6. Kangaroo Front Pocket Panel
    const pocketGeo = new THREE.BoxGeometry(0.46, 0.25, 0.045);
    geometries.push(pocketGeo);
    const pocketMesh = new THREE.Mesh(pocketGeo, fabricMat);
    pocketMesh.position.set(0, -0.17, 0.262);
    hoodieGroup.add(pocketMesh);

    // 7. Front Chest Crest Artwork Decal (Curved lightly to hug torso)
    const frontTex = createFrontCrestTexture(activeProduct, activeVariant, maxAnisoRef.current);
    const frontDecalGeo = new THREE.PlaneGeometry(0.32, 0.32, 12, 12);
    const fPos = frontDecalGeo.attributes.position;
    for (let i = 0; i < fPos.count; i++) {
      const vx = fPos.getX(i);
      fPos.setZ(i, -vx * vx * 0.42);
    }
    frontDecalGeo.computeVertexNormals();
    geometries.push(frontDecalGeo);

    const frontDecalMat = new THREE.MeshBasicMaterial({
      map: frontTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    frontDecalMatRef.current = frontDecalMat;
    materials.push(frontDecalMat);

    const frontDecal = new THREE.Mesh(frontDecalGeo, frontDecalMat);
    frontDecal.position.set(0, 0.28, 0.285);
    hoodieGroup.add(frontDecal);

    // 8. Full Back Graphic Artwork Print Panel
    const backTex = createBackArtworkTexture(activeProduct, activeVariant, maxAnisoRef.current);
    const backDecalGeo = new THREE.PlaneGeometry(0.46, 0.54, 14, 14);
    const bPos = backDecalGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const vx = bPos.getX(i);
      bPos.setZ(i, vx * vx * 0.38);
    }
    backDecalGeo.computeVertexNormals();
    geometries.push(backDecalGeo);

    const backDecalMat = new THREE.MeshBasicMaterial({
      map: backTex,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    backDecalMatRef.current = backDecalMat;
    materials.push(backDecalMat);

    const backDecal = new THREE.Mesh(backDecalGeo, backDecalMat);
    backDecal.position.set(0, 0.16, -0.288);
    backDecal.rotation.y = Math.PI;
    hoodieGroup.add(backDecal);

    // 9. Pedestal Base Ring & Ground Contact Shadow
    const ringGeo = new THREE.RingGeometry(0.55, 0.61, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    geometries.push(ringGeo);
    materials.push(ringMat);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.68;
    scene.add(ringMesh);

    const shadowGeo = new THREE.PlaneGeometry(1.7, 1.7);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    geometries.push(shadowGeo);
    materials.push(shadowMat);
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.7;
    scene.add(shadowMesh);

    // Pointer Drag & Scroll Zoom
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      setAutoOrbit(false);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointer.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevPointer.current.x;
      const dy = clientY - prevPointer.current.y;
      targetGroupRotY.current += dx * 0.01;
      hoodieGroup.rotation.y = targetGroupRotY.current;
      hoodieGroup.rotation.x = THREE.MathUtils.clamp(
        hoodieGroup.rotation.x + dy * 0.004,
        -0.25,
        0.25
      );
      prevPointer.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraPos.current.z = THREE.MathUtils.clamp(
        targetCameraPos.current.z + e.deltaY * 0.002,
        1.55,
        3.6
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);

      if (autoOrbitRef.current && !isDragging.current) {
        targetGroupRotY.current += dt * 0.35;
        hoodieGroup.rotation.y = targetGroupRotY.current;
      } else if (!isDragging.current) {
        hoodieGroup.rotation.y = THREE.MathUtils.damp(
          hoodieGroup.rotation.y,
          targetGroupRotY.current,
          6,
          dt
        );
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCameraPos.current.x, 6, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCameraPos.current.y, 6, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraPos.current.z, 6, dt);
      camera.lookAt(0, 0.12, 0);

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
      dom.removeEventListener('mousemove', onPointerMove);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      envTarget.dispose();
      bumpTex.dispose();
      sleeveTex.dispose();
      frontDecalMatRef.current?.map?.dispose();
      backDecalMatRef.current?.map?.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
    // Scene initializes once; product/colorway textures swap cleanly via the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap colors & artwork textures dynamically without recreating the WebGL context
  useEffect(() => {
    const nextColor = new THREE.Color(activeVariant.colorHex);
    if (fabricMaterialRef.current) {
      fabricMaterialRef.current.color.copy(nextColor);
    }
    if (ribMaterialRef.current) {
      ribMaterialRef.current.color.copy(nextColor.clone().multiplyScalar(0.92));
    }
    if (frontDecalMatRef.current) {
      const oldMap = frontDecalMatRef.current.map;
      frontDecalMatRef.current.map = createFrontCrestTexture(
        activeProduct,
        activeVariant,
        maxAnisoRef.current
      );
      frontDecalMatRef.current.needsUpdate = true;
      oldMap?.dispose();
    }
    if (backDecalMatRef.current) {
      const oldBack = backDecalMatRef.current.map;
      backDecalMatRef.current.map = createBackArtworkTexture(
        activeProduct,
        activeVariant,
        maxAnisoRef.current
      );
      backDecalMatRef.current.needsUpdate = true;
      oldBack?.dispose();
    }
  }, [activeProduct, activeVariant]);

  const handleSelectPreset = (next: StudioPreset) => {
    setPreset(next);
    setAutoOrbit(false);
    if (next === 'front') {
      targetCameraPos.current.set(0, 0.25, 2.35);
      targetGroupRotY.current = 0;
    } else if (next === 'back') {
      targetCameraPos.current.set(0, 0.22, 2.15);
      targetGroupRotY.current = Math.PI;
    } else if (next === 'sleeve') {
      targetCameraPos.current.set(-0.25, 0.18, 2.0);
      targetGroupRotY.current = Math.PI / 2;
    } else {
      targetCameraPos.current.set(0, 0.25, 2.75);
      targetGroupRotY.current = 0;
      setAutoOrbit(true);
    }
  };

  const buildCartPayload = (): Omit<CartItem, 'id'> => ({
    productId: activeProduct.id,
    nameEn: `StarKiT ${activeProduct.name} Hoodie (${activeProduct.stkCode || activeVariant.sku})`,
    nameBn: `স্টারকিট ${activeProduct.name} হুডি (${activeProduct.stkCode || activeVariant.sku})`,
    priceBDT: activeVariant.priceBdt,
    image: activeVariant.previewImage,
    color: activeVariant.color,
    size: selectedSize,
    quantity: 1,
  });

  return (
    <div className="relative w-full h-[560px] lg:h-[640px] rounded-2xl overflow-hidden bg-[#170000] border-2 border-white/15 shadow-2xl">
      {/* Isolated WebGL Viewport Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {contextLost && (
        <div className="absolute inset-0 bg-[#170000] flex flex-col items-center justify-center text-center p-6 z-30">
          <p className="font-starkit text-xl font-bold text-white uppercase tracking-wider mb-1">
            Restoring StarKiT 3D Studio
          </p>
          <p className="text-xs font-mono text-white/70">
            Graphics context interrupted — reinitializing garment viewport...
          </p>
        </div>
      )}

      {/* Top Minimal Corner Telemetry (High-Contrast Solid Surface, No Backdrop-Blur over WebGL) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-[#170000] border border-white/25 text-[11px] font-mono text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="font-bold">{activeProduct.stkCode || activeProduct.id}</span>
          <span className="text-white/30">·</span>
          <span>{activeProduct.name}</span>
          <span className="hidden sm:inline text-white/60">· {gsmValue} GSM</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoOrbit((v) => !v)}
            className="p-2 rounded-lg bg-[#170000] border border-white/25 hover:border-white text-white transition-colors cursor-pointer"
            title={autoOrbit ? 'Pause Orbit' : 'Resume Orbit'}
            aria-label={autoOrbit ? 'Pause Auto Orbit' : 'Resume Auto Orbit'}
          >
            {autoOrbit ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('full')}
            className="p-2 rounded-lg bg-[#170000] border border-white/25 hover:border-white text-white transition-colors cursor-pointer"
            title="Reset 3D View"
            aria-label="Reset 3D View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (Single Dock Per Scene Design Contract) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-20">
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setHudExpanded((v) => !v)}
            className="px-3.5 py-1 rounded-t-lg bg-[#170000] border border-b-0 border-white/25 text-[10px] font-mono uppercase tracking-widest text-white hover:text-[#C7C1BF] flex items-center gap-1.5 cursor-pointer"
          >
            {hudExpanded ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-white" />
                <span>{language === 'en' ? 'Hide 3D Dock' : 'কন্ট্রোল লুকান'}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-white" />
                <span>{language === 'en' ? 'Customize Hoodie in 3D' : '৩ডি হুডি কাস্টমাইজ করুন'}</span>
              </>
            )}
          </button>
        </div>

        {hudExpanded && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#170000] border border-white/25 shadow-2xl space-y-3 text-xs">
            {/* Row 1: Artwork Selector + Camera Presets */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <label
                  htmlFor="starkit-3d-design-select"
                  className="text-[10px] font-mono uppercase tracking-wider text-white/60 shrink-0"
                >
                  {language === 'en' ? 'Drop:' : 'ডিজাইন:'}
                </label>
                <select
                  id="starkit-3d-design-select"
                  value={activeProduct.id}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="bg-black border border-white/25 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white cursor-pointer max-w-[230px]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#170000] text-white">
                      {p.stkCode || p.id} — {p.name} (৳{p.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { id: 'front', label: language === 'en' ? 'Front Crest' : 'সামনে' },
                    { id: 'back', label: language === 'en' ? 'Back Artwork' : 'পেছনের প্রিন্ট' },
                    { id: 'sleeve', label: language === 'en' ? 'Sleeve' : 'হাতা' },
                    { id: 'full', label: '360°' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPreset(item.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      preset === item.id
                        ? 'bg-white text-[#170000] font-bold'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Color Swatches + GSM Density + Size + Direct Checkout */}
            <div className="pt-2.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              {/* Swatches & GSM */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {activeProduct.variants.map((v) => (
                    <button
                      key={v.sku}
                      type="button"
                      onClick={() => setSelectedVariantSku(v.sku)}
                      title={v.color}
                      aria-label={`Select colorway ${v.color}`}
                      className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-transform ${
                        v.sku === activeVariant.sku
                          ? 'border-white scale-115 ring-2 ring-white/40'
                          : 'border-white/35 hover:border-white'
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-white/80">
                  <span>{gsmValue} GSM</span>
                  <input
                    type="range"
                    min={280}
                    max={480}
                    step={10}
                    value={gsmValue}
                    onChange={(e) => setGsmValue(Number(e.target.value))}
                    aria-label="Fleece GSM fabric density"
                    className="w-20 h-1 bg-white/25 rounded appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {(['M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-white text-[#170000] font-bold'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Express Actions */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => onAddToCart(buildCartPayload())}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Add' : 'যোগ'} · ৳{activeVariant.priceBdt.toLocaleString()}
                  </span>
                </button>
                {onBuyNow && (
                  <button
                    type="button"
                    onClick={() => onBuyNow(buildCartPayload())}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#ECEAEA] text-[#170000] text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
