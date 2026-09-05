import React, { useEffect, useRef, useCallback } from 'react';
import { SakuraSettings, ThemeConfig } from '../types/birthday';

interface SakuraCanvasProps {
  settings: SakuraSettings;
  theme: ThemeConfig;
  interactive?: boolean;
  burstTrigger?: number;
}

interface Petal {
  x: number;
  y: number;
  z: number;
  size: number;
  baseSize: number;
  rotation: number;
  rotationSpeed: number;
  flipAngle: number;
  flipSpeed: number;
  tiltAngle: number;
  fallSpeed: number;
  horizontalDrift: number;
  oscillationAngle: number;
  oscillationSpeed: number;
  opacity: number;
  color: string;
  petalType: number;
}

export const SakuraCanvas: React.FC<SakuraCanvasProps> = ({
  settings,
  theme,
  interactive = true,
  burstTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
  });
  const burstRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const createPetal = useCallback(
    (width: number, height: number, startOffscreen = true): Petal => {
      const z = Math.random();
      const sizeMultiplier = (settings.petal_size / 50) * (0.6 + z * 0.8);
      const baseSize = (10 + Math.random() * 14) * sizeMultiplier;
      
      const speedMultiplier = (settings.speed / 50) * (0.6 + z * 0.8);
      const windOffset = (settings.wind - 50) / 25;

      const isAltColor = Math.random() > 0.4;
      const color = isAltColor ? theme.sakuraSecondary : theme.sakuraPrimary;

      return {
        x: Math.random() * (width + 200) - 100,
        y: startOffscreen ? -Math.random() * height * 0.5 - 20 : Math.random() * height,
        z,
        size: baseSize,
        baseSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03 * (settings.animation_intensity / 50),
        flipAngle: Math.random() * Math.PI,
        flipSpeed: (0.015 + Math.random() * 0.03) * speedMultiplier,
        tiltAngle: (Math.random() - 0.5) * 0.4,
        fallSpeed: (0.8 + Math.random() * 1.6 + z * 0.8) * speedMultiplier,
        horizontalDrift: (0.3 + Math.random() * 0.8 + windOffset) * speedMultiplier,
        oscillationAngle: Math.random() * Math.PI * 2,
        oscillationSpeed: (0.01 + Math.random() * 0.02) * (settings.animation_intensity / 50),
        opacity: (0.35 + z * 0.55) * (1 - (settings.blur / 200)),
        color,
        petalType: Math.random() > 0.85 ? 1 : 0,
      };
    },
    [settings, theme]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      const isMobile = width < 768;
      const baseCount = isMobile ? 35 : 75;
      const targetCount = Math.floor(baseCount * (settings.density / 50));

      const newPetals: Petal[] = [];
      for (let i = 0; i < targetCount; i++) {
        newPetals.push(createPetal(width, height, false));
      }
      petalsRef.current = newPetals;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createPetal, settings.density]);

  useEffect(() => {
    if (burstTrigger > 0) {
      burstRef.current = 1.0;
    }
  }, [burstTrigger]);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mx = e.clientX;
      const my = e.clientY;
      mouseRef.current.vx = (mx - mouseRef.current.lastX) * 0.05;
      mouseRef.current.vy = (my - mouseRef.current.lastY) * 0.05;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;
      mouseRef.current.lastX = mx;
      mouseRef.current.lastY = my;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const tx = touch.clientX;
        const ty = touch.clientY;
        mouseRef.current.vx = (tx - mouseRef.current.lastX) * 0.04;
        mouseRef.current.vy = (ty - mouseRef.current.lastY) * 0.04;
        mouseRef.current.x = tx;
        mouseRef.current.y = ty;
        mouseRef.current.lastX = tx;
        mouseRef.current.lastY = ty;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [interactive]);

  const drawSakuraPetal = (
    ctx: CanvasRenderingContext2D,
    petal: Petal,
    scaleX: number
  ) => {
    const s = petal.size;
    
    ctx.beginPath();
    ctx.moveTo(0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.4, s * 0.3, -s * 0.55, -s * 0.1, -s * 0.25, -s * 0.45);
    ctx.quadraticCurveTo(-s * 0.05, -s * 0.35, 0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.05, -s * 0.35, s * 0.25, -s * 0.45);
    ctx.bezierCurveTo(s * 0.55, -s * 0.1, s * 0.4, s * 0.3, 0, s * 0.5);
    ctx.closePath();

    const grad = ctx.createRadialGradient(
      -s * 0.1, -s * 0.1, 0,
      0, 0, s * 0.6
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, petal.color);

    if (theme.id === 'pure-sakura') {
      grad.addColorStop(1, '#d8cbbe');
    } else if (theme.id === 'sunset-sakura') {
      grad.addColorStop(1, '#ea580c');
    } else if (theme.id === 'sakura-day') {
      grad.addColorStop(1, '#f43f5e');
    } else {
      grad.addColorStop(1, '#e11d62');
    }

    ctx.fillStyle = grad;
    ctx.fill();

    if (theme.id === 'pure-sakura') {
      ctx.strokeStyle = 'rgba(180, 130, 80, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(0, s * 0.4);
    ctx.lineTo(0, -s * 0.2);
    ctx.strokeStyle = theme.id === 'pure-sakura' ? 'rgba(180, 130, 80, 0.3)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const width = parseFloat(canvas.style.width || `${canvas.width}`);
      const height = parseFloat(canvas.style.height || `${canvas.height}`);

      ctx.clearRect(0, 0, width, height);

      if (burstRef.current > 0) {
        burstRef.current = Math.max(0, burstRef.current - dt * 0.6);
      }

      mouseRef.current.vx *= 0.94;
      mouseRef.current.vy *= 0.94;

      const burstForce = burstRef.current * 8.0;
      const mouseInfluenceX = mouseRef.current.vx * 1.5;

      const petals = petalsRef.current;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        p.rotation += p.rotationSpeed;
        p.flipAngle += p.flipSpeed + burstForce * 0.05;
        p.oscillationAngle += p.oscillationSpeed;

        const sway = Math.sin(p.oscillationAngle) * (1.2 + p.z * 1.5);
        const parallaxX = mouseInfluenceX * (0.2 + p.z * 0.8);
        const burstX = burstForce * (1.5 + p.z * 2.0);
        const burstY = burstForce * 1.2;

        p.x += p.horizontalDrift + sway + parallaxX + burstX;
        p.y += p.fallSpeed + burstY;

        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * (width + 100) - 50;
        }
        if (p.x > width + 60) {
          p.x = -40;
        } else if (p.x < -60) {
          p.x = width + 40;
        }

        const scaleX = Math.cos(p.flipAngle);
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation + p.tiltAngle);
        ctx.scale(scaleX, 1);
        ctx.globalAlpha = p.opacity * (0.7 + burstRef.current * 0.3);

        if (p.z > 0.4) {
          ctx.shadowColor = theme.petalShadow;
          ctx.shadowBlur = (theme.isDark ? 8 : 4) * p.z;
        }

        drawSakuraPetal(ctx, p, scaleX);

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [theme, drawSakuraPetal]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 w-full h-full"
      style={{
        filter: settings.blur > 10 ? `blur(${settings.blur * 0.015}px)` : 'none',
      }}
    />
  );
};
