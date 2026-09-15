import React, { useEffect, useRef, useCallback, memo } from 'react';
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

const SakuraCanvasComponent: React.FC<SakuraCanvasProps> = ({
  settings,
  theme,
  interactive = true,
  burstTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const settingsRef = useRef(settings);
  const themeRef = useRef(theme);

  // Keep refs up-to-date synchronously on each render
  settingsRef.current = settings;
  themeRef.current = theme;

  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
  });
  const gyroRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const burstRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const createPetal = useCallback(
    (width: number, height: number, startOffscreen = true): Petal => {
      const currentSettings = settingsRef.current;
      const currentTheme = themeRef.current;
      const z = Math.random();
      // Foreground bokeh petals (z > 0.85) are larger and dreamy
      const isForeground = z > 0.85;
      const isBackground = z < 0.35;
      
      const depthScale = isForeground ? 1.4 + (z - 0.85) * 2.0 : isBackground ? 0.5 + z * 0.4 : 0.8 + z * 0.4;
      const sizeMultiplier = (currentSettings.petal_size / 50) * depthScale;
      const baseSize = (10 + Math.random() * 14) * sizeMultiplier;
      
      const speedMultiplier = (currentSettings.speed / 50) * (isForeground ? 1.3 : isBackground ? 0.6 : 0.9);
      const windOffset = (currentSettings.wind - 50) / 25;

      const isAltColor = Math.random() > 0.4;
      const color = isAltColor ? currentTheme.sakuraSecondary : currentTheme.sakuraPrimary;

      return {
        x: Math.random() * (width + 200) - 100,
        y: startOffscreen ? -Math.random() * height * 0.5 - 30 : Math.random() * height,
        z,
        size: baseSize,
        baseSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03 * (currentSettings.animation_intensity / 50),
        flipAngle: Math.random() * Math.PI,
        flipSpeed: (0.015 + Math.random() * 0.03) * speedMultiplier,
        tiltAngle: (Math.random() - 0.5) * 0.4,
        fallSpeed: (0.8 + Math.random() * 1.5 + z * 0.9) * speedMultiplier,
        horizontalDrift: (0.3 + Math.random() * 0.8 + windOffset) * speedMultiplier,
        oscillationAngle: Math.random() * Math.PI * 2,
        oscillationSpeed: (0.01 + Math.random() * 0.02) * (currentSettings.animation_intensity / 50),
        opacity: isForeground ? 0.45 : isBackground ? 0.35 : (0.45 + z * 0.45) * (1 - (currentSettings.blur / 200)),
        color,
        petalType: isForeground ? 2 : Math.random() > 0.85 ? 1 : 0,
      };
    },
    []
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
      const baseCount = isMobile ? 38 : 80;
      const targetCount = Math.floor(baseCount * (settings.density / 50));

      const currentPetals = petalsRef.current;
      if (currentPetals.length === 0) {
        const newPetals: Petal[] = [];
        for (let i = 0; i < targetCount; i++) {
          newPetals.push(createPetal(width, height, false));
        }
        petalsRef.current = newPetals;
      } else if (currentPetals.length < targetCount) {
        // Smoothly add new petals into the falling stream
        for (let i = currentPetals.length; i < targetCount; i++) {
          currentPetals.push(createPetal(width, height, true));
        }
      } else if (currentPetals.length > targetCount) {
        // Smoothly trim excess petals
        currentPetals.length = targetCount;
      }
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

  // Mouse & Touch interaction + Mobile Gyroscope / Device Orientation physics
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

    // Device orientation / Gyroscope physics for mobile tilt
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees [-90, 90]
        gyroRef.current.x = Math.max(-2.5, Math.min(2.5, (e.gamma / 30) * 1.5));
      }
      if (e.beta !== null) {
        // beta is front-to-back tilt [-180, 180]
        gyroRef.current.y = Math.max(-1.0, Math.min(1.5, ((e.beta - 45) / 45) * 0.8));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [interactive]);

  const drawSakuraPetal = useCallback((
    ctx: CanvasRenderingContext2D,
    petal: Petal,
    scaleX: number
  ) => {
    const s = petal.size;
    const currentTheme = themeRef.current;
    
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

    if (currentTheme.id === 'pure-sakura') {
      grad.addColorStop(1, '#d8cbbe');
    } else if (currentTheme.id === 'sunset-sakura') {
      grad.addColorStop(1, '#ea580c');
    } else if (currentTheme.id === 'sakura-day') {
      grad.addColorStop(1, '#f43f5e');
    } else {
      grad.addColorStop(1, '#e11d62');
    }

    ctx.fillStyle = grad;
    ctx.fill();

    if (currentTheme.id === 'pure-sakura') {
      ctx.strokeStyle = 'rgba(180, 130, 80, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(0, s * 0.4);
    ctx.lineTo(0, -s * 0.2);
    ctx.strokeStyle = currentTheme.id === 'pure-sakura' ? 'rgba(180, 130, 80, 0.3)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }, []);

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
      const currentTheme = themeRef.current;

      ctx.clearRect(0, 0, width, height);

      if (burstRef.current > 0) {
        burstRef.current = Math.max(0, burstRef.current - dt * 0.6);
      }

      mouseRef.current.vx *= 0.94;
      mouseRef.current.vy *= 0.94;

      const burstForce = burstRef.current * 8.0;
      const mouseInfluenceX = mouseRef.current.vx * 1.5;
      const gyroX = gyroRef.current.x * 2.2;
      const gyroY = gyroRef.current.y * 1.0;

      const petals = petalsRef.current;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        p.rotation += p.rotationSpeed;
        p.flipAngle += p.flipSpeed + burstForce * 0.05;
        p.oscillationAngle += p.oscillationSpeed;

        const sway = Math.sin(p.oscillationAngle) * (1.2 + p.z * 1.5);
        const parallaxX = (mouseInfluenceX + gyroX) * (0.2 + p.z * 0.9);
        const burstX = burstForce * (1.5 + p.z * 2.0);
        const burstY = burstForce * 1.2;

        p.x += p.horizontalDrift + sway + parallaxX + burstX;
        p.y += p.fallSpeed + burstY + gyroY;

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

        // Multi-depth bokeh effect
        if (p.z > 0.85) {
          // Foreground large bokeh petal
          ctx.shadowColor = currentTheme.petalShadow || 'rgba(255, 183, 197, 0.6)';
          ctx.shadowBlur = 10;
        } else if (p.z > 0.4) {
          // Midground petal
          ctx.shadowColor = currentTheme.petalShadow;
          ctx.shadowBlur = (currentTheme.isDark ? 7 : 3) * p.z;
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
  }, [drawSakuraPetal]);

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

function areSakuraCanvasPropsEqual(
  prevProps: SakuraCanvasProps,
  nextProps: SakuraCanvasProps
): boolean {
  if (prevProps.interactive !== nextProps.interactive) return false;
  if (prevProps.burstTrigger !== nextProps.burstTrigger) return false;
  if (prevProps.theme.id !== nextProps.theme.id) return false;
  if (prevProps.theme.sakuraPrimary !== nextProps.theme.sakuraPrimary) return false;
  if (prevProps.theme.sakuraSecondary !== nextProps.theme.sakuraSecondary) return false;
  if (prevProps.theme.petalShadow !== nextProps.theme.petalShadow) return false;

  const s1 = prevProps.settings;
  const s2 = nextProps.settings;
  if (s1 === s2) return true;
  if (!s1 || !s2) return false;

  return (
    s1.density === s2.density &&
    s1.speed === s2.speed &&
    s1.wind === s2.wind &&
    s1.petal_size === s2.petal_size &&
    s1.blur === s2.blur &&
    s1.animation_intensity === s2.animation_intensity
  );
}

export const SakuraCanvas = memo(SakuraCanvasComponent, areSakuraCanvasPropsEqual);
