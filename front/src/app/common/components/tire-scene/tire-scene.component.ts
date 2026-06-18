import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

interface Phase {
  key: string;
  label: string;
  dur: number;
}

interface Terrain {
  name: string;
  sky: [string, string];
  ground: string;
  tree?: boolean;
  lane?: boolean;
  rough?: boolean;
  peaks?: boolean;
}

const PHASES: Phase[] = [
  { key: 'profil', label: 'Profil — bande de roulement', dur: 5.5 },
  { key: 'turn',   label: 'Transition',                  dur: 1.6 },
  { key: 'face',   label: 'Face — carcasse & volume',    dur: 5.0 },
  { key: 'out',    label: 'Le système complet',          dur: 2.2 },
  { key: 'ride',   label: 'Sur tous les terrains',       dur: 13.0 },
];
const TOTAL = PHASES.reduce((s, p) => s + p.dur, 0);

const TERRAINS: Terrain[] = [
  { name: 'Forêt',          sky: ['#27331f', '#5e7a45'], ground: '#2f2a1d', tree: true },
  { name: 'Piste cyclable', sky: ['#6f95cf', '#cfe0f5'], ground: '#3a3f45', lane: true },
  { name: 'Gravel',         sky: ['#caa46a', '#e7cda0'], ground: '#6b5436', rough: true },
  { name: 'Montagne',       sky: ['#33508c', '#8aa6d6'], ground: '#33373f', peaks: true },
];

