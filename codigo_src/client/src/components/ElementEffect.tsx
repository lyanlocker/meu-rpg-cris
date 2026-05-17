import React, { useEffect, useRef, useMemo } from "react";

type ElementType = "sangue" | "morte" | "conhecimento" | "energia" | "";

interface ElementEffectProps {
  element: ElementType;
  maskActive: boolean;
}

// Border frame thickness in px
const BX = 130; // left / right
const BY = 100; // top / bottom

/** Clip canvas context to only the border frame band (outer - inner hole) */
function clipToFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.beginPath();
  ctx.rect(0, 0, w, h);           // outer
  ctx.rect(BX, BY, w - BX * 2, h - BY * 2); // inner hole
  ctx.clip("evenodd");
}

// ─── SANGUE: pulsing vein network, framed ────────────────────────────────────
function VeinCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    type Seg = { x1: number; y1: number; x2: number; y2: number; depth: number };
    let segments: Seg[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

    const buildVeins = () => {
      segments = [];
      const w = canvas.width, h = canvas.height;
      let seed = 9173;
      const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

      // Only grow within the frame band
      const inFrame = (x: number, y: number) =>
        x < BX || x > w - BX || y < BY || y > h - BY;

      const grow = (x1: number, y1: number, angle: number, depth: number) => {
        if (depth <= 0) return;
        const len = 18 + rng() * 60;
        const x2 = Math.max(0, Math.min(w, x1 + Math.cos(angle) * len));
        const y2 = Math.max(0, Math.min(h, y1 + Math.sin(angle) * len));
        if (!inFrame((x1 + x2) / 2, (y1 + y2) / 2)) return;
        segments.push({ x1, y1, x2, y2, depth });
        grow(x2, y2, angle + (rng() - 0.5) * 0.85, depth - 1);
        if (rng() > 0.45) grow(x2, y2, angle + (rng() - 0.5) * 1.4, depth - 2);
      };

      // Spawn from all 4 edges
      for (let i = 0; i < 14; i++) grow(rng() * w, 0, Math.PI / 2 + (rng() - 0.5) * 0.5, 7);
      for (let i = 0; i < 14; i++) grow(rng() * w, h, -Math.PI / 2 + (rng() - 0.5) * 0.5, 7);
      for (let i = 0; i < 10; i++) grow(0, rng() * h, (rng() - 0.5) * 0.6, 7);
      for (let i = 0; i < 10; i++) grow(w, rng() * h, Math.PI + (rng() - 0.5) * 0.6, 7);
    };

    resize(); buildVeins();
    const onResize = () => { resize(); buildVeins(); };
    window.addEventListener("resize", onResize);

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      clipToFrame(ctx, canvas.width, canvas.height);

      const beat = 0.5 + 0.5 * Math.sin(time * 0.0025);
      for (const seg of segments) {
        const t = seg.depth / 7;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.strokeStyle = `rgba(${Math.floor(100 + beat * 130)}, 4, 4, ${0.25 + beat * 0.65})`;
        ctx.lineWidth = Math.max(0.4, t * (1.2 + beat * 3));
        ctx.shadowColor = "#cc0000";
        ctx.shadowBlur = beat * 12;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.restore();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── MORTE: tentacles from corners/edges, clipped to frame ──────────────────
function TentacleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const getTentacles = () => {
      const w = canvas.width, h = canvas.height;
      return [
        // Corners — 2 each
        { x: 0,   y: 0,   angle: 0.28,           phase: 0.0 },
        { x: 0,   y: 0,   angle: 0.85,           phase: 1.1 },
        { x: w,   y: 0,   angle: Math.PI - 0.28, phase: 0.5 },
        { x: w,   y: 0,   angle: Math.PI - 0.85, phase: 1.6 },
        { x: 0,   y: h,   angle: -0.28,          phase: 0.8 },
        { x: 0,   y: h,   angle: -0.85,          phase: 1.9 },
        { x: w,   y: h,   angle: Math.PI + 0.28, phase: 0.3 },
        { x: w,   y: h,   angle: Math.PI + 0.85, phase: 1.4 },
        // Mid-edges
        { x: w * 0.28, y: 0,   angle: Math.PI * 0.5,      phase: 2.0 },
        { x: w * 0.72, y: 0,   angle: Math.PI * 0.5,      phase: 0.7 },
        { x: 0,   y: h * 0.35, angle: 0.15,               phase: 1.3 },
        { x: 0,   y: h * 0.72, angle: -0.15,              phase: 2.5 },
        { x: w,   y: h * 0.4,  angle: Math.PI + 0.15,     phase: 2.3 },
        { x: w,   y: h * 0.7,  angle: Math.PI - 0.15,     phase: 0.9 },
        { x: w * 0.38, y: h,   angle: -Math.PI * 0.5,     phase: 0.4 },
        { x: w * 0.65, y: h,   angle: -Math.PI * 0.5,     phase: 1.7 },
      ];
    };

    const SEGS = 16;
    const SEG_LEN = 28;

    const drawTentacle = (sx: number, sy: number, angle: number, time: number, phase: number) => {
      const nodes: [number, number][] = [[sx, sy]];
      let x = sx, y = sy;
      for (let i = 1; i <= SEGS; i++) {
        const t = i / SEGS;
        const amp = 36 * (1 - t * 0.55);
        const wave = Math.sin(time * 0.0009 + i * 0.42 + phase) * amp;
        const wave2 = Math.sin(time * 0.0014 + i * 0.7 + phase + 2) * amp * 0.4;
        const perp = angle + Math.PI / 2;
        x += Math.cos(angle) * SEG_LEN + Math.cos(perp) * wave + Math.cos(perp + 0.5) * wave2;
        y += Math.sin(angle) * SEG_LEN + Math.sin(perp) * wave + Math.sin(perp + 0.5) * wave2;
        nodes.push([x, y]);
      }

      for (let i = 0; i < nodes.length - 1; i++) {
        const t = 1 - i / nodes.length;
        const [x1, y1] = nodes[i];
        const [x2, y2] = nodes[i + 1];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = Math.max(0.5, t * 20);
        const v = Math.floor(6 + t * 10);
        ctx.strokeStyle = `rgba(${v}, ${v}, ${v}, ${0.7 + t * 0.3})`;
        ctx.shadowColor = "#050505";
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
      // sucker spots
      for (let i = 2; i < nodes.length - 1; i += 3) {
        const t = 1 - i / nodes.length;
        const [nx, ny] = nodes[i];
        ctx.beginPath();
        ctx.arc(nx, ny, Math.max(1.5, t * 5.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(18, 18, 18, 0.85)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx, ny, Math.max(0.5, t * 2.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 45, 45, 0.7)`;
        ctx.fill();
      }
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      clipToFrame(ctx, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      getTentacles().forEach(t => drawTentacle(t.x, t.y, t.angle, time, t.phase));
      ctx.restore();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── CONHECIMENTO: yellow sigils, only in frame zone ─────────────────────────
const SIGIL_SYMBOLS = "ΨΩΣΔΛΦΞΠθβαγδεζηιλμνξπρστυφχψω∑∏∂∇∆∞≈∈∀∃∅⊂∩∪ℕℤℚℝℂℵ∴∵☽★✦✧❊✵⌖⌘".split("");

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function KnowledgeEffect() {
  const sigils = useMemo(() => {
    const items: { x: number; y: number; dur: number; delay: number; sym: string; size: number; tx: number; rot: number; opacity: number }[] = [];
    const BXP = BX / window.innerWidth * 100;   // px → %
    const BYP = BY / window.innerHeight * 100;

    const add = (x: number, y: number, idx: number) => {
      const i = items.length + idx * 3 + 1;
      items.push({
        x, y,
        dur: 3 + seededRand(i * 13) * 7,
        delay: seededRand(i * 17) * 12,
        sym: SIGIL_SYMBOLS[Math.floor(seededRand(i * 19) * SIGIL_SYMBOLS.length)],
        size: 10 + seededRand(i * 23) * 22,
        tx: (seededRand(i * 29) - 0.5) * 45,
        rot: (seededRand(i * 31) - 0.5) * 360,
        opacity: 0.45 + seededRand(i * 37) * 0.55,
      });
    };

    // Top strip
    for (let i = 0; i < 20; i++) add(seededRand(i * 7) * 96 + 2, seededRand(i * 11) * BYP, i);
    // Bottom strip
    for (let i = 0; i < 16; i++) add(seededRand((i + 30) * 7) * 96 + 2, 100 - BYP + seededRand((i + 30) * 11) * BYP, i + 30);
    // Left strip
    for (let i = 0; i < 12; i++) add(seededRand((i + 60) * 7) * BXP, seededRand((i + 60) * 11) * 96 + 2, i + 60);
    // Right strip
    for (let i = 0; i < 12; i++) add(100 - BXP + seededRand((i + 80) * 7) * BXP, seededRand((i + 80) * 11) * 96 + 2, i + 80);
    return items;
  }, []);

  return (
    <>
      {sigils.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          fontSize: `${s.size}px`,
          color: `rgba(250, 204, 21, ${s.opacity})`,
          fontFamily: "monospace", fontWeight: "bold",
          animation: `ef-sigil ${s.dur}s ${s.delay}s infinite ease-in-out`,
          ["--tx" as any]: `${s.tx}px`, ["--rot" as any]: `${s.rot}deg`,
          textShadow: `0 0 10px #facc15, 0 0 24px #eab308, 0 0 40px #ca8a04`,
          opacity: 0, userSelect: "none", pointerEvents: "none",
        }}>{s.sym}</div>
      ))}
    </>
  );
}

