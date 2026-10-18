import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Cyber embers / tactical particles adapting to current theme
    const particleCount = Math.min(65, Math.floor(window.innerWidth / 20));
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }> = [];

    const colors =
      currentTheme?.particles && currentTheme.particles.length > 0
        ? currentTheme.particles
        : ['rgba(22, 119, 255, ', 'rgba(0, 217, 255, ', 'rgba(13, 78, 189, '];

    const shadowPrimary = currentTheme?.primary || '#1677FF';

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.8 + 0.25),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.7 + 0.2,
        fadeSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)] || 'rgba(22, 119, 255, ',
      });
    }

    const render = () => {
      try {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.y += p.speedY;
          p.x += p.speedX;
          p.opacity += p.fadeSpeed;

          if (p.opacity > 0.85 || p.opacity < 0.15) {
            p.fadeSpeed = -p.fadeSpeed;
          }

          // Loop when reaching top or edges
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(0.9, p.opacity))})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = shadowPrimary;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        animationFrameId = requestAnimationFrame(render);
      } catch (err) {
        console.error('Particle render loop caught error:', err);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
};
