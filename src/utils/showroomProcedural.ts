import * as THREE from 'three';
import { ShowroomGarment, ShowroomPatternType } from '../data/showroomCatalog';

let sharedAudioCtx: AudioContext | null = null;

/**
 * Zero-dependency procedural Web Audio feedback for showroom interactions.
 */
export function playAtelierTone(freq = 520, enabled = true): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }

    const now = sharedAudioCtx.currentTime;
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  } catch {
    // Ignore autoplay / audio context restrictions
  }
}

export function detectSoftwareWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export interface FabricTexturePair {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

export function createShowroomFabricTextures(
  patternType: ShowroomPatternType,
  baseHex: string,
  maxAnisotropy: number
): FabricTexturePair {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  if (patternType === 'ribbed') {
    for (let x = 0; x < size; x += 6) {
      ctx.fillStyle = x % 12 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(120,105,90,0.08)';
      ctx.fillRect(x, 0, 3, size);

      bCtx.fillStyle = x % 12 === 0 ? '#B8B8B8' : '#585858';
      bCtx.fillRect(x, 0, 3, size);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.025)';
    for (let y = 0; y < size; y += 4) {
      ctx.fillRect(0, y, size, 1);
    }
  } else if (patternType === 'twill') {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.5;
    bCtx.strokeStyle = '#9E9E9E';
    bCtx.lineWidth = 1.5;
    for (let i = -size; i < size * 2; i += 5) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + size, size);
      ctx.stroke();

      bCtx.beginPath();
      bCtx.moveTo(i, 0);
      bCtx.lineTo(i + size, size);
      bCtx.stroke();
    }
  } else {
    // Celestial Sun & Crescent Moon Silk Jacquard
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 3) {
      ctx.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(30,50,70,0.06)';
      ctx.fillRect(0, y, size, 1.5);
    }

    const drawCelestialMotif = (cx: number, cy: number, scale: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      bCtx.save();
      bCtx.translate(cx, cy);
      bCtx.scale(scale, scale);

      const threadLight = '#EAE6DF';
      const threadShadow = '#6D859B';

      // Crescent Moon
      ctx.fillStyle = threadLight;
      ctx.beginPath();
      ctx.arc(-28, 0, 36, 0.35 * Math.PI, 1.65 * Math.PI, false);
      ctx.arc(-12, 0, 29, 1.55 * Math.PI, 0.45 * Math.PI, true);
      ctx.closePath();
      ctx.fill();

      bCtx.fillStyle = '#D5D5D5';
      bCtx.beginPath();
      bCtx.arc(-28, 0, 36, 0.35 * Math.PI, 1.65 * Math.PI, false);
      bCtx.arc(-12, 0, 29, 1.55 * Math.PI, 0.45 * Math.PI, true);
      bCtx.closePath();
      bCtx.fill();

      // Radiant Sunburst
      ctx.strokeStyle = threadLight;
      ctx.lineWidth = 3.2;
      bCtx.strokeStyle = '#CFCFCF';
      bCtx.lineWidth = 3.5;

      const sunX = 28;
      const sunY = 0;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 13, 0, Math.PI * 2);
      ctx.stroke();

      bCtx.beginPath();
      bCtx.arc(sunX, sunY, 13, 0, Math.PI * 2);
      bCtx.stroke();

      for (let r = 0; r < 12; r++) {
        const angle = (r / 12) * Math.PI * 2;
        const x1 = sunX + Math.cos(angle) * 18;
        const y1 = sunY + Math.sin(angle) * 18;
        const x2 = sunX + Math.cos(angle) * 38;
        const y2 = sunY + Math.sin(angle) * 38;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        bCtx.beginPath();
        bCtx.moveTo(x1, y1);
        bCtx.lineTo(x2, y2);
        bCtx.stroke();
      }

      ctx.strokeStyle = threadShadow;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      bCtx.restore();
    };

    const step = 170;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const offsetX = (row % 2) * (step * 0.5);
        drawCelestialMotif(col * step + offsetX, row * step, 1.05);
      }
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

