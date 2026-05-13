import { useEffect, useState } from "react";

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

const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

const formatElapsed = (ms: number) => {
    const totalSeconds = ms / 1000;
    const s = totalSeconds.toFixed(2);
    return s.padStart(5, "0");
};

export const InitLoader = () => {
    const [statusIdx, setStatusIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = performance.now();
        const statusInterval = window.setInterval(() => {
            setStatusIdx((i) => (i + 1) % STATUSES.length);
        }, 720);
        const tickInterval = window.setInterval(() => {
            setElapsed(performance.now() - start);
        }, 60);
        return () => {
            window.clearInterval(statusInterval);
            window.clearInterval(tickInterval);
        };
    }, []);

    return (
        <div className="init-loader">
            <style>{`
                .init-loader {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 28px;
                    background:
                        radial-gradient(circle at 50% 45%, rgba(79, 140, 255, 0.10) 0%, transparent 55%),
                        radial-gradient(circle at 50% 50%, #0a1426 0%, #050912 70%, #02050b 100%);
                    color: #d6dffa;
                    font-family: "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
                    overflow: hidden;
                    animation: il-fade-in .5s ease-out both;
                }
                .init-loader::before {
                    /* dotted grid */
                    content: "";
                    position: absolute; inset: 0;
                    background-image: radial-gradient(rgba(120,160,220,0.07) 1px, transparent 1px);
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
                        rgba(180, 210, 255, 0.018) 3px,
                        rgba(180, 210, 255, 0.018) 4px
                    );
                    animation: il-scanline 6s linear infinite;
                    pointer-events: none;
                }
                .il-corner {
                    position: absolute;
                    width: 26px; height: 26px;
                    border: 1.5px solid rgba(120, 160, 220, 0.5);
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
                    color: rgba(170, 195, 240, 0.55);
                    display: flex;
                    gap: 14px;
                    align-items: center;
                }
                .il-meta .dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #4f8cff;
                    box-shadow: 0 0 12px #4f8cff;
                    animation: il-pulse 1.2s ease-in-out infinite;
                }
                .il-meta-left { left: 64px; }
                .il-meta-right { right: 64px; }

                .il-radar {
                    position: relative;
                    width: 320px; height: 320px;
                }
                .il-radar svg { display: block; width: 100%; height: 100%; }
                .il-ring { stroke: rgba(120,160,220,0.18); stroke-width: 1; fill: none; }
                .il-ring.heavy { stroke: rgba(120,160,220,0.35); }
                .il-tick { stroke: rgba(120,160,220,0.32); stroke-width: 1; }
                .il-tick.major { stroke: rgba(170,200,255,0.6); stroke-width: 1.5; }
                .il-cross { stroke: rgba(120,160,220,0.15); stroke-width: 1; stroke-dasharray: 2 4; }

                .il-sweep {
                    position: absolute; inset: 6px;
                    border-radius: 50%;
                    background: conic-gradient(
                        from 0deg,
                        rgba(79,140,255,0) 0%,
                        rgba(79,140,255,0.02) 20%,
                        rgba(79,140,255,0.55) 88%,
                        rgba(79,140,255,0.9) 99%,
                        rgba(79,140,255,0) 100%
                    );
                    mask: radial-gradient(circle, transparent 30%, black 31%, black 100%);
                    -webkit-mask: radial-gradient(circle, transparent 30%, black 31%, black 100%);
                    animation: il-sweep 2.4s linear infinite;
                    filter: blur(0.5px);
                }

                .il-blip {
                    fill: #6aa3ff;
                    transform-origin: center;
                    animation: il-blip 2.4s ease-out infinite;
                    filter: drop-shadow(0 0 6px #4f8cff);
                }

                .il-core {
                    fill: #4f8cff;
                    filter: drop-shadow(0 0 10px rgba(79,140,255,0.7));
                    animation: il-core 2s ease-in-out infinite;
                }
                .il-core-ring {
                    stroke: #4f8cff;
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
                    color: rgba(170, 195, 240, 0.6);
                    text-transform: uppercase;
                }
                .il-brand-name {
                    font-family: "Bebas Neue", "Oswald", "Anton", sans-serif;
                    font-size: 44px;
                    letter-spacing: 0.32em;
                    font-weight: 700;
                    color: #f1f5ff;
                    text-shadow: 0 0 24px rgba(79,140,255,0.25);
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
                    color: rgba(200, 220, 255, 0.85);
                    height: 18px;
                }
                .il-status-text {
                    animation: il-status-flicker .72s ease-out;
                }
                .il-status-cursor {
                    display: inline-block;
                    width: 7px; height: 12px;
                    background: #4f8cff;
                    margin-inline-start: 4px;
                    animation: il-blink 0.7s steps(2,end) infinite;
                }
                .il-bar {
                    width: 280px;
                    height: 2px;
                    background: rgba(120,160,220,0.16);
                    overflow: hidden;
                    position: relative;
                }
                .il-bar::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    width: 30%;
                    background: linear-gradient(90deg, transparent, #4f8cff 30%, #9bc1ff 50%, #4f8cff 70%, transparent);
                    animation: il-bar 1.4s cubic-bezier(.5,0,.3,1) infinite;
                }
                .il-counter {
                    font-size: 10px;
                    letter-spacing: 0.3em;
                    color: rgba(150, 175, 215, 0.5);
                    display: flex;
                    gap: 18px;
                }
                .il-counter b { color: #d6dffa; font-weight: 500; }

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
                <span style={{ color: "rgba(170,195,240,0.3)" }}>·</span>
                <span>CH 042</span>
            </div>
            <div className="il-meta il-meta-right" aria-hidden>
                <span>LAT 30.0444°N</span>
                <span style={{ color: "rgba(170,195,240,0.3)" }}>·</span>
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

                    {/* Tick marks every 15° (major every 90°) */}
                    {TICKS.map((deg) => {
                        const rad = (deg - 90) * (Math.PI / 180);
                        const isMajor = deg % 90 === 0;
                        const outer = 146;
                        const inner = isMajor ? 134 : 140;
                        const x1 = 150 + Math.cos(rad) * outer;
                        const y1 = 150 + Math.sin(rad) * outer;
                        const x2 = 150 + Math.cos(rad) * inner;
                        const y2 = 150 + Math.sin(rad) * inner;
                        return (
                            <line
                                key={deg}
                                className={isMajor ? "il-tick major" : "il-tick"}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                            />
                        );
                    })}

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
                    <span>T+<b>{formatElapsed(elapsed)}s</b></span>
                </div>
            </div>
        </div>
    );
};
