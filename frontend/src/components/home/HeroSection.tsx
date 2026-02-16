import { Search, ChevronDown, Zap, Shield, Star } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef, useState, useCallback } from "react";

interface SportBikeSVGProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ExhaustSmokeProps {
  active: boolean;
}

interface SpeedLinesProps {
  intensity: number;
}

interface RoadSurfaceProps {
  scrollProgress: number;
}

interface SmokePuff {
  id: number;
  size: number;
  delay: number;
  duration: number;
  offsetY: number;
}

interface SpeedLine {
  id: number;
  top: number;
  width: number;
  delay: number;
  opacity: number;
  thickness: number;
}

interface FeatureBadge {
  icon: React.ElementType;
  text: string;
}

interface Stat {
  value: string;
  label: string;
}

/* ═════════════════════════════════════════════════════
   HYPER-DETAILED SPORT BIKE SVG — Ducati Panigale style
   ═════════════════════════════════════════════════════ */
function SportBikeSVG({ className = "", style = {} }: SportBikeSVGProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 1200 520"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="bodyRed" x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#ff1744" />
          <stop offset="35%" stopColor="#d50000" />
          <stop offset="70%" stopColor="#b71c1c" />
          <stop offset="100%" stopColor="#880e0e" />
        </linearGradient>
        <linearGradient id="bodyRedDark" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#c62828" />
          <stop offset="100%" stopColor="#7f0000" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="30%" stopColor="#bdbdbd" />
          <stop offset="60%" stopColor="#9e9e9e" />
          <stop offset="100%" stopColor="#757575" />
        </linearGradient>
        <linearGradient id="darkMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#424242" />
          <stop offset="50%" stopColor="#212121" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="engineBlock" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#333" />
          <stop offset="40%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </linearGradient>
        <linearGradient id="tireGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        <linearGradient id="rimGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd54f" />
          <stop offset="50%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
        <linearGradient id="exhaustGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#616161" />
          <stop offset="40%" stopColor="#9e9e9e" />
          <stop offset="80%" stopColor="#bdbdbd" />
          <stop offset="100%" stopColor="#757575" />
        </linearGradient>
        <linearGradient id="windscreen" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
        <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff9c4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="seatGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        <linearGradient id="forkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd54f" />
          <stop offset="100%" stopColor="#f9a825" />
        </linearGradient>
        <linearGradient id="brakeDisc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#888" />
          <stop offset="100%" stopColor="#555" />
        </linearGradient>

        {/* Filters */}
        <filter id="mainShadow" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="15" stdDeviation="20" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowLight" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ═══ HEADLIGHT BEAM ═══ */}
      <ellipse cx="1050" cy="250" rx="200" ry="80" fill="url(#headlightBeam)" opacity="0.3" filter="url(#glowLight)" />

      <g filter="url(#mainShadow)">

        {/* ═══ REAR WHEEL ═══ */}
        <g className="hero-wheel hero-wheel-rear">
          {/* Tire */}
          <circle cx="240" cy="390" r="105" fill="url(#tireGrad)" />
          <circle cx="240" cy="390" r="105" fill="none" stroke="#333" strokeWidth="3" />
          {/* Tire tread pattern */}
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i * 10 * Math.PI) / 180;
            return (
              <line key={i} x1={240 + 95 * Math.cos(a)} y1={390 + 95 * Math.sin(a)}
                x2={240 + 105 * Math.cos(a)} y2={390 + 105 * Math.sin(a)}
                stroke="#222" strokeWidth="3" />
            );
          })}
          {/* Rim */}
          <circle cx="240" cy="390" r="72" fill="none" stroke="url(#rimGold)" strokeWidth="5" />
          <circle cx="240" cy="390" r="68" fill="none" stroke="#333" strokeWidth="1" />
          {/* 5-spoke Y-pattern */}
          {[0, 72, 144, 216, 288].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const a1 = ((deg - 12) * Math.PI) / 180;
            const a2 = ((deg + 12) * Math.PI) / 180;
            return (
              <g key={deg}>
                <line x1={240 + 18 * Math.cos(a)} y1={390 + 18 * Math.sin(a)}
                  x2={240 + 70 * Math.cos(a1)} y2={390 + 70 * Math.sin(a1)}
                  stroke="url(#rimGold)" strokeWidth="6" strokeLinecap="round" />
                <line x1={240 + 18 * Math.cos(a)} y1={390 + 18 * Math.sin(a)}
                  x2={240 + 70 * Math.cos(a2)} y2={390 + 70 * Math.sin(a2)}
                  stroke="url(#rimGold)" strokeWidth="6" strokeLinecap="round" />
              </g>
            );
          })}
          {/* Hub */}
          <circle cx="240" cy="390" r="22" fill="url(#darkMetal)" />
          <circle cx="240" cy="390" r="18" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
          <circle cx="240" cy="390" r="8" fill="#555" />
          <circle cx="240" cy="390" r="4" fill="#888" />
          {/* Rear brake disc */}
          <circle cx="240" cy="390" r="45" fill="none" stroke="url(#brakeDisc)" strokeWidth="3" strokeDasharray="6,4" />
        </g>

        {/* ═══ FRONT WHEEL ═══ */}
        <g className="hero-wheel hero-wheel-front">
          <circle cx="890" cy="390" r="100" fill="url(#tireGrad)" />
          <circle cx="890" cy="390" r="100" fill="none" stroke="#333" strokeWidth="3" />
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i * 10 * Math.PI) / 180;
            return (
              <line key={i} x1={890 + 90 * Math.cos(a)} y1={390 + 90 * Math.sin(a)}
                x2={890 + 100 * Math.cos(a)} y2={390 + 100 * Math.sin(a)}
                stroke="#222" strokeWidth="3" />
            );
          })}
          <circle cx="890" cy="390" r="68" fill="none" stroke="url(#rimGold)" strokeWidth="5" />
          <circle cx="890" cy="390" r="64" fill="none" stroke="#333" strokeWidth="1" />
          {[0, 72, 144, 216, 288].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const a1 = ((deg - 12) * Math.PI) / 180;
            const a2 = ((deg + 12) * Math.PI) / 180;
            return (
              <g key={deg}>
                <line x1={890 + 16 * Math.cos(a)} y1={390 + 16 * Math.sin(a)}
                  x2={890 + 65 * Math.cos(a1)} y2={390 + 65 * Math.sin(a1)}
                  stroke="url(#rimGold)" strokeWidth="6" strokeLinecap="round" />
                <line x1={890 + 16 * Math.cos(a)} y1={390 + 16 * Math.sin(a)}
                  x2={890 + 65 * Math.cos(a2)} y2={390 + 65 * Math.sin(a2)}
                  stroke="url(#rimGold)" strokeWidth="6" strokeLinecap="round" />
              </g>
            );
          })}
          <circle cx="890" cy="390" r="20" fill="url(#darkMetal)" />
          <circle cx="890" cy="390" r="16" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
          <circle cx="890" cy="390" r="7" fill="#555" />
          <circle cx="890" cy="390" r="3.5" fill="#888" />
          {/* Front brake disc */}
          <circle cx="890" cy="390" r="55" fill="none" stroke="url(#brakeDisc)" strokeWidth="4" strokeDasharray="8,5" />
          {/* Brake caliper */}
          <rect x="855" y="340" width="18" height="28" rx="4" fill="#d50000" />
          <rect x="858" y="344" width="12" height="8" rx="2" fill="#ff5252" opacity="0.5" />
        </g>

        {/* ═══ SWINGARM ═══ */}
        <path d="M240,385 L370,310 Q380,305 390,310 L395,320 L260,395 Z" fill="url(#darkMetal)" />
        <path d="M245,380 L365,312" fill="none" stroke="#444" strokeWidth="1.5" />

        {/* ═══ CHAIN ═══ */}
        <path d="M240,390 Q300,365 360,340 Q390,330 410,335" fill="none" stroke="#555" strokeWidth="4" strokeDasharray="5,3" />
        <circle cx="240" cy="390" r="28" fill="none" stroke="#555" strokeWidth="3" />
        <circle cx="410" cy="335" r="14" fill="none" stroke="#555" strokeWidth="3" />

        {/* ═══ ENGINE ═══ */}
        <g>
          {/* Main engine block — L-twin */}
          <path d="M350,280 L420,255 Q440,250 445,265 L448,340 Q448,355 435,358 L355,365 Q340,365 338,350 Z" fill="url(#engineBlock)" />
          {/* Cylinder head front */}
          <path d="M420,255 L500,230 Q510,228 512,238 L510,280 Q508,290 498,292 L445,300 L445,265 Z" fill="url(#engineBlock)" />
          {/* Cylinder head rear */}
          <path d="M350,280 L338,230 Q336,220 346,218 L395,210 Q405,208 408,218 L420,255 L350,280 Z" fill="url(#engineBlock)" />
          {/* Engine fins — front */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={`ff${i}`} x1={425 + i * 14} y1={258 + i * 5} x2={425 + i * 14} y2={282 + i * 3}
              stroke="#444" strokeWidth="2" />
          ))}
          {/* Engine fins — rear */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`fr${i}`} x1={352 + i * 14} y1={225 + i * 9} x2={352 + i * 14} y2={248 + i * 7}
              stroke="#444" strokeWidth="2" />
          ))}
          {/* Engine cover detail */}
          <ellipse cx="400" cy="320" rx="30" ry="25" fill="none" stroke="#333" strokeWidth="1.5" />
          <ellipse cx="400" cy="320" rx="15" ry="12" fill="#222" stroke="#444" strokeWidth="1" />
          {/* Clutch cover */}
          <circle cx="440" cy="340" r="18" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
          <circle cx="440" cy="340" r="10" fill="#111" stroke="#444" strokeWidth="1" />
          <circle cx="440" cy="340" r="4" fill="#555" />
        </g>

        {/* ═══ EXHAUST SYSTEM ═══ */}
        <path d="M500,285 Q530,310 520,350 Q510,380 480,395 Q440,415 380,420 Q320,425 270,418 Q240,412 220,400"
          fill="none" stroke="url(#exhaustGrad)" strokeWidth="10" strokeLinecap="round" />
        <path d="M500,285 Q530,310 520,350 Q510,380 480,395 Q440,415 380,420 Q320,425 270,418 Q240,412 220,400"
          fill="none" stroke="#888" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        {/* Exhaust tip */}
        <ellipse cx="218" cy="400" rx="12" ry="14" fill="url(#chrome)" />
        <ellipse cx="218" cy="400" rx="8" ry="10" fill="#333" />
        {/* Heat shield */}
        <path d="M480,390 Q430,410 370,415" fill="none" stroke="#666" strokeWidth="2" strokeDasharray="8,4" />

        {/* ═══ FRAME (TRELLIS) ═══ */}
        <g stroke="#d50000" strokeWidth="5" fill="none" strokeLinecap="round">
          <line x1="390" y1="210" x2="450" y2="265" />
          <line x1="450" y1="265" x2="410" y2="320" />
          <line x1="410" y1="220" x2="470" y2="260" />
          <line x1="470" y1="260" x2="430" y2="310" />
          <line x1="420" y1="215" x2="520" y2="225" />
          <line x1="520" y1="225" x2="530" y2="260" />
        </g>

        {/* ═══ FUEL TANK ═══ */}
        <path d="M340,190 Q370,148 430,135 Q500,122 570,132 Q620,140 650,165 L640,205 Q600,220 530,228 Q460,235 400,230 Q360,225 345,215 Z"
          fill="url(#bodyRed)" />
        {/* Tank sculpt lines */}
        <path d="M370,165 Q420,148 490,140 Q550,135 600,148" fill="none" stroke="white" strokeWidth="1" opacity="0.18" />
        <path d="M360,195 Q430,180 520,178 Q590,176 635,188" fill="none" stroke="white" strokeWidth="0.8" opacity="0.1" />
        {/* Tank highlight */}
        <path d="M390,160 Q440,145 500,140 Q540,137 580,145 L570,165 Q530,158 490,155 Q440,155 400,165 Z"
          fill="white" opacity="0.12" />
        {/* Tank knee indent */}
        <path d="M370,200 Q385,195 390,205 Q395,215 380,220 Q365,218 365,210 Z" fill="url(#bodyRedDark)" opacity="0.5" />
        <path d="M615,185 Q625,180 630,188 Q635,196 625,200 Q615,198 612,192 Z" fill="url(#bodyRedDark)" opacity="0.5" />
        {/* Tank cap */}
        <ellipse cx="490" cy="142" rx="12" ry="8" fill="#333" stroke="#555" strokeWidth="1.5" />
        <ellipse cx="490" cy="141" rx="6" ry="4" fill="#444" />

        {/* ═══ SEAT ═══ */}
        <path d="M330,198 Q345,182 380,176 Q430,170 480,175 Q530,180 560,195 L540,210 Q490,218 430,220 Q370,222 340,215 Z"
          fill="url(#seatGrad)" />
        <path d="M355,190 Q400,180 460,180 Q510,182 540,192" fill="none" stroke="#333" strokeWidth="1" />
        {/* Seat stitch line */}
        <path d="M365,195 Q410,186 470,186 Q520,188 540,196" fill="none" stroke="#444" strokeWidth="0.8" strokeDasharray="4,3" />

        {/* ═══ REAR BODY / TAIL ═══ */}
        <path d="M330,200 Q300,192 270,200 Q240,210 220,225 L228,240 Q250,230 280,222 Q310,215 340,215 Z"
          fill="url(#bodyRed)" />
        {/* Tail light */}
        <g filter="url(#glowRed)">
          <path d="M222,228 Q218,222 225,218 Q235,212 240,220 L236,232 Q228,235 222,228 Z" fill="#ff1744" />
          <path d="M225,222 Q230,216 235,222 L233,228 Q228,230 225,226 Z" fill="#ff8a80" opacity="0.7" />
        </g>
        {/* Rear fender */}
        <path d="M240,360 Q230,340 235,320 Q240,305 260,295" fill="none" stroke="#1a1a1a" strokeWidth="6" />

        {/* ═══ FRONT FAIRING ═══ */}
        <path d="M640,160 Q680,140 730,135 Q790,130 840,150 L870,240 Q860,280 835,300 L780,310
          Q740,315 710,305 L660,270 Q645,255 642,235 Z" fill="url(#bodyRed)" />
        {/* Fairing air vent */}
        <path d="M700,230 Q720,225 740,228 Q760,232 770,240 L765,255 Q750,260 730,258 Q710,255 700,245 Z"
          fill="url(#bodyRedDark)" />
        {/* Fairing line details */}
        <path d="M660,180 Q710,160 780,155 Q820,152 850,165" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12" />
        <path d="M655,230 Q700,220 760,225" fill="none" stroke="#7f0000" strokeWidth="1.5" />

        {/* Side panel number area */}
        <path d="M580,225 Q600,215 630,210 Q660,208 680,215 L675,245 Q665,258 640,262 Q615,265 595,258 Z"
          fill="white" opacity="0.08" />

        {/* ═══ WINDSCREEN ═══ */}
        <path d="M730,132 Q760,95 790,80 Q810,72 820,80 L835,120 Q830,135 815,142 Q790,150 755,148 Z"
          fill="url(#windscreen)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* ═══ HEADLIGHT ═══ */}
        <g>
          <path d="M840,155 Q860,140 870,155 L872,200 Q870,215 855,218 L840,215 Q830,210 830,195 Z"
            fill="#111" />
          {/* LED DRL */}
          <path d="M842,165 Q855,155 865,162 L866,195 Q864,205 855,208 L845,206 Q838,200 838,185 Z"
            fill="#222" />
          <g filter="url(#glowLight)">
            <path d="M845,170 Q855,162 862,168 L863,192 Q862,200 855,203 L848,201 Q842,196 842,182 Z"
              fill="#fff9c4" opacity="0.9" />
          </g>
          {/* Inner LED elements */}
          <circle cx="852" cy="180" r="4" fill="white" opacity="0.9" />
          <circle cx="852" cy="192" r="3" fill="white" opacity="0.7" />
        </g>

        {/* ═══ FRONT FORKS (USD - gold Ohlins style) ═══ */}
        <g>
          {/* Left fork */}
          <line x1="830" y1="210" x2="890" y2="380" stroke="url(#forkGrad)" strokeWidth="10" strokeLinecap="round" />
          <line x1="830" y1="210" x2="855" y2="290" stroke="url(#forkGrad)" strokeWidth="12" strokeLinecap="round" />
          <line x1="855" y1="290" x2="890" y2="380" stroke="url(#chrome)" strokeWidth="8" strokeLinecap="round" />
          {/* Right fork */}
          <line x1="820" y1="215" x2="880" y2="385" stroke="url(#forkGrad)" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
          {/* Fork clamp */}
          <rect x="818" y="205" width="20" height="14" rx="3" fill="url(#chrome)" />
          <rect x="818" y="250" width="20" height="12" rx="3" fill="url(#chrome)" />
        </g>

        {/* ═══ HANDLEBAR / CLIP-ONS ═══ */}
        <line x1="770" y1="155" x2="810" y2="135" stroke="#444" strokeWidth="5" strokeLinecap="round" />
        <line x1="770" y1="162" x2="810" y2="142" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        {/* Grip */}
        <line x1="805" y1="130" x2="818" y2="122" stroke="#222" strokeWidth="8" strokeLinecap="round" />
        {/* Brake lever */}
        <line x1="815" y1="125" x2="830" y2="118" stroke="#888" strokeWidth="2" strokeLinecap="round" />
        {/* Mirror */}
        <ellipse cx="770" cy="148" rx="8" ry="5" fill="#111" stroke="#444" strokeWidth="1" transform="rotate(-15 770 148)" />

        {/* ═══ REAR SHOCK ═══ */}
        <line x1="350" y1="250" x2="310" y2="360" stroke="url(#forkGrad)" strokeWidth="6" strokeLinecap="round" />
        <rect x="340" y="240" width="12" height="20" rx="3" fill="url(#chrome)" />
        <rect x="302" y="355" width="10" height="15" rx="3" fill="url(#chrome)" />

        {/* ═══ FOOTPEGS ═══ */}
        <line x1="445" y1="355" x2="465" y2="365" stroke="#666" strokeWidth="5" strokeLinecap="round" />
        <line x1="465" y1="365" x2="478" y2="360" stroke="#555" strokeWidth="4" strokeLinecap="round" />
        {/* Rear set */}
        <line x1="340" y1="350" x2="355" y2="362" stroke="#666" strokeWidth="4" strokeLinecap="round" />

        {/* ═══ NUMBER / BRAND DECAL ═══ */}
        <text x="595" y="248" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif" fill="white" opacity="0.15" letterSpacing="4">FM</text>
      </g>

      {/* ═══ GROUND REFLECTION ═══ */}
      <ellipse cx="560" cy="500" rx="400" ry="18" fill="url(#bodyRed)" opacity="0.06" />
      <ellipse cx="560" cy="502" rx="350" ry="8" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

/* ── Smoke / Exhaust Particles ── */
function ExhaustSmoke({ active }: ExhaustSmokeProps): JSX.Element | null {
  const puffs: SmokePuff[] = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: 6 + (i % 3) * 4,
    delay: i * 0.2,
    duration: 1.5 + (i % 3) * 0.5,
    offsetY: -10 + (i % 5) * 6,
  }));

  if (!active) return null;

  return (
    <div className="hero-exhaust-smoke">
      {puffs.map((p) => (
        <div
          key={p.id}
          className="hero-smoke-puff"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            bottom: `${20 + p.offsetY}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Full-width Speed Lines ── */
function SpeedLines({ intensity }: SpeedLinesProps): JSX.Element {
  const lines: SpeedLine[] = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    top: 5 + (i * 4.1) % 90,
    width: 60 + (i * 23) % 200,
    delay: i * 0.08,
    opacity: 0.04 + (i % 5) * 0.03,
    thickness: 1 + (i % 3),
  }));

  return (
    <div className="hero-speed-lines" style={{ opacity: Math.min(intensity * 2.5, 1) }}>
      {lines.map((l) => (
        <div
          key={l.id}
          className="hero-speed-line"
          style={{
            top: `${l.top}%`,
            width: `${l.width}px`,
            height: `${l.thickness}px`,
            animationDelay: `${l.delay}s`,
            opacity: l.opacity + intensity * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/* ── Road Surface ── */
function RoadSurface({ scrollProgress }: RoadSurfaceProps): JSX.Element {
  return (
    <div className="hero-road" style={{ transform: `perspective(800px) rotateX(65deg) translateZ(${scrollProgress * -30}px)` }}>
      <div className="hero-road-surface" />
      <div className="hero-road-lines" style={{ animationDuration: `${Math.max(0.3, 1 - scrollProgress * 0.8)}s` }} />
    </div>
  );
}

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [bikeEntered, setBikeEntered] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBikeEntered(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (!sectionRef.current) { rafRef.current = null; return; }
      const rect = sectionRef.current.getBoundingClientRect();
      const h = sectionRef.current.offsetHeight;
      const p = Math.min(Math.max(-rect.top / h, 0), 1);
      setScrollProgress(p);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* Derived transforms — bike rides across full width on scroll */
  const bikeTranslateX = bikeEntered
    ? -10 + scrollProgress * 45   /* percent-based: starts left, rides right */
    : -60;
  const bikeRotateY = scrollProgress * -18;
  const bikeLean = scrollProgress * -3;
  const bikeScale = 1 + scrollProgress * 0.06;
  const wheelSpeed = Math.max(0.15, 1.2 - scrollProgress * 1.8); /* faster as you scroll */
  const textY = scrollProgress * -80;
  const textOpacity = Math.max(0, 1 - scrollProgress * 1.8);

  const featureBadges: FeatureBadge[] = [
    { icon: Zap, text: "Instant Search" },
    { icon: Shield, text: "Verified Sellers" },
    { icon: Star, text: "4.9★ Rated" },
  ];

  const stats: Stat[] = [
    { value: "50K+", label: "Parts Listed" },
    { value: "2.5K+", label: "Garages" },
    { value: "100K+", label: "Happy Riders" },
    { value: "4.9★", label: "Rating" },
  ];

  return (
    <section ref={sectionRef} className="hero-3d-section">
      {/* ── BG LAYERS ── */}
      <div className="hero-bg-layer hero-bg-gradient" />
      <div className="hero-bg-layer hero-bg-grid" />
      <div className="hero-bg-layer hero-bg-radial" style={{ opacity: 0.4 + scrollProgress * 0.4 }} />

      <SpeedLines intensity={scrollProgress} />

      {/* ── FULL-WIDTH BIKE STAGE ── */}
      <div className="hero-bike-fullpage" style={{ perspective: "1400px" }}>
        {/* Glow behind bike */}
        <div
          className="hero-bike-glow"
          style={{
            left: `${bikeTranslateX + 15}%`,
            transform: `scale(${1.2 + scrollProgress * 0.4})`,
            opacity: 0.6 + scrollProgress * 0.3,
          }}
        />

        {/* THE BIKE */}
        <div
          className={`hero-bike-full ${bikeEntered ? "hero-bike-entered" : ""}`}
          style={{
            left: `${bikeTranslateX}%`,
            transform: `rotateY(${bikeRotateY}deg) rotateZ(${bikeLean}deg) scale(${bikeScale})`,
            // @ts-ignore - CSS custom properties
            "--wheel-speed": `${wheelSpeed}s`,
          }}
        >
          <SportBikeSVG className="hero-bike-svg-full" />
          <ExhaustSmoke active={bikeEntered} />
        </div>

        {/* Ground shadow */}
        <div
          className="hero-ground-shadow"
          style={{
            left: `${bikeTranslateX + 5}%`,
            transform: `scaleX(${1 + scrollProgress * 0.5})`,
            opacity: 0.3 - scrollProgress * 0.15,
          }}
        />
      </div>

      <RoadSurface scrollProgress={scrollProgress} />

      {/* ── TEXT OVERLAY ── */}
      <div className="hero-text-overlay" style={{ transform: `translateY(${textY}px)`, opacity: textOpacity }}>
        <div className={`hero-text-inner ${bikeEntered ? "hero-text-entered" : ""}`}>
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            #1 Motorcycle Parts Marketplace
          </span>

          <h1 className="hero-title">
            Find the Perfect Parts
            <br />
            for Your <span className="text-gradient hero-title-accent">Ride</span>
          </h1>

          <p className="hero-subtitle">
            Connect with trusted sellers and certified garages. Quality parts,
            expert services, and everything to keep your motorcycle at peak performance.
          </p>

          {/* Search */}
          <div className="hero-search-bar">
            <div className="hero-search-input-wrap">
              <Search className="hero-search-icon" />
              <input
                type="text"
                placeholder="Search parts by name, model, or brand..."
                className="hero-search-input"
              />
            </div>
            <Button variant="hero" size="xl">
              Search Parts
            </Button>
          </div>

          {/* Feature badges */}
          <div className="hero-features">
            {featureBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="hero-feature-badge">
                <Icon size={14} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {stats.map((s, i) => (
              <div key={s.label} className="hero-stat" style={{ animationDelay: `${0.9 + i * 0.1}s` }}>
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-cta" style={{ opacity: Math.max(0, 1 - scrollProgress * 4) }}>
        <span>Scroll to ride</span>
        <ChevronDown className="hero-scroll-arrow" />
      </div>

      <div className="hero-bottom-fade" />
    </section>
  );
};
