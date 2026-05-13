import { useTheme } from "@/hooks";
import { cn } from "@/utils";

/**
 * Minimal init loader: a brand wordmark, a slow precision ring, one quiet
 * status line. One GPU-composited transform animation total — no filters,
 * no scanlines, no drop-shadows. Theme-aware via CSS variables.
 */
export const InitLoader = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={cn("init-loader", !isDarkMode && "init-loader--light")}>
            <style>{`
                .init-loader {
                    --il-bg: #050912;
                    --il-fg: #f1f5ff;
                    --il-fg-muted: rgba(214, 223, 250, 0.5);
                    --il-fg-faint: rgba(214, 223, 250, 0.32);
                    --il-track: rgba(120, 160, 220, 0.15);
                    --il-accent: #6aa3ff;
                    --il-halo: rgba(79, 140, 255, 0.06);

                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background:
                        radial-gradient(ellipse 60% 50% at 50% 50%, var(--il-halo) 0%, transparent 70%),
                        var(--il-bg);
                    color: var(--il-fg);
                    overflow: hidden;
                    animation: il-fade-in .4s ease-out both;
                }
                .init-loader--light {
                    --il-bg: #fafbfd;
                    --il-fg: #0c1729;
                    --il-fg-muted: rgba(12, 23, 41, 0.55);
                    --il-fg-faint: rgba(12, 23, 41, 0.32);
                    --il-track: rgba(45, 80, 150, 0.12);
                    --il-accent: #2f6bd9;
                    --il-halo: rgba(47, 107, 217, 0.07);
                }

                .il-stack {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 28px;
                    /* slight upward bias so the composition sits in the optical
                       center, not the geometric center */
                    transform: translateY(-4%);
                }

                /* ── Precision ring ────────────────────────────────────────── */
                .il-ring {
                    position: relative;
                    width: 56px;
                    height: 56px;
                }
                .il-ring svg {
                    width: 100%; height: 100%;
                    display: block;
                    transform-origin: 50% 50%;
                    animation: il-spin 1.6s cubic-bezier(.55, .15, .45, .85) infinite;
                }
                .il-ring .track {
                    fill: none;
                    stroke: var(--il-track);
                    stroke-width: 1.5;
                }
                .il-ring .arc {
                    fill: none;
                    stroke: var(--il-accent);
                    stroke-width: 1.5;
                    stroke-linecap: round;
                    /* circumference ≈ 2π·24 = 150.79; show ~28% as a tight arc */
                    stroke-dasharray: 42 200;
                    stroke-dashoffset: 0;
                }

                /* ── Brand block ──────────────────────────────────────────── */
                .il-brand {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }
                .il-wordmark {
                    margin: 0;
                    font-family: "Bebas Neue", "Oswald", "Anton", "Impact", sans-serif;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: 0.38em;
                    line-height: 1;
                    color: var(--il-fg);
                    /* trailing tracking pushes optical center to the left — compensate */
                    padding-inline-start: 0.38em;
                }
                .il-sub {
                    margin: 0;
                    font-family: "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
                    font-size: 9.5px;
                    letter-spacing: 0.32em;
                    text-transform: uppercase;
                    color: var(--il-fg-faint);
                    padding-inline-start: 0.32em;
                }

                /* ── Status line ──────────────────────────────────────────── */
                .il-status {
                    margin: 0;
                    margin-top: 4px;
                    font-family: "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
                    font-size: 10.5px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: var(--il-fg-muted);
                    animation: il-breathe 2s ease-in-out infinite;
                }

                /* ── Animations (transform + opacity only, GPU-composited) ── */
                @keyframes il-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes il-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes il-breathe {
                    0%, 100% { opacity: .5; }
                    50%      { opacity: 1; }
                }
            `}</style>

            <div className="il-stack">
                <div className="il-ring" role="status" aria-label="Loading">
                    <svg viewBox="0 0 56 56" aria-hidden>
                        <circle className="track" cx="28" cy="28" r="24" />
                        <circle className="arc"   cx="28" cy="28" r="24" />
                    </svg>
                </div>

                <div className="il-brand">
                    <h1 className="il-wordmark">TWINDIX</h1>
                    <p className="il-sub">Performance Indicator</p>
                </div>

                <p className="il-status">Preparing your workspace</p>
            </div>
        </div>
    );
};
