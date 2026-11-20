import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type Optimizer = 'sgd' | 'momentum' | 'adam';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mx: number;
  my: number;
  path: Array<[number, number]>;
}

const LOSS = (x: number, y: number) => 0.35 * x * x + 2.4 * y * y;
const GRAD = (x: number, y: number): [number, number] => [0.7 * x, 4.8 * y];

function makeInitialParticles(): Particle[] {
  const pts: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + 0.2;
    const rx = 2.6 + (i % 3) * 0.45;
    const ry = 1.15 + ((i + 1) % 3) * 0.25;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    pts.push({ x, y, vx: 0, vy: 0, mx: 0, my: 0, path: [[x, y]] });
  }
  return pts;
}

export const GradientDescentLab: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>(makeInitialParticles());
  const stepRef = useRef(0);
  const lossHistoryRef = useRef<number[]>([]);

  const [lr, setLr] = useState(0.14);
  const [optimizer, setOptimizer] = useState<Optimizer>('sgd');
  const [running, setRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [meanLoss, setMeanLoss] = useState(() => {
    const pts = particlesRef.current;
    return pts.reduce((a, p) => a + LOSS(p.x, p.y), 0) / pts.length;
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const isDark = theme === 'dark';
    const bg = isDark ? '#0a0d1a' : '#fafaf5';
    const grid = isDark ? 'rgba(232,230,220,0.08)' : 'rgba(26,26,26,0.08)';
    const bp = isDark ? '#6b8eff' : '#3553ff';
    const ink = isDark ? '#e8e6dc' : '#1a1a1a';
    const warn = isDark ? '#d4a83d' : '#b8870f';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const toPx = (x: number, y: number): [number, number] => [
      ((x + 4) / 8) * W,
      ((2.2 - y) / 4.4) * H,
    ];

    // Grid & Elliptical Contours L = 0.35 x^2 + 2.4 y^2 = c
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    [0.25, 0.75, 1.5, 2.8, 4.5, 6.5].forEach((c) => {
      const rx = Math.sqrt(c / 0.35);
      const ry = Math.sqrt(c / 2.4);
      const pxRx = (rx / 8) * W;
      const pxRy = (ry / 4.4) * H;
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, pxRx, pxRy, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(107,142,255,0.22)' : 'rgba(53,83,255,0.2)';
      ctx.stroke();
    });

    // Global Minimum Crosshair
    ctx.strokeStyle = warn;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 7, H / 2);
    ctx.lineTo(W / 2 + 7, H / 2);
    ctx.moveTo(W / 2, H / 2 - 7);
    ctx.lineTo(W / 2, H / 2 + 7);
    ctx.stroke();

    // Particle Trajectories
    for (const p of particlesRef.current) {
      if (p.path.length > 1) {
        ctx.beginPath();
        p.path.forEach(([px, py], idx) => {
          const [sx, sy] = toPx(px, py);
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.strokeStyle = isDark ? 'rgba(107,142,255,0.45)' : 'rgba(53,83,255,0.4)';
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
      const [cx, cy] = toPx(p.x, p.y);
      ctx.fillStyle = bp;
      ctx.fillRect(cx - 3.5, cy - 3.5, 7, 7);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 3.5, cy - 3.5, 7, 7);
    }
  }, [theme]);

  const advanceStep = useCallback(() => {
    const t = stepRef.current + 1;
    stepRef.current = t;
    const beta1 = 0.85;
    const beta2 = 0.99;
    const eps = 1e-6;

    particlesRef.current.forEach((p) => {
      const [gx, gy] = GRAD(p.x, p.y);
      if (optimizer === 'sgd') {
        p.x -= lr * gx;
        p.y -= lr * gy;
      } else if (optimizer === 'momentum') {
        p.vx = 0.78 * p.vx + lr * gx;
        p.vy = 0.78 * p.vy + lr * gy;
        p.x -= p.vx;
        p.y -= p.vy;
      } else {
        p.mx = beta1 * p.mx + (1 - beta1) * gx;
        p.my = beta1 * p.my + (1 - beta1) * gy;
        p.vx = beta2 * p.vx + (1 - beta2) * gx * gx;
        p.vy = beta2 * p.vy + (1 - beta2) * gy * gy;
        const mHatX = p.mx / (1 - Math.pow(beta1, t));
        const mHatY = p.my / (1 - Math.pow(beta1, t));
        const vHatX = p.vx / (1 - Math.pow(beta2, t));
        const vHatY = p.vy / (1 - Math.pow(beta2, t));
        p.x -= (lr * mHatX) / (Math.sqrt(vHatX) + eps);
        p.y -= (lr * mHatY) / (Math.sqrt(vHatY) + eps);
      }
      p.x = Math.max(-5, Math.min(5, p.x));
      p.y = Math.max(-3, Math.min(3, p.y));
      p.path.push([p.x, p.y]);
      if (p.path.length > 60) p.path.shift();
    });

    const avg =
      particlesRef.current.reduce((acc, p) => acc + LOSS(p.x, p.y), 0) / particlesRef.current.length;
    lossHistoryRef.current.push(avg);
    setStepCount(t);
    setMeanLoss(avg);
    draw();
  }, [draw, lr, optimizer]);

  const reset = useCallback(() => {
    setRunning(false);
    stepRef.current = 0;
    particlesRef.current = makeInitialParticles();
    lossHistoryRef.current = [];
    const avg =
      particlesRef.current.reduce((acc, p) => acc + LOSS(p.x, p.y), 0) / particlesRef.current.length;
    setStepCount(0);
    setMeanLoss(avg);
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      advanceStep();
      if (stepRef.current >= 90) setRunning(false);
    }, 95);
    return () => window.clearInterval(id);
  }, [running, advanceStep]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const wx = nx * 8 - 4;
    const wy = 2.2 - ny * 4.4;
    particlesRef.current.push({ x: wx, y: wy, vx: 0, vy: 0, mx: 0, my: 0, path: [[wx, wy]] });
    if (particlesRef.current.length > 30) particlesRef.current.shift();
    draw();
  };

  return (
    <div className="figure-card" style={{ margin: 0 }}>
      <div className="figure-head">
        <span className="left">FIG_LAB.01 · L(w₁, w₂) = 0.35w₁² + 2.40w₂²</span>
        <span className="right">
          STEP {stepCount} · MEAN LOSS {meanLoss.toFixed(4)}
        </span>
      </div>
      <div className="figure-body" style={{ padding: compact ? '14px' : '20px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="bp-btn bp-btn--sm bp-btn--primary"
            >
              {running ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
              <span>{running ? 'Pause' : 'Run'}</span>
            </button>
            <button type="button" onClick={advanceStep} className="bp-btn bp-btn--sm">
              <StepForward size={13} aria-hidden="true" />
              <span>Step</span>
            </button>
            <button type="button" onClick={reset} className="bp-btn bp-btn--sm">
              <RotateCcw size={13} aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['sgd', 'momentum', 'adam'] as Optimizer[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOptimizer(opt)}
                  className={`bp-btn bp-btn--sm ${optimizer === opt ? 'bp-btn--active' : ''}`}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
              }}
            >
              <span>η = {lr.toFixed(2)}</span>
              <input
                type="range"
                min="0.02"
                max="0.45"
                step="0.01"
                value={lr}
                onChange={(e) => setLr(Number(e.target.value))}
                style={{ accentColor: 'var(--blueprint)' }}
              />
            </label>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={760}
          height={compact ? 250 : 340}
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            border: '1px solid var(--rule-soft)',
            cursor: 'crosshair',
          }}
        />
      </div>
      <div className="figure-foot">
        Click anywhere on the contour plane to inject a custom starting weight. Try setting η ≥ 0.40 on SGD to observe oscillation across the steep axis versus Adam stabilization.
      </div>
    </div>
  );
};
