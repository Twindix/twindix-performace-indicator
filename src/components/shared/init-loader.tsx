import { useEffect, useState } from "react";

import { useTheme } from "@/hooks";
import { cn } from "@/utils";

const STATUSES = [
    "INITIALIZING UPLINK",
    "AUTHENTICATING SESSION",
    "SCANNING WORKSPACE",
    "RESOLVING ACTIVE PROJECT",
    "LOCATING ACTIVE SPRINT",
    "ALIGNING DASHBOARD",
    "ALMOST READY",
];

// Blip coordinates inside a 300×300 viewBox (centered at 150,150)
const BLIPS: Array<{ x: number; y: number; delay: string; size: number }> = [
    { x: 218, y: 78, delay: "0s", size: 4 },
    { x: 82, y: 198, delay: "0.55s", size: 3 },
    { x: 240, y: 180, delay: "1.1s", size: 3 },
    { x: 96, y: 92, delay: "1.6s", size: 4 },
    { x: 168, y: 232, delay: "2.05s", size: 3 },
    { x: 56, y: 154, delay: "0.85s", size: 2 },
];

// Tick geometry is static — precompute once at module load instead of on every render.
const TICK_LINES = Array.from({ length: 24 }, (_, i) => {
    const deg = i * 15;
    const rad = (deg - 90) * (Math.PI / 180);
    const isMajor = deg % 90 === 0;
    const outer = 146;
    const inner = isMajor ? 134 : 140;
    return {
        deg,
        isMajor,
        x1: 150 + Math.cos(rad) * outer,
        y1: 150 + Math.sin(rad) * outer,
        x2: 150 + Math.cos(rad) * inner,
        y2: 150 + Math.sin(rad) * inner,
    };
});

const formatElapsed = (ms: number) => {
    const totalSeconds = ms / 1000;
    return totalSeconds.toFixed(2).padStart(5, "0");
};

// Isolated counter — its 60ms tick only re-renders this tiny component,
// not the whole loader (which has ~30 SVG nodes + a large <style> block).
const ElapsedCounter = () => {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const start = performance.now();
        const id = window.setInterval(() => setElapsed(performance.now() - start), 60);
        return () => window.clearInterval(id);
    }, []);
    return <b>{formatElapsed(elapsed)}s</b>;
};

