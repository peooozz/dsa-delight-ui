export const COLORS = {
  bg: '#0b0c10',
  bg2: '#111318',
  bg3: '#191d26',
  bg4: '#1f2433',
  border: '#2a2f42',
  border2: '#363d54',
  text: '#e2e8f5',
  text2: '#8b95b0',
  text3: '#5a637a',
  orange: '#ff6b35',
  teal: '#00d4a8',
  violet: '#9b5de5',
  warm: '#f7c59f',
  red: '#ff2d55',
  yellow: '#ffd166',
  blue: '#5bc0eb',
};

export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = COLORS.text, size = 13, font = 'Space Mono') {
  ctx.fillStyle = color;
  ctx.font = `${size}px '${font}', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = COLORS.border2, headSize = 8) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headSize * Math.cos(angle - Math.PI / 7), y2 - headSize * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x2 - headSize * Math.cos(angle + Math.PI / 7), y2 - headSize * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha = 0.3) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, hexToRgba(color, alpha));
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill?: string, stroke?: string, lineWidth = 2) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
}

export function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = COLORS.border2, lineWidth = 1.5) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
export function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
export function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