@Component({
  selector: 'app-tire-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tire-scene.component.html',
  styleUrls: ['./tire-scene.component.scss'],
})
export class TireSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('phaseLabel') private phaseLabelRef!: ElementRef<HTMLElement>;
  @ViewChild('progressBar') private progressBarRef!: ElementRef<HTMLElement>;

  private ctx!: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private DPR = 1;
  private clock = 0;
  private wheelAng = 0;
  private paused = false;
  private last = 0;
  private rafId = 0;
  private resizeObserver!: ResizeObserver;

  private imgSide!: HTMLImageElement;  // gravel_tire5 — ring (profil)
  private imgFace!: HTMLImageElement;  // gravel_tire4 — tread strip (face)

  protected get isPaused() { return this.paused; }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.imgSide = new Image();
    this.imgSide.src = '/assets/images/tires/gravel/gravel_tire5.webp';

    this.imgFace = new Image();
    this.imgFace.src = '/assets/images/tires/gravel/gravel_tire4.webp';

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();

    this.last = performance.now();
    this.rafId = requestAnimationFrame((t) => this.frame(t));
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
  }

  protected togglePause(): void {
    this.paused = !this.paused;
  }

  protected restart(): void {
    this.clock = 0;
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.DPR = Math.min(devicePixelRatio || 1, 2);
    this.W = canvas.offsetWidth;
    this.H = canvas.offsetHeight;
    canvas.width = this.W * this.DPR;
    canvas.height = this.H * this.DPR;
    this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
  }

  private phaseAt(time: number) {
    let acc = 0;
    for (let i = 0; i < PHASES.length; i++) {
      if (time < acc + PHASES[i].dur) {
        return { i, key: PHASES[i].key, p: (time - acc) / PHASES[i].dur, label: PHASES[i].label };
      }
      acc += PHASES[i].dur;
    }
    const last = PHASES[PHASES.length - 1];
    return { i: PHASES.length - 1, key: last.key, p: 1, label: last.label };
  }

  // ── Tire profile (side view) ─────────────────────────────────────────────
  private drawTireProfile(cx: number, cy: number, h: number, w: number, scroll: number): void {
    const ctx = this.ctx;
    const s = w / 46; // scale factor relative to original 46px design
    const rowH    = 26 * s;
    const knobW   = 14 * s;
    const knobH   = 18 * s;
    const cKnobW  = 14 * s;
    const cKnobH  = 16 * s;
    const staggerW = 14 * s;
    const colGap  = 20 * s;
    const padX    = 10 * s;

    ctx.save();
    ctx.translate(cx, cy);
    const r = w / 2;
    const grad = ctx.createLinearGradient(-r, 0, r, 0);
    grad.addColorStop(0, '#0a0a09');
    grad.addColorStop(0.5, '#34332e');
    grad.addColorStop(1, '#0a0a09');
    ctx.fillStyle = grad;
    this.roundRect(-r, -h / 2, w, h, r);
    ctx.fill();

    ctx.save();
    this.roundRect(-r, -h / 2, w, h, r);
    ctx.clip();
    const rows = Math.ceil(h / rowH) + 2;
    for (let i = -1; i < rows; i++) {
      const y = -h / 2 + i * rowH + (scroll % rowH);
      const stagger = (i % 2) * staggerW;
      for (let c = 0; c < 2; c++) {
        this.drawKnob(-r + padX + c * colGap, y, knobW, knobH, false, s);
      }
      this.drawKnob(-knobW / 2, y + rowH * 0.5, cKnobW, cKnobH, true, s);
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    this.roundRect(-r, -h / 2, w, h, r);
    ctx.stroke();
    ctx.restore();
  }

  private drawKnob(x: number, y: number, w: number, h: number, center = false, s = 1): void {
    const ctx = this.ctx;
    ctx.fillStyle = center ? '#3f3e38' : '#2c2b27';
    this.roundRect(x, y, w, h, 4 * s);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    this.roundRect(x + s, y + s, w - 2 * s, 3 * s, 2 * s);
    ctx.fill();
  }

  // ── Tire front (ring view) ───────────────────────────────────────────────
  private drawTireFront(cx: number, cy: number, R: number, ang: number, squash: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(squash, 1);
    const thick = R * 0.3;
    const g = ctx.createRadialGradient(0, 0, R - thick, 0, 0, R + thick * 0.4);
    g.addColorStop(0, '#15140f');
    g.addColorStop(0.7, '#2b2a25');
    g.addColorStop(1, '#070706');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R + thick * 0.4, 0, TAU);
    ctx.arc(0, 0, R - thick, 0, TAU, true);
    ctx.fill('evenodd');
    ctx.save();
    ctx.rotate(ang);
    const n = 44;
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate((i / n) * TAU);
      ctx.fillStyle = i % 2 ? '#34332d' : '#262521';
      this.roundRect(-6, -(R + thick * 0.4), 12, thick * 0.55, 3);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R - thick, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // ── Annotations ──────────────────────────────────────────────────────────
  private annotation(
    x: number, y: number,
    tx: number, ty: number,
    title: string, sub: string,
    appear: number,
  ): void {
    if (appear <= 0) return;
    const ctx = this.ctx;
    const a = clamp(appear, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#f2c200';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(242,194,0,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 4 + 6 * (1 - a), 0, TAU);
    ctx.stroke();
    const lx = lerp(x, tx, a);
    ctx.strokeStyle = '#f2c200';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(lx, ty);
    ctx.stroke();
    ctx.globalAlpha = a;
    const right = tx > x;
    ctx.textAlign = right ? 'left' : 'end';
    ctx.fillStyle = '#f4f2ec';
    ctx.font = '600 15px Archivo, sans-serif';
    ctx.fillText(title, tx + (right ? 8 : -8), ty - 3);
    ctx.fillStyle = 'rgba(244,242,236,0.65)';
    ctx.font = '400 12px Inter, sans-serif';
    ctx.fillText(sub, tx + (right ? 8 : -8), ty + 14);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ── Terrain ───────────────────────────────────────────────────────────────
  private drawTerrain(T: Terrain, scroll: number, horizon: number): void {
    const ctx = this.ctx;
    const { W, H } = this;
    const g = ctx.createLinearGradient(0, 0, 0, horizon + 40);
    g.addColorStop(0, T.sky[0]);
    g.addColorStop(1, T.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizon + 40);

    if (T.peaks) {
      ([['#2c3e63', 0.3, 0.42], ['#3a5183', 0.5, 0.30]] as [string, number, number][]).forEach(([c, sp, hh]) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        const pk = 6, span = W / pk;
        for (let i = 0; i <= pk; i++) {
          const px = i * span - ((scroll * sp) % span);
          ctx.lineTo(px, horizon - H * hh * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.7))));
          ctx.lineTo(px + span / 2, horizon);
        }
        ctx.lineTo(W, horizon);
        ctx.fill();
      });
    }
    if (T.tree) {
      for (let i = 0; i < 8; i++) {
        const x = ((i * 180 - scroll * 0.6) % (W + 200) + W + 200) % (W + 200) - 100;
        this.drawTree(x, horizon, 60 + (i % 3) * 18);
      }
    }
    ctx.fillStyle = T.ground;
    ctx.fillRect(0, horizon, W, H - horizon);

    if (T.lane) {
      ctx.fillStyle = '#b8412e';
      ctx.fillRect(0, horizon, W, 40);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([30, 26]);
      ctx.lineDashOffset = scroll % 56;
      ctx.beginPath();
      ctx.moveTo(0, horizon + 20);
      ctx.lineTo(W, horizon + 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (T.rough) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 0; i < 46; i++) {
        const x = ((i * 97 - scroll) % W + W) % W;
        const y = horizon + 16 + ((i * 53) % (H - horizon - 20));
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + (i % 3), 0, TAU);
        ctx.fill();
      }
    }
    ctx.strokeStyle = 'rgba(244,242,236,0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([32, 32]);
    ctx.lineDashOffset = scroll % 64;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 30);
    ctx.lineTo(W, horizon + 30);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawTree(x: number, base: number, h: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1c2614';
    ctx.fillRect(x - 3, base - h * 0.3, 6, h * 0.3);
    ctx.beginPath();
    ctx.moveTo(x, base - h);
    ctx.lineTo(x - h * 0.32, base - h * 0.25);
    ctx.lineTo(x + h * 0.32, base - h * 0.25);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, base - h * 0.7);
    ctx.lineTo(x - h * 0.4, base - h * 0.05);
    ctx.lineTo(x + h * 0.4, base - h * 0.05);
    ctx.fill();
  }

  // ── Bike + rider ─────────────────────────────────────────────────────────
  private drawBike(cx: number, wy: number, scale: number, ang: number, skipWheels = false): void {
    const ctx = this.ctx;
    const wb = 96 * scale, r = 44 * scale;
    const rear = cx - wb / 2, front = cx + wb / 2;
    if (!skipWheels) {
      this.drawRoadWheel(rear, wy, r, ang);
      this.drawRoadWheel(front, wy, r, ang);
    }

    const bb   = { x: cx, y: wy };
    const seat = { x: rear + 24 * scale, y: wy - 58 * scale };
    const head = { x: front - 16 * scale, y: wy - 50 * scale };
    const bar  = { x: front - 6 * scale,  y: wy - 44 * scale };

    ctx.strokeStyle = '#0d0c08';
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = 'round';
    this.line(rear, wy, bb.x, bb.y);
    this.line(bb.x, bb.y, seat.x, seat.y);
    this.line(seat.x, seat.y, rear, wy);
    this.line(seat.x, seat.y, head.x, head.y);
    this.line(bb.x, bb.y, head.x, head.y);
    this.line(head.x, head.y, front, wy);
    this.line(head.x, head.y, bar.x, bar.y);

    ctx.fillStyle = '#0d0c08';
    ctx.beginPath();
    ctx.arc(bb.x, bb.y, 4 * scale, 0, TAU);
    ctx.fill();

    const hip  = { x: seat.x, y: seat.y - 4 * scale };
    const sh   = { x: (seat.x + head.x) / 2 + 8 * scale, y: seat.y - 34 * scale };
    ctx.strokeStyle = '#1452c7';
    ctx.lineWidth = 7 * scale;
    this.line(hip.x, hip.y, sh.x, sh.y);

    const foot = { x: bb.x + Math.cos(ang) * 16 * scale, y: bb.y + Math.sin(ang) * 16 * scale };
    const knee = { x: bb.x - 4 * scale, y: (hip.y + bb.y) / 2 - 6 * scale + Math.sin(ang) * 4 * scale };
    ctx.lineWidth = 6 * scale;
    this.line(hip.x, hip.y, knee.x, knee.y);
    this.line(knee.x, knee.y, foot.x, foot.y);
    ctx.lineWidth = 5 * scale;
    this.line(sh.x, sh.y, bar.x, bar.y);

    ctx.fillStyle = '#f4f2ec';
    ctx.beginPath();
    ctx.arc(sh.x + 12 * scale, sh.y - 10 * scale, 8 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#f2c200';
    ctx.beginPath();
    ctx.arc(sh.x + 12 * scale, sh.y - 12 * scale, 9 * scale, Math.PI, TAU);
    ctx.fill();
  }

  private drawRoadWheel(x: number, y: number, r: number, ang: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#f4f2ec';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    ctx.rotate(ang);
    ctx.strokeStyle = 'rgba(170,170,160,0.55)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15);
      ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
      ctx.stroke();
    }
    ctx.fillStyle = '#f4f2ec';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.15, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#f2c200';
    ctx.beginPath();
    ctx.arc(0, -r * 0.78, r * 0.06, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private line(x1: number, y1: number, x2: number, y2: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ── Real tire images ─────────────────────────────────────────────────────

  private drawSideTire(cx: number, cy: number, ang: number): void {
    const img = this.imgSide;
    if (!img?.complete || !img.naturalWidth) return;
    const size = Math.min(this.W, this.H) * 0.78;
    const ctx  = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
    this.drawVignette(cx, cy, size * 0.5);
  }

  private drawFaceTire(cx: number, cy: number): void {
    const img = this.imgFace;
    if (!img?.complete || !img.naturalWidth) return;
    // scale by width so the strip is visually prominent, clip excess height
    const drawW = this.W * 0.22;
    const drawH = Math.min(drawW * (img.naturalHeight / img.naturalWidth), this.H * 0.92);
    this.ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    this.drawVignetteRect(cx, cy, drawW, drawH);
  }

  private drawVignette(cx: number, cy: number, r: number): void {
    const ctx  = this.ctx;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.62, cx, cy, r * 1.05);
    grad.addColorStop(0, 'rgba(13,12,8,0)');
    grad.addColorStop(1, 'rgba(13,12,8,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2);
  }

  private drawVignetteRect(cx: number, cy: number, w: number, h: number): void {
    const ctx   = this.ctx;
    const padX  = w * 0.2;
    const padY  = h * 0.05;
    // top fade
    let g = ctx.createLinearGradient(0, cy - h / 2, 0, cy - h / 2 + padY * 3);
    g.addColorStop(0, 'rgba(13,12,8,1)'); g.addColorStop(1, 'rgba(13,12,8,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - w / 2 - padX, cy - h / 2, w + padX * 2, padY * 3);
    // bottom fade
    g = ctx.createLinearGradient(0, cy + h / 2 - padY * 3, 0, cy + h / 2);
    g.addColorStop(0, 'rgba(13,12,8,0)'); g.addColorStop(1, 'rgba(13,12,8,1)');
    ctx.fillStyle = g; ctx.fillRect(cx - w / 2 - padX, cy + h / 2 - padY * 3, w + padX * 2, padY * 3);
    // left fade
    g = ctx.createLinearGradient(cx - w / 2, 0, cx - w / 2 + padX, 0);
    g.addColorStop(0, 'rgba(13,12,8,1)'); g.addColorStop(1, 'rgba(13,12,8,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - w / 2 - padX, cy - h / 2, padX * 2, h);
    // right fade
    g = ctx.createLinearGradient(cx + w / 2 - padX, 0, cx + w / 2, 0);
    g.addColorStop(0, 'rgba(13,12,8,0)'); g.addColorStop(1, 'rgba(13,12,8,1)');
    ctx.fillStyle = g; ctx.fillRect(cx + w / 2 - padX, cy - h / 2, padX * 2, h);
  }

  // ── Main render loop ──────────────────────────────────────────────────────
  private render(): void {
    const { W, H, ctx, clock, wheelAng } = this;
    const cx      = W * 0.5;
    const cy      = H * 0.5;
    const tireW   = Math.max(H * 0.1, 60);
    const tireH   = H * 0.78;
    const faceR   = Math.min(W, H) * 0.38;
    const scroll  = clock * 180;
    const horizon = H * 0.62;
    const bikeScale = (H * 0.075) / 44;

    const D_PROFIL      = 5.5;
    const D_TO_FACE     = 1.4;
    const D_FACE        = 5.0;
    const D_TO_RIDE     = 1.4;
    const D_RIDE        = 13.0;
    const D_TO_PROFIL   = 1.4;
    const LOOP_DUR      = D_PROFIL + D_TO_FACE + D_FACE + D_TO_RIDE + D_RIDE + D_TO_PROFIL;

    const t = clock % LOOP_DUR;

    ctx.fillStyle = '#0d0c08';
    ctx.fillRect(0, 0, W, H);

    const label = (s: string) => { if (this.phaseLabelRef) this.phaseLabelRef.nativeElement.textContent = s; };
    const prog  = (p: number) => { if (this.progressBarRef) this.progressBarRef.nativeElement.style.width = `${clamp(p, 0, 1) * 100}%`; };

    // ── profil ───────────────────────────────────────────────────────────────
    if (t < D_PROFIL) {
      const p  = t / D_PROFIL;
      const sR = Math.min(W, H) * 0.78 * 0.5;
      label('Profil — bande de roulement'); prog(p);
      this.drawSideTire(cx, cy, wheelAng * 0.5);
      const ex = W * 0.16;
      this.annotation(cx + sR * 0.82, cy - sR * 0.5,  cx + ex, cy - sR * 0.55,
        'Crampons agressifs', 'Accroche en courbe', (p - 0.15) / 0.25);
      this.annotation(cx - sR * 0.82, cy + sR * 0.5,  cx - ex, cy + sR * 0.55,
        'Gomme tendre', 'Adhérence maximale', (p - 0.5) / 0.25);
    }

    // ── fade profil → face ────────────────────────────────────────────────
    else if (t < D_PROFIL + D_TO_FACE) {
      const p = ease((t - D_PROFIL) / D_TO_FACE);
      label('Transition');
      ctx.globalAlpha = 1 - p; this.drawSideTire(cx, cy, wheelAng * 0.5);
      ctx.globalAlpha = p;     this.drawFaceTire(cx, cy);
      ctx.globalAlpha = 1;
    }

    // ── face ─────────────────────────────────────────────────────────────────
    else if (t < D_PROFIL + D_TO_FACE + D_FACE) {
      const p         = (t - D_PROFIL - D_TO_FACE) / D_FACE;
      const halfStrip = W * 0.11; // half of the drawn strip width (W * 0.22)
      label('Face — bande de roulement'); prog(p);
      this.drawFaceTire(cx, cy);
      this.annotation(cx + halfStrip, cy - H * 0.1, cx + W * 0.26, cy - H * 0.1,
        'Crampons agressifs', 'Accroche tout-terrain', (p - 0.12) / 0.22);
      this.annotation(cx - halfStrip, cy + H * 0.1, cx - W * 0.26, cy + H * 0.1,
        'Gomme tubeless', 'Basse résistance au roulement', (p - 0.5) / 0.22);
    }

    // ── fade face → ride ──────────────────────────────────────────────────
    else if (t < D_PROFIL + D_TO_FACE + D_FACE + D_TO_RIDE) {
      const p = ease((t - D_PROFIL - D_TO_FACE - D_FACE) / D_TO_RIDE);
      label('Transition');
      ctx.globalAlpha = 1 - p;
      this.drawFaceTire(cx, cy);
      ctx.globalAlpha = p;
      this.drawTerrain(TERRAINS[0], scroll, horizon);
      const wr   = 44 * bikeScale;
      const wb   = 96 * bikeScale;
      const wy   = horizon - wr;
      const imgS = this.imgSide;
      if (imgS?.complete && imgS.naturalWidth) {
        for (const wx of [cx - wb / 2, cx + wb / 2]) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(wx, wy, wr * 1.04, 0, TAU);
          ctx.clip();
          ctx.globalCompositeOperation = 'darken';
          ctx.globalAlpha = p;
          ctx.translate(wx, wy);
          ctx.rotate(wheelAng);
          ctx.drawImage(imgS, -wr, -wr, wr * 2, wr * 2);
          ctx.restore();
        }
      }
      ctx.globalAlpha = p;
      this.drawBike(cx, horizon - 44 * bikeScale, bikeScale, wheelAng, true);
      ctx.globalAlpha = 1;
    }

    // ── ride ─────────────────────────────────────────────────────────────────
    else if (t < D_PROFIL + D_TO_FACE + D_FACE + D_TO_RIDE + D_RIDE) {
      const rideT      = t - D_PROFIL - D_TO_FACE - D_FACE - D_TO_RIDE;
      const p          = rideT / D_RIDE;
      const seg        = p * TERRAINS.length;
      const ti         = Math.floor(seg) % TERRAINS.length;
      const next       = (ti + 1) % TERRAINS.length;
      const local      = seg - Math.floor(seg);
      const rideScroll = rideT * 220;

      label(`${TERRAINS[ti].name}`); prog(p);

      this.drawTerrain(TERRAINS[ti], rideScroll, horizon);
      if (local > 0.82) {
        ctx.globalAlpha = (local - 0.82) / 0.18;
        this.drawTerrain(TERRAINS[next], rideScroll, horizon);
        ctx.globalAlpha = 1;
      }

      // tire images on bike wheels, clipped to wheel circle so spokes render on top
      const wr    = 44 * bikeScale;
      const wb    = 96 * bikeScale;
      const wy    = horizon - wr;
      const imgS  = this.imgSide;
      if (imgS?.complete && imgS.naturalWidth) {
        for (const wx of [cx - wb / 2, cx + wb / 2]) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(wx, wy, wr * 1.04, 0, TAU);
          ctx.clip();
          ctx.globalCompositeOperation = 'darken';
          ctx.translate(wx, wy);
          ctx.rotate(wheelAng);
          ctx.drawImage(imgS, -wr, -wr, wr * 2, wr * 2);
          ctx.restore();
        }
      }

      this.drawBike(cx, horizon - 44 * bikeScale, bikeScale, wheelAng, true);

      // terrain name fade in/out
      const nameAlpha = clamp(Math.min(local * 5, (1 - local) * 5), 0, 1);
      ctx.globalAlpha = nameAlpha;
      ctx.fillStyle   = '#f4f2ec';
      ctx.font        = `700 ${Math.round(H * 0.04)}px Archivo, sans-serif`;
      ctx.textAlign   = 'center';
      ctx.fillText(TERRAINS[ti].name.toUpperCase(), cx, H * 0.18);
      ctx.globalAlpha = 1;
      ctx.textAlign   = 'left';
    }

    // ── fade ride → profil ────────────────────────────────────────────────
    else {
      const rideScroll = (D_PROFIL + D_TO_FACE + D_FACE + D_TO_RIDE + D_RIDE) * 220;
      const p    = ease((t - D_PROFIL - D_TO_FACE - D_FACE - D_TO_RIDE - D_RIDE) / D_TO_PROFIL);
      const wr   = 44 * bikeScale;
      const wb   = 96 * bikeScale;
      const wy   = horizon - wr;
      const imgS = this.imgSide;
      label('Transition');
      ctx.globalAlpha = 1 - p;
      this.drawTerrain(TERRAINS[TERRAINS.length - 1], rideScroll, horizon);
      if (imgS?.complete && imgS.naturalWidth) {
        for (const wx of [cx - wb / 2, cx + wb / 2]) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(wx, wy, wr * 1.04, 0, TAU);
          ctx.clip();
          ctx.globalCompositeOperation = 'darken';
          ctx.translate(wx, wy);
          ctx.rotate(wheelAng);
          ctx.drawImage(imgS, -wr, -wr, wr * 2, wr * 2);
          ctx.restore();
        }
      }
      this.drawBike(cx, horizon - 44 * bikeScale, bikeScale, wheelAng, true);
      ctx.globalAlpha = p;
      this.drawSideTire(cx, cy, wheelAng * 0.5);
      ctx.globalAlpha = 1;
    }
  }

  private frame(now: number): void {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    if (!this.paused) {
      const LOOP_DUR = 5.5 + 1.4 + 5.0 + 1.4 + 13.0 + 1.4;
      this.clock = (this.clock + dt) % LOOP_DUR;
      this.wheelAng += dt * 7;
    }
    this.render();
    this.rafId = requestAnimationFrame((t) => this.frame(t));
  }
}