export const InitLoader = () => {
    const { isDarkMode } = useTheme();
    const [statusIdx, setStatusIdx] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            setStatusIdx((i) => (i + 1) % STATUSES.length);
        }, 720);
        return () => window.clearInterval(id);
    }, []);

    return (
        <div className={cn("init-loader", !isDarkMode && "init-loader--light")}>
            <style>{`
                .init-loader {
                    /* DARK palette (default) */
                    --il-bg-1: #0a1426;
                    --il-bg-2: #050912;
                    --il-bg-3: #02050b;
                    --il-halo: rgba(79, 140, 255, 0.10);

                    --il-text-strong: #f1f5ff;
                    --il-text-primary: #d6dffa;
                    --il-text-muted: rgba(200, 220, 255, 0.85);
                    --il-text-secondary: rgba(170, 195, 240, 0.6);
                    --il-text-faint: rgba(150, 175, 215, 0.5);

                    --il-grid-dot: rgba(120, 160, 220, 0.07);
                    --il-scanline: rgba(180, 210, 255, 0.018);
                    --il-corner: rgba(120, 160, 220, 0.5);

                    --il-ring: rgba(120, 160, 220, 0.18);
                    --il-ring-heavy: rgba(120, 160, 220, 0.35);
                    --il-tick: rgba(120, 160, 220, 0.32);
                    --il-tick-major: rgba(170, 200, 255, 0.6);
                    --il-cross: rgba(120, 160, 220, 0.15);

                    --il-bar-track: rgba(120, 160, 220, 0.16);

                    --il-accent: #4f8cff;
                    --il-accent-light: #6aa3ff;
                    --il-accent-glow: rgba(79, 140, 255, 0.7);
                    --il-brand-shadow: rgba(79, 140, 255, 0.25);

                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 28px;
                    background:
                        radial-gradient(circle at 50% 45%, var(--il-halo) 0%, transparent 55%),
                        radial-gradient(circle at 50% 50%, var(--il-bg-1) 0%, var(--il-bg-2) 70%, var(--il-bg-3) 100%);
                    color: var(--il-text-primary);
                    font-family: "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
                    overflow: hidden;
                    animation: il-fade-in .5s ease-out both;
                }

                /* LIGHT palette overrides */
                .init-loader--light {
                    --il-bg-1: #f4f6fb;
                    --il-bg-2: #e8eef7;
                    --il-bg-3: #dee5f1;
                    --il-halo: rgba(79, 140, 255, 0.12);

                    --il-text-strong: #0c1729;
                    --il-text-primary: #1a2540;
                    --il-text-muted: rgba(36, 56, 100, 0.85);
                    --il-text-secondary: rgba(40, 70, 130, 0.75);
                    --il-text-faint: rgba(80, 100, 150, 0.55);

                    --il-grid-dot: rgba(45, 80, 150, 0.12);
                    --il-scanline: rgba(30, 50, 100, 0.025);
                    --il-corner: rgba(45, 80, 150, 0.4);

                    --il-ring: rgba(45, 80, 150, 0.18);
                    --il-ring-heavy: rgba(45, 80, 150, 0.42);
                    --il-tick: rgba(45, 80, 150, 0.35);
                    --il-tick-major: rgba(20, 50, 120, 0.7);
                    --il-cross: rgba(45, 80, 150, 0.2);

                    --il-bar-track: rgba(45, 80, 150, 0.16);

                    --il-accent: #2f6bd9;
                    --il-accent-light: #4f8cff;
                    --il-accent-glow: rgba(47, 107, 217, 0.55);
                    --il-brand-shadow: rgba(47, 107, 217, 0.18);
                }

                .init-loader::before {
                    /* dotted grid */
                    content: "";
                    position: absolute; inset: 0;
                    background-image: radial-gradient(var(--il-grid-dot) 1px, transparent 1px);
                    background-size: 22px 22px;
                    mask-image: radial-gradient(ellipse at center, black 50%, transparent 85%);
                    -webkit-mask-image: radial-gradient(ellipse at center, black 50%, transparent 85%);
                    pointer-events: none;
                }
                .init-loader::after {
                    /* fine scan line drift */
                    content: "";
                    position: absolute; inset: 0;
                    background: repeating-linear-gradient(
                        180deg,
                        transparent 0px,
                        transparent 3px,
                        var(--il-scanline) 3px,
                        var(--il-scanline) 4px
                    );
                    animation: il-scanline 6s linear infinite;
                    pointer-events: none;
                }
                .il-corner {
                    position: absolute;
                    width: 26px; height: 26px;
                    border: 1.5px solid var(--il-corner);
                }
                .il-corner.tl { top: 28px; left: 28px;     border-right: 0; border-bottom: 0; }
                .il-corner.tr { top: 28px; right: 28px;    border-left: 0;  border-bottom: 0; }
                .il-corner.bl { bottom: 28px; left: 28px;  border-right: 0; border-top: 0; }
                .il-corner.br { bottom: 28px; right: 28px; border-left: 0;  border-top: 0; }

                .il-meta {
                    position: absolute;
                    top: 28px;
                    font-size: 10px;
                    letter-spacing: 0.22em;
                    color: var(--il-text-secondary);
                    display: flex;
                    gap: 14px;
                    align-items: center;
                }
                .il-meta .dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--il-accent);
                    box-shadow: 0 0 12px var(--il-accent);
                    animation: il-pulse 1.2s ease-in-out infinite;
                }
                .il-meta .sep { color: var(--il-text-faint); }
                .il-meta-left { left: 64px; }
                .il-meta-right { right: 64px; }

                .il-radar {
                    position: relative;
                    width: 320px; height: 320px;
                }
                .il-radar svg { display: block; width: 100%; height: 100%; }
                .il-ring { stroke: var(--il-ring); stroke-width: 1; fill: none; }
                .il-ring.heavy { stroke: var(--il-ring-heavy); }
                .il-tick { stroke: var(--il-tick); stroke-width: 1; }
                .il-tick.major { stroke: var(--il-tick-major); stroke-width: 1.5; }
                .il-cross { stroke: var(--il-cross); stroke-width: 1; stroke-dasharray: 2 4; }

                .il-sweep {
                    position: absolute; inset: 6px;
                    border-radius: 50%;
                    background: conic-gradient(
                        from 0deg,
                        rgba(79,140,255,0) 0%,
                        rgba(79,140,255,0.02) 20%,
                        var(--il-accent-light) 88%,
                        var(--il-accent) 99%,
                        rgba(79,140,255,0) 100%
                    );
                    opacity: .65;
                    mask: radial-gradient(circle, transparent 30%, black 31%, black 100%);
                    -webkit-mask: radial-gradient(circle, transparent 30%, black 31%, black 100%);
                    animation: il-sweep 2.4s linear infinite;
                    filter: blur(0.5px);
                }
                .init-loader--light .il-sweep { opacity: .55; }

                .il-blip {
                    fill: var(--il-accent);
                    transform-origin: center;
                    animation: il-blip 2.4s ease-out infinite;
                    filter: drop-shadow(0 0 6px var(--il-accent));
                }

                .il-core {
                    fill: var(--il-accent);
                    filter: drop-shadow(0 0 10px var(--il-accent-glow));
                    animation: il-core 2s ease-in-out infinite;
                }
                .il-core-ring {
                    stroke: var(--il-accent);
                    stroke-width: 1.2;
                    fill: none;
                    transform-origin: 150px 150px;
                    animation: il-ringspin 8s linear infinite;
                    stroke-dasharray: 4 6;
                }

                .il-brand {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 14px;
                    z-index: 1;
                }
                .il-brand-mark {
                    font-family: "Bebas Neue", "Oswald", "Inter", sans-serif;
                    font-size: 11px;
                    letter-spacing: 0.45em;
                    color: var(--il-text-secondary);
                    text-transform: uppercase;
                }
                .il-brand-name {
                    font-family: "Bebas Neue", "Oswald", "Anton", sans-serif;
                    font-size: 44px;
                    letter-spacing: 0.32em;
                    font-weight: 700;
                    color: var(--il-text-strong);
                    text-shadow: 0 0 24px var(--il-brand-shadow);
                    line-height: 1;
                    padding-inline-start: 0.32em; /* fixes optical centering caused by trailing letter-spacing */
                }
                .il-status-rail {
                    width: 360px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .il-status-line {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    letter-spacing: 0.22em;
                    color: var(--il-text-muted);
                    height: 18px;
                }
                .il-status-text {
                    animation: il-status-flicker .72s ease-out;
                }
                .il-status-cursor {
                    display: inline-block;
                    width: 7px; height: 12px;
                    background: var(--il-accent);
                    margin-inline-start: 4px;
                    animation: il-blink 0.7s steps(2,end) infinite;
                }
                .il-bar {
                    width: 280px;
                    height: 2px;
                    background: var(--il-bar-track);
                    overflow: hidden;
                    position: relative;
                }
                .il-bar::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    width: 30%;
                    background: linear-gradient(90deg, transparent, var(--il-accent) 30%, var(--il-accent-light) 50%, var(--il-accent) 70%, transparent);
                    animation: il-bar 1.4s cubic-bezier(.5,0,.3,1) infinite;
                }
                .il-counter {
                    font-size: 10px;
                    letter-spacing: 0.3em;
                    color: var(--il-text-faint);
                    display: flex;
                    gap: 18px;
                }
                .il-counter b { color: var(--il-text-primary); font-weight: 500; }

                @keyframes il-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes il-sweep { to { transform: rotate(360deg); } }
                @keyframes il-blip {
                    0%, 100% { opacity: 0; transform: scale(0.6); }
                    8%      { opacity: 1; transform: scale(1.4); }
                    18%     { opacity: 0.6; transform: scale(1); }
                    50%     { opacity: 0; transform: scale(0.6); }
                }
                @keyframes il-core {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50%      { transform: scale(1.18); opacity: 0.85; }
                }
                @keyframes il-ringspin { to { transform: rotate(360deg); } }
                @keyframes il-pulse {
                    0%, 100% { opacity: 0.45; transform: scale(0.9); }
                    50%      { opacity: 1; transform: scale(1.1); }
                }
                @keyframes il-blink { 50% { opacity: 0; } }
                @keyframes il-bar {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(380%); }
                }
                @keyframes il-status-flicker {
                    0%   { opacity: 0; transform: translateY(2px); filter: blur(3px); }
                    40%  { opacity: 0.4; }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes il-scanline {
                    from { background-position-y: 0; }
                    to   { background-position-y: 80px; }
                }
            `}</style>

            {/* Viewfinder corner brackets */}
            <span aria-hidden className="il-corner tl" />
            <span aria-hidden className="il-corner tr" />
            <span aria-hidden className="il-corner bl" />
            <span aria-hidden className="il-corner br" />

            {/* Top-edge metadata strips (mission-control telemetry feel) */}
            <div className="il-meta il-meta-left" aria-hidden>
                <span className="dot" />
                <span>NODE · TWDX-01</span>
                <span className="sep">·</span>
                <span>CH 042</span>
            </div>
            <div className="il-meta il-meta-right" aria-hidden>
                <span>LAT 30.0444°N</span>
                <span className="sep">·</span>
                <span>LON 31.2357°E</span>
                <span className="dot" style={{ animationDelay: ".4s" }} />
            </div>

            {/* RADAR */}
            <div className="il-radar" role="img" aria-label="Loading">
                <svg viewBox="0 0 300 300" aria-hidden>
                    {/* Cross-hair */}
                    <line className="il-cross" x1="0" y1="150" x2="300" y2="150" />
                    <line className="il-cross" x1="150" y1="0" x2="150" y2="300" />

                    {/* Rings */}
                    <circle className="il-ring heavy" cx="150" cy="150" r="146" />
                    <circle className="il-ring"        cx="150" cy="150" r="112" />
                    <circle className="il-ring"        cx="150" cy="150" r="78"  />
                    <circle className="il-ring"        cx="150" cy="150" r="44"  />

                    {/* Tick marks every 15° (major every 90°) — geometry precomputed */}
                    {TICK_LINES.map((tick) => (
                        <line
                            key={tick.deg}
                            className={tick.isMajor ? "il-tick major" : "il-tick"}
                            x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
                        />
                    ))}

                    {/* Dashed spinning core ring */}
                    <circle className="il-core-ring" cx="150" cy="150" r="22" />

                    {/* Pinging blips */}
                    {BLIPS.map((b, i) => (
                        <circle
                            key={i}
                            className="il-blip"
                            cx={b.x}
                            cy={b.y}
                            r={b.size}
                            style={{ animationDelay: b.delay }}
                        />
                    ))}

                    {/* Core dot */}
                    <circle className="il-core" cx="150" cy="150" r="5" />
                </svg>

                {/* Rotating conic-gradient sweep arm */}
                <span aria-hidden className="il-sweep" />
            </div>

            {/* Brand wordmark */}
            <div className="il-brand">
                <span className="il-brand-mark">TWINDIX · PERFORMANCE</span>
                <span className="il-brand-name">TWINDIX</span>
            </div>

            {/* Cycling status */}
            <div className="il-status-rail">
                <div className="il-status-line" role="status" aria-live="polite">
                    <span key={statusIdx} className="il-status-text">
                        {STATUSES[statusIdx]}
                    </span>
                    <span className="il-status-cursor" aria-hidden />
                </div>
                <div className="il-bar" aria-hidden />
                <div className="il-counter" aria-hidden>
                    <span>SIG <b>STRONG</b></span>
                    <span>SEC <b>OK</b></span>
                    <span>T+<ElapsedCounter /></span>
                </div>
            </div>
        </div>
    );
};