export interface BuiltShowroomResources {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
}

export function buildBlousonJacketMesh(
  garment: ShowroomGarment,
  tex: FabricTexturePair,
  isWornOnModel: boolean,
  isSoftwareGl: boolean,
  resources: BuiltShowroomResources
): THREE.Group {
  const jacketGroup = new THREE.Group();

  const fabricMat = new THREE.MeshPhysicalMaterial({
    map: tex.map,
    bumpMap: tex.bumpMap,
    bumpScale: garment.patternType === 'celestial' ? 0.014 : 0.008,
    roughness: garment.patternType === 'celestial' ? 0.62 : 0.8,
    metalness: 0.04,
    sheen: 0.35,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xffffff),
  });

  const ribMat = new THREE.MeshStandardMaterial({
    color: garment.ribHex,
    bumpMap: tex.bumpMap,
    bumpScale: 0.012,
    roughness: 0.88,
    metalness: 0.02,
  });

  const zipperMat = new THREE.MeshStandardMaterial({
    color: '#D2D7DF',
    roughness: 0.22,
    metalness: 0.9,
  });

  const collarMat = fabricMat.clone();
  collarMat.side = THREE.DoubleSide;

  resources.materials.push(fabricMat, ribMat, zipperMat, collarMat);

  // 1. Torso Sculpted Body
  const torsoPoints = [
    new THREE.Vector2(0.01, -0.34),
    new THREE.Vector2(0.185, -0.34),
    new THREE.Vector2(0.195, -0.28),
    new THREE.Vector2(0.225, -0.1),
    new THREE.Vector2(0.238, 0.12),
    new THREE.Vector2(0.205, 0.23),
    new THREE.Vector2(0.095, 0.26),
    new THREE.Vector2(0.01, 0.26),
  ];
  const torsoGeo = new THREE.LatheGeometry(torsoPoints, 40);
  torsoGeo.scale(1.06, 1.0, 0.64);
  resources.geometries.push(torsoGeo);

  const torsoMesh = new THREE.Mesh(torsoGeo, fabricMat);
  torsoMesh.castShadow = !isSoftwareGl;
  torsoMesh.receiveShadow = !isSoftwareGl;
  jacketGroup.add(torsoMesh);

  // 2. Elasticated Rib-Knit Waistband Hem
  const hemGeo = new THREE.CylinderGeometry(0.196, 0.184, 0.065, 36);
  hemGeo.scale(1.06, 1.0, 0.64);
  resources.geometries.push(hemGeo);

  const hemMesh = new THREE.Mesh(hemGeo, ribMat);
  hemMesh.position.y = -0.31;
  hemMesh.castShadow = !isSoftwareGl;
  jacketGroup.add(hemMesh);

  // 3. Center Front Brushed Silver Zipper Placket
  const zipTrackGeo = new THREE.BoxGeometry(0.012, 0.58, 0.016);
  const zipPullGeo = new THREE.BoxGeometry(0.018, 0.032, 0.022);
  resources.geometries.push(zipTrackGeo, zipPullGeo);

  const zipTrack = new THREE.Mesh(zipTrackGeo, zipperMat);
  zipTrack.position.set(0, -0.04, 0.148);
  jacketGroup.add(zipTrack);

  const zipPull = new THREE.Mesh(zipPullGeo, zipperMat);
  zipPull.position.set(0, 0.18, 0.154);
  jacketGroup.add(zipPull);

  // 4. Tailored Fold-Down Shirt Collar
  const collarCurve = new THREE.CylinderGeometry(
    0.105,
    0.118,
    0.068,
    32,
    1,
    true,
    Math.PI * 0.16,
    Math.PI * 1.68
  );
  collarCurve.scale(1.02, 1.0, 0.85);
  resources.geometries.push(collarCurve);

  const collarMesh = new THREE.Mesh(collarCurve, collarMat);
  collarMesh.position.set(0, 0.265, -0.005);
  collarMesh.rotation.x = 0.14;
  collarMesh.castShadow = !isSoftwareGl;
  jacketGroup.add(collarMesh);

  // 5. Left & Right Raglan Sleeves + Ribbed Cuffs
  const cuffGeo = new THREE.CylinderGeometry(0.051, 0.046, 0.055, 20);
  resources.geometries.push(cuffGeo);

  [-1, 1].forEach((side) => {
    const sleeveGroup = new THREE.Group();

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.185, 0.185, -0.01),
      new THREE.Vector3(side * 0.255, 0.02, 0.005),
      new THREE.Vector3(side * 0.285, -0.17, 0.025),
      new THREE.Vector3(side * 0.295, -0.3, 0.04),
    ]);

    const sleeveGeo = new THREE.TubeGeometry(curve, 24, 0.068, 20, false);
    const pos = sleeveGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < -0.1) {
        const factor = 1.0 - Math.min(0.24, (-0.1 - y) * 1.1);
        const cx = side * 0.288;
        const cz = 0.032;
        pos.setX(i, cx + (pos.getX(i) - cx) * factor);
        pos.setZ(i, cz + (pos.getZ(i) - cz) * factor);
      }
    }
    sleeveGeo.computeVertexNormals();
    resources.geometries.push(sleeveGeo);

    const sleeveMesh = new THREE.Mesh(sleeveGeo, fabricMat);
    sleeveMesh.castShadow = !isSoftwareGl;
    sleeveMesh.receiveShadow = !isSoftwareGl;
    sleeveGroup.add(sleeveMesh);

    const cuffMesh = new THREE.Mesh(cuffGeo, ribMat);
    cuffMesh.position.set(side * 0.296, -0.315, 0.042);
    cuffMesh.rotation.z = side * 0.12;
    cuffMesh.rotation.x = 0.12;
    cuffMesh.castShadow = !isSoftwareGl;
    sleeveGroup.add(cuffMesh);

    jacketGroup.add(sleeveGroup);
  });

  // 6. Slanted Welt Side Pockets
  const weltGeo = new THREE.BoxGeometry(0.016, 0.12, 0.022);
  resources.geometries.push(weltGeo);
  [-1, 1].forEach((side) => {
    const welt = new THREE.Mesh(weltGeo, ribMat);
    welt.position.set(side * 0.145, -0.16, 0.128);
    welt.rotation.z = side * 0.24;
    welt.rotation.y = side * 0.35;
    jacketGroup.add(welt);
  });

  // 7. Wooden Hanger & Chrome Hook (Rack Mode)
  if (!isWornOnModel) {
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#C49A6C',
      roughness: 0.45,
      metalness: 0.05,
    });
    const hookMat = new THREE.MeshStandardMaterial({
      color: '#D0D5DD',
      roughness: 0.2,
      metalness: 0.9,
    });
    resources.materials.push(woodMat, hookMat);

    const hangerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.19, 0.21, 0),
      new THREE.Vector3(-0.09, 0.275, 0),
      new THREE.Vector3(0, 0.295, 0),
      new THREE.Vector3(0.09, 0.275, 0),
      new THREE.Vector3(0.19, 0.21, 0),
    ]);
    const hangerGeo = new THREE.TubeGeometry(hangerCurve, 20, 0.011, 12, false);
    const stemGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.14, 12);
    const hookArcGeo = new THREE.TorusGeometry(0.024, 0.004, 10, 20, Math.PI * 1.35);
    resources.geometries.push(hangerGeo, stemGeo, hookArcGeo);

    const hangerBar = new THREE.Mesh(hangerGeo, woodMat);
    jacketGroup.add(hangerBar);

    const stem = new THREE.Mesh(stemGeo, hookMat);
    stem.position.set(0, 0.36, 0);
    jacketGroup.add(stem);

    const hookArc = new THREE.Mesh(hookArcGeo, hookMat);
    hookArc.position.set(0, 0.435, 0);
    jacketGroup.add(hookArc);
  }

  return jacketGroup;
}
