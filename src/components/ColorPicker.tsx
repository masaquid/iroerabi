'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const triangleRef = useRef<HTMLCanvasElement>(null);

  const hexToHsv = (hex: string): HSV => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const hsvToHex = (h: number, s: number, v: number): string => {
    const c = (v / 100) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = (v / 100) - c;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const drawColorWheel = () => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 2) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, radius * 0.6, endAngle, startAngle, true);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.6, centerX, centerY, radius);
      gradient.addColorStop(0, `hsl(${angle}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    const hueAngle = (hsv.h * Math.PI) / 180;
    const hueRadius = radius * 0.8;
    const hueX = centerX + Math.cos(hueAngle) * hueRadius;
    const hueY = centerY + Math.sin(hueAngle) * hueRadius;

    ctx.beginPath();
    ctx.arc(hueX, hueY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawSaturationValue = () => {
    const canvas = triangleRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(centerX, centerY) * 0.8;

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= size) {
          const saturation = (distance / size) * 100;
          const value = ((size - Math.abs(dy)) / size) * 100;

          ctx.fillStyle = hsvToHex(hsv.h, saturation, value);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const svX = centerX + (hsv.s / 100) * size * Math.cos(0);
    const svY = centerY - (hsv.v / 100) * size * 0.5;

    ctx.beginPath();
    ctx.arc(svX, svY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleWheelClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;

    const angle = Math.atan2(dy, dx);
    const hue = ((angle * 180) / Math.PI + 360) % 360;

    const newHsv = { ...hsv, h: hue };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  };

  const handleTriangleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = triangleRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(centerX, centerY) * 0.8;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= size) {
      const saturation = Math.min((distance / size) * 100, 100);
      const value = Math.min(((size - Math.abs(dy)) / size) * 100, 100);

      const newHsv = { ...hsv, s: saturation, v: value };
      setHsv(newHsv);
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    }
  };

  useEffect(() => {
    setHsv(hexToHsv(color));
  }, [color]);

  useEffect(() => {
    drawColorWheel();
  }, [hsv.h]);

  useEffect(() => {
    drawSaturationValue();
  }, [hsv]);

  return (
    <div className="space-y-6">
      <div className="relative flex justify-center">
        <canvas
          ref={wheelRef}
          width={280}
          height={280}
          className="cursor-pointer max-w-full h-auto"
          onClick={handleWheelClick}
          style={{ maxWidth: '280px', height: 'auto' }}
        />
        <canvas
          ref={triangleRef}
          width={200}
          height={200}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer max-w-full h-auto"
          onClick={handleTriangleClick}
          style={{ maxWidth: '200px', height: 'auto' }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            色相 (Hue): {hsv.h}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={hsv.h}
            onChange={(e) => {
              const newHsv = { ...hsv, h: parseInt(e.target.value) };
              setHsv(newHsv);
              onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
            }}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            彩度 (Saturation): {hsv.s}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={hsv.s}
            onChange={(e) => {
              const newHsv = { ...hsv, s: parseInt(e.target.value) };
              setHsv(newHsv);
              onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
            }}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                hsl(${hsv.h}, 0%, 50%), hsl(${hsv.h}, 100%, 50%))`
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            明度 (Value): {hsv.v}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={hsv.v}
            onChange={(e) => {
              const newHsv = { ...hsv, v: parseInt(e.target.value) };
              setHsv(newHsv);
              onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
            }}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                hsl(${hsv.h}, ${hsv.s}%, 0%), hsl(${hsv.h}, ${hsv.s}%, 100%))`
            }}
          />
        </div>
      </div>
    </div>
  );
}