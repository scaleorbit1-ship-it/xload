import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePng(width, height) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw pixel data with filter byte per row
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.45;
  const rInner = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter type 0 (None)
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background squircle/circle
      if (dist <= rOuter) {
        // Gradient base: deep obsidian to electric blue/cyan
        const t = (x + y) / (width + height);
        let r = Math.round(15 * (1 - t) + 29 * t);
        let g = Math.round(23 * (1 - t) + 155 * t);
        let b = Math.round(42 * (1 - t) + 240 * t);
        let a = 255;

        // Inner glowing cross / arrow mark
        const inDiag1 = Math.abs(dx - dy) < width * 0.08 && dist < rInner;
        const inDiag2 = Math.abs(dx + dy) < width * 0.08 && dist < rInner;
        const inArrow = (Math.abs(dx) < width * 0.06 && dy > 0 && dy < rInner * 0.9) ||
                        (dy > rInner * 0.4 && dy < rInner * 0.9 && Math.abs(dx) < (rInner * 0.9 - dy) * 1.2);

        if (inDiag1 || inDiag2 || inArrow) {
          r = 255;
          g = 255;
          b = 255;
        }

        raw[pxOffset] = r;
        raw[pxOffset + 1] = g;
        raw[pxOffset + 2] = b;
        raw[pxOffset + 3] = a;
      } else {
        // Transparent outside
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
      }
    }
  }

  const idatChunk = makeChunk('IDAT', zlib.deflateSync(raw));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180));
console.log('✅ Generated PWA PNG icons successfully in /public');