// ─── ENERGIA: large lightning bolts on borders, clipped to frame ──────────────
function EnergyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let lastBolt = 0;

    type Bolt = { x1: number; y1: number; x2: number; y2: number; alpha: number; life: number; width: number };
    const bolts: Bolt[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const drawBolt = (x1: number, y1: number, x2: number, y2: number, depth: number, jitter: number, alpha: number) => {
      if (depth <= 0 || alpha < 0.04) return;
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * jitter;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * jitter;
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x2, y2); ctx.stroke();
      if (Math.random() > 0.42)
        drawBolt(mx, my, mx + (Math.random() - 0.5) * jitter * 2, my + (Math.random() - 0.5) * jitter * 2, depth - 1, jitter * 0.62, alpha * 0.72);
    };

    const spawnBolt = (): Bolt => {
      const w = canvas.width, h = canvas.height;
      const side = Math.floor(Math.random() * 4);
      // endpoint stays within the frame band
      let x1, y1, x2, y2;
      if (side === 0) {
        x1 = Math.random() * w; y1 = 0;
        x2 = x1 + (Math.random() - 0.5) * w * 0.5; y2 = BY * (0.2 + Math.random() * 0.9);
      } else if (side === 1) {
        x1 = w; y1 = Math.random() * h;
        x2 = w - BX * (0.2 + Math.random() * 0.9); y2 = y1 + (Math.random() - 0.5) * h * 0.5;
      } else if (side === 2) {
        x1 = Math.random() * w; y1 = h;
        x2 = x1 + (Math.random() - 0.5) * w * 0.5; y2 = h - BY * (0.2 + Math.random() * 0.9);
      } else {
        x1 = 0; y1 = Math.random() * h;
        x2 = BX * (0.2 + Math.random() * 0.9); y2 = y1 + (Math.random() - 0.5) * h * 0.5;
      }
      return { x1, y1, x2, y2, alpha: 1, life: 1, width: 2.5 + Math.random() * 4.5 };
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      clipToFrame(ctx, canvas.width, canvas.height);

      if (time - lastBolt > 85) {
        lastBolt = time;
        const n = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < n; i++) bolts.push(spawnBolt());
      }

      ctx.lineCap = "round";
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 32;

      for (const bolt of bolts) {
        ctx.strokeStyle = `rgba(210, 150, 255, ${bolt.alpha})`;
        ctx.lineWidth = bolt.width * bolt.life;
        drawBolt(bolt.x1, bolt.y1, bolt.x2, bolt.y2, 6, 170, bolt.alpha);
        bolt.life -= 0.055;
        bolt.alpha = Math.max(0, bolt.life);
      }
      ctx.globalAlpha = 1;
      for (let i = bolts.length - 1; i >= 0; i--) { if (bolts[i].life <= 0) bolts.splice(i, 1); }

      ctx.restore();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ElementEffect({ element, maskActive }: ElementEffectProps) {
  if (!element || !maskActive) return null;

  return (
    <>
      <style>{`
        @keyframes ef-sigil {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 0.85; }
          100% { transform: translateY(-60px) translateX(var(--tx)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {element === "sangue"         && <VeinCanvas />}
        {element === "morte"          && <TentacleCanvas />}
        {element === "conhecimento"   && <KnowledgeEffect />}
        {element === "energia"        && <EnergyCanvas />}
      </div>
    </>
  );
}
