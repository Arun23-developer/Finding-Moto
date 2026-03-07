import { Search, Zap, Shield, Star } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState, useRef, useCallback } from "react";

interface FeatureBadge {
  icon: React.ElementType;
  text: string;
}

interface Stat {
  value: string;
  label: string;
}

interface FallingPart {
  id: number;
  emoji: string;
  left: number;   // % from left
  size: number;    // px
  delay: number;   // s
  duration: number; // s
  rotate: number;  // deg
  opacity: number;
}

const SPARE_PARTS = [
  '⚙️', '🔩', '🔧', '🛞', '🏍️', '🔗', '🛢️', '⛽', '🪛', '🔨',
  '💨', '🛡️', '⚡', '🔋', '🪝', '🔑', '🏁', '🔔',
];

function generateParts(count: number): FallingPart[] {
  const parts: FallingPart[] = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      id: i,
      emoji: SPARE_PARTS[i % SPARE_PARTS.length],
      left: Math.random() * 100,
      size: 18 + Math.random() * 26,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 10,
      rotate: Math.random() * 360,
      opacity: 0.08 + Math.random() * 0.14,
    });
  }
  return parts;
}

const FALLING_PARTS = generateParts(30);

export const HeroSection: React.FC = () => {
  const [entered, setEntered] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleScroll = useCallback(() => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.bottom > 0) {
        setScrollY(-rect.top);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
    <section className="hero-3d-section" ref={sectionRef}>
      {/* ── BG LAYERS ── */}
      <div className="hero-bg-layer hero-bg-gradient" />
      <div className="hero-bg-layer hero-bg-grid" />
      <div className="hero-bg-layer hero-bg-radial" />

      {/* ── FALLING SPARE PARTS ── */}
      <div className="hero-falling-parts" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
        {FALLING_PARTS.map(part => (
          <span
            key={part.id}
            className="hero-falling-item"
            style={{
              left: `${part.left}%`,
              fontSize: `${part.size}px`,
              animationDelay: `${part.delay}s`,
              animationDuration: `${part.duration}s`,
              opacity: part.opacity,
              '--rotate': `${part.rotate}deg`,
            } as React.CSSProperties}
          >
            {part.emoji}
          </span>
        ))}
      </div>

      {/* ── TEXT OVERLAY ── */}
      <div className="hero-text-overlay">
        <div className={`hero-text-inner ${entered ? "hero-text-entered" : ""}`}>
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
    </section>
  );
};
