import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, Sliders, Check } from 'lucide-react';

export type BackgroundTheme =
  | 'forensic-matrix'
  | 'cyber-enclave'
  | 'uv-forensics'
  | 'tactical-hud';

interface CreativeBackgroundProps {
  currentTheme?: BackgroundTheme;
  onChangeTheme?: (theme: BackgroundTheme) => void;
}

export const CreativeBackground: React.FC<CreativeBackgroundProps> = ({
  currentTheme = 'forensic-matrix',
  onChangeTheme,
}) => {
  const [theme, setTheme] = useState<BackgroundTheme>(() => {
    return (localStorage.getItem('deg_bg_theme') as BackgroundTheme) || currentTheme;
  });
  const [laserScanActive, setLaserScanActive] = useState<boolean>(() => {
    return localStorage.getItem('deg_laser_scan') !== 'false';
  });
  const [glowIntensity, setGlowIntensity] = useState<'high' | 'medium' | 'subtle'>('high');
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('deg_bg_theme', theme);
    if (onChangeTheme) {
      onChangeTheme(theme);
    }
  }, [theme, onChangeTheme]);

  useEffect(() => {
    localStorage.setItem('deg_laser_scan', String(laserScanActive));
  }, [laserScanActive]);

  const themesList: { id: BackgroundTheme; name: string; tag: string; color: string }[] = [
    {
      id: 'forensic-matrix',
      name: 'Forensic Crime Scene Grid',
      tag: 'Tactical Reticles & Coordinates',
      color: '#06b6d4',
    },
    {
      id: 'cyber-enclave',
      name: 'Cryptographic Hardware Enclave',
      tag: 'SHA-256 Vault Lattice',
      color: '#3b82f6',
    },
    {
      id: 'uv-forensics',
      name: 'UV Luminescence & Bio-Scan',
      tag: 'Fluorescent Crime Lab',
      color: '#a855f7',
    },
    {
      id: 'tactical-hud',
      name: 'Command Center HUD Matrix',
      tag: 'Radar Telemetry & Nodes',
      color: '#10b981',
    },
  ];

  return (
    <>
      {/* BACKGROUND GRAPHICAL LAYER (Fixed, behind content) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Deep base atmosphere */}
        <div className="absolute inset-0 bg-[#030712]" />

        {/* Dynamic Aurora Glow Orbs based on theme */}
        {theme === 'forensic-matrix' && (
          <>
            <div
              className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-cyan-600/15 blur-[120px] animate-aurora-1 ${
                glowIntensity === 'high' ? 'opacity-80' : 'opacity-40'
              }`}
            />
            <div
              className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[130px] animate-aurora-2 ${
                glowIntensity === 'high' ? 'opacity-70' : 'opacity-35'
              }`}
            />
            <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[110px]" />
          </>
        )}

        {theme === 'cyber-enclave' && (
          <>
            <div className="absolute -top-40 right-1/4 w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[140px] animate-aurora-1" />
            <div className="absolute bottom-10 -left-20 w-[550px] h-[550px] rounded-full bg-indigo-600/18 blur-[120px] animate-aurora-2" />
            <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px]" />
          </>
        )}

        {theme === 'uv-forensics' && (
          <>
            <div className="absolute -top-32 left-10 w-[600px] h-[600px] rounded-full bg-purple-600/22 blur-[130px] animate-aurora-1" />
            <div className="absolute bottom-20 right-10 w-[650px] h-[650px] rounded-full bg-fuchsia-600/18 blur-[140px] animate-aurora-2" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-400/12 blur-[110px]" />
          </>
        )}

        {theme === 'tactical-hud' && (
          <>
            <div className="absolute -top-20 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-600/18 blur-[130px] animate-aurora-1" />
            <div className="absolute -bottom-20 -right-20 w-[650px] h-[650px] rounded-full bg-cyan-600/16 blur-[140px] animate-aurora-2" />
            <div className="absolute top-1/2 left-10 w-[450px] h-[450px] rounded-full bg-teal-500/12 blur-[100px]" />
          </>
        )}

        {/* Structured Grid Texture with Radial Mask (fades towards edges & center) */}
        <div
          className="absolute inset-0 bg-forensic-grid opacity-75"
          style={{
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 95%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 95%)',
          }}
        />

        {/* Forensic Dot Matrix Accents */}
        <div
          className="absolute inset-0 bg-forensic-dots opacity-45"
          style={{
            maskImage: 'radial-gradient(circle at 50% 30%, black 25%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 25%, transparent 80%)',
          }}
        />

        {/* Tactical Corner Reticles & Watermark HUD Markings */}
        <div className="absolute inset-4 sm:inset-8 border border-cyan-500/10 pointer-events-none">
          {/* Top-Left Reticle */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
          <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/40 hidden sm:block tracking-widest">
            + CRIME SCENE MATRIX // SEC-01
          </div>

          {/* Top-Right Reticle */}
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
          <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-400/40 hidden sm:block tracking-widest text-right">
            LAT 37.7749° N · LON 122.4194° W [VERIFIED]
          </div>

          {/* Bottom-Left Reticle */}
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
          <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/40 hidden sm:block tracking-widest">
            DIGITAL EVIDENCE GUARDIAN // SHA-256 IMMUTABLE LEDGER
          </div>

          {/* Bottom-Right Reticle */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />
          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400/40 hidden sm:block tracking-widest text-right">
            SYS: v2.5.0-ENTERPRISE // BIOMETRICS ACTIVE +
          </div>
        </div>

        {/* Dynamic Forensic Laser Beam Scanline */}
        {laserScanActive && (
          <div className="absolute left-0 right-0 h-28 pointer-events-none animate-laser-scan">
            <div
              className={`w-full h-0.5 shadow-lg ${
                theme === 'uv-forensics'
                  ? 'bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-fuchsia-500/50'
                  : theme === 'tactical-hud'
                  ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-cyan-500/50'
              }`}
            />
            <div
              className={`w-full h-12 bg-gradient-to-b ${
                theme === 'uv-forensics'
                  ? 'from-fuchsia-500/10 to-transparent'
                  : theme === 'tactical-hud'
                  ? 'from-emerald-500/10 to-transparent'
                  : 'from-cyan-500/10 to-transparent'
              }`}
            />
          </div>
        )}

        {/* Ambient Cryptographic Floating Hash Ribbon */}
        <div className="absolute bottom-24 left-10 opacity-15 hidden xl:block font-mono text-[10px] text-cyan-300 space-y-1">
          <div>H[0] = 6a09e667f3bcc908...</div>
          <div>H[1] = bb67ae8584caa73b... [CHAIN VALID]</div>
          <div>H[2] = 3c6ef372fe94f82b... [ENCRYPTED ROOT]</div>
        </div>

        <div className="absolute top-28 right-12 opacity-15 hidden xl:block font-mono text-[10px] text-cyan-300 space-y-1 text-right">
          <div>[WEBAUTHN HW-ENCLAVE] READY</div>
          <div>[RECHARTS BOTTLENECK MONITOR] SYNCED</div>
          <div>[GEMINI AI TIMELINE] ARTIFACT SYNTHESIS</div>
        </div>
      </div>

      {/* FLOATING CREATIVE BACKGROUND CONTROLLER HUD (Bottom-Right) */}
      <div className="fixed bottom-4 right-4 z-40 select-none">
        <div className="relative">
          <button
            onClick={() => setShowConfigMenu(!showConfigMenu)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md transition-all cursor-pointer hover:border-cyan-400 group"
            title="Customize Forensic Background Matrix"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Theme: {themesList.find(t => t.id === theme)?.name.split(' ')[0]}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              v2.5
            </span>
          </button>

          {/* Config Menu Dropdown */}
          {showConfigMenu && (
            <div className="absolute bottom-11 right-0 w-72 p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl space-y-3 font-sans animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Background Matrix
                  </span>
                </div>
                <button
                  onClick={() => setShowConfigMenu(false)}
                  className="text-slate-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Theme choices */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Forensic Atmosphere
                </div>
                {themesList.map(t => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-500/60 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <div className="truncate">
                          <div className="font-medium text-xs truncate">{t.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            {t.tag}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>UV Laser Scanner</span>
                  </span>
                  <button
                    onClick={() => setLaserScanActive(!laserScanActive)}
                    className={`py-0.5 px-2 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                      laserScanActive
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                        : 'bg-slate-900 text-slate-500 border-slate-700'
                    }`}
                  >
                    {laserScanActive ? 'ENABLED' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Glow Intensity</span>
                  <div className="flex gap-1 font-mono text-[10px]">
                    {(['subtle', 'medium', 'high'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setGlowIntensity(lvl)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer border ${
                          glowIntensity === lvl
                            ? 'bg-cyan-600 text-white border-cyan-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {lvl[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
