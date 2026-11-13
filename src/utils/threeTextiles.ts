import * as THREE from 'three';

/**
 * Generates a high-frequency seamless procedural weave bump map for tactile textile light response
 */
export function createTextileBumpMap(
  weaveType: 'lawn' | 'batik' | 'mirror' | 'cotton' | 'silk' | 'linen' | 'brocade',
  anisotropy = 4
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const step = weaveType === 'silk' || weaveType === 'lawn' ? 3 : weaveType === 'linen' ? 5 : 4;

  // Alternating warp & weft micro-threads
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const parity = ((x / step) + (y / step)) % 2 === 0;
      const tone = parity ? 168 : 98;
      ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
      ctx.fillRect(x, y, step - 0.5, step - 0.5);
    }
  }

  // Slub / embroidery raised relief for brocade, batik, and mirror zari
  if (weaveType === 'mirror' || weaveType === 'brocade') {
    ctx.strokeStyle = 'rgba(235, 235, 235, 0.55)';
    ctx.lineWidth = 2;
    const grid = 64;
    for (let gx = 0; gx < size; gx += grid) {
      for (let gy = 0; gy < size; gy += grid) {
        ctx.strokeRect(gx + 14, gy + 14, 36, 36);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (weaveType === 'linen' || weaveType === 'batik') {
    ctx.strokeStyle = 'rgba(205, 205, 205, 0.25)';
    ctx.lineWidth = 1.25;
    for (let i = 0; i < 40; i++) {
      const y = (i * 29) % size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + ((i % 3) - 1) * 4);
      ctx.stroke();
    }
  }

  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 3);
  bump.anisotropy = Math.min(8, anisotropy);
  return bump;
}
