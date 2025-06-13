'use client';

import { useState } from 'react';

interface ColorInfoProps {
  color: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

export default function ColorInfo({ color }: ColorInfoProps) {
  const [copiedField, setCopiedField] = useState<string>('');

  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = (hex: string): HSL | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

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
      l: Math.round(l * 100)
    };
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  const ColorField = ({ 
    label, 
    value, 
    fieldKey 
  }: { 
    label: string; 
    value: string; 
    fieldKey: string; 
  }) => (
    <div 
      className="flex items-center justify-between p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
      onClick={() => copyToClipboard(value, fieldKey)}
    >
      <span className="text-white/80">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-white font-mono">{value}</span>
        {copiedField === fieldKey ? (
          <span className="text-green-300 text-xs">✓</span>
        ) : (
          <span className="text-white/60 text-xs">📋</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <ColorField 
        label="HEX" 
        value={color.toUpperCase()} 
        fieldKey="hex"
      />
      
      <ColorField 
        label="RGB" 
        value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''} 
        fieldKey="rgb"
      />
      
      <ColorField 
        label="HSL" 
        value={hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ''} 
        fieldKey="hsl"
      />

      <ColorField 
        label="RGB Values" 
        value={rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : ''} 
        fieldKey="rgb-values"
      />

      <ColorField 
        label="CSS Variable" 
        value={`--primary-color: ${color};`} 
        fieldKey="css-var"
      />
      
      <div 
        className="w-full h-20 rounded-lg border-2 border-white/20 relative overflow-hidden group cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => copyToClipboard(color, 'preview')}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="text-white/0 group-hover:text-white/80 transition-colors text-sm font-medium">
            {copiedField === 'preview' ? 'Copied!' : 'Click to copy'}
          </span>
        </div>
      </div>

      <div className="text-xs text-white/60 text-center font-light"
           style={{ fontFamily: 'var(--font-noto-serif-jp)', fontWeight: 300 }}>
        💡 色の値をクリックするとクリップボードにコピーされます
      </div>
    </div>
  );
}