'use client';

import { useState } from 'react';
import ColorPicker from '@/components/ColorPicker';
import ColorInfo from '@/components/ColorInfo';

export default function Home() {
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const generateGradient = (color: string) => {
    const rgb = hexToRgb(color);
    if (!rgb) return '';
    
    const { r, g, b } = rgb;
    
    const complementR = Math.max(0, Math.min(255, 255 - r + 50));
    const complementG = Math.max(0, Math.min(255, 255 - g + 50));
    const complementB = Math.max(0, Math.min(255, 255 - b + 50));
    
    const midR = Math.floor((r + complementR) / 2);
    const midG = Math.floor((g + complementG) / 2);
    const midB = Math.floor((b + complementB) / 2);
    
    return `linear-gradient(135deg, 
      ${color} 0%, 
      ${rgbToHex(midR, midG, midB)} 50%, 
      ${rgbToHex(complementR, complementG, complementB)} 100%)`;
  };

  return (
    <div 
      className="min-h-screen p-4 transition-all duration-500 ease-in-out background-pulse"
      style={{ background: generateGradient(selectedColor) }}
    >
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8 lg:mb-12 pt-6 lg:pt-8 fade-in-scale">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-3 lg:mb-4 drop-shadow-2xl tracking-widest floating-title" 
              style={{ fontFamily: 'var(--font-zen-antique)', fontWeight: 400 }}>
            いろえらび
          </h1>
          <div className="w-20 lg:w-28 h-1 bg-white/40 mx-auto mt-4 lg:mt-5 rounded-full shadow-lg fade-in-up delay-300"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className="glassmorphism p-6 lg:p-8 slide-in-left delay-200 glass-shimmer">
            <h2 className="text-xl lg:text-2xl font-light text-white mb-6 lg:mb-8 flex items-center fade-in-up delay-400"
                style={{ fontFamily: 'var(--font-noto-serif-jp)', fontWeight: 300 }}>
              <span className="mr-3 text-2xl">🎨</span>
              カラーピッカー
            </h2>
            <div className="fade-in-up delay-500">
              <ColorPicker 
                color={selectedColor}
                onChange={setSelectedColor}
              />
            </div>
          </div>

          <div className="glassmorphism p-6 lg:p-8 slide-in-right delay-300 glass-shimmer">
            <h2 className="text-xl lg:text-2xl font-light text-white mb-6 lg:mb-8 flex items-center fade-in-up delay-400"
                style={{ fontFamily: 'var(--font-noto-serif-jp)', fontWeight: 300 }}>
              <span className="mr-3 text-2xl">📊</span>
              色情報
            </h2>
            <div className="fade-in-up delay-500">
              <ColorInfo color={selectedColor} />
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 pb-8">
        </footer>
      </div>
    </div>
  );
}
