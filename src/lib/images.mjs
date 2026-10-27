/**
 * Leitura das dimensões de imagens PNG e JPEG direto do cabeçalho do arquivo.
 * Usado para preencher width/height nos <img> e evitar layout shift (CLS).
 */

import fs from 'node:fs';
import path from 'node:path';

function pngSize(buf) {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    // marcadores sem payload
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

export function imageSize(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return pngSize(buf);
  if (ext === '.jpg' || ext === '.jpeg') return jpegSize(buf);
  return null;
}

/** Percorre um diretório e devolve um mapa { caminhoRelativo: {width,height,bytes} }. */
export function scanImages(rootDir) {
  const map = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
        const size = imageSize(full);
        if (size) {
          const rel = path.relative(rootDir, full).split(path.sep).join('/');
          map.set(rel, { ...size, bytes: fs.statSync(full).size });
        }
      }
    }
  };
  walk(rootDir);
  return map;
}
