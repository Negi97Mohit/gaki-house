// src/features/stream/ui/pip/cinematicShotData.ts

export type CinematicEffect =
  | "none"
  // Existing
  | "dolly-zoom" | "letterbox" | "film-grain" | "teal-orange" | "vignette"
  | "shallow-dof" | "anamorphic-flare" | "bleach-bypass" | "dutch-angle" | "split-diopter"
  | "cinemascope" | "pillarbox" | "windowbox" | "soft-letterbox" | "color-letterbox"
  | "animated-letterbox" | "gradient-letterbox" | "neon-letterbox" | "vintage-letterbox" | "asymmetric-letterbox"
  // Optical & Lens (1-20)
  | "fisheye" | "ultra-wide" | "wide-angle" | "standard-perspective" | "telephoto"
  | "super-telephoto" | "macro-closeup" | "tilt-shift" | "split-diopter-focus" | "anamorphic-cinema"
  | "soft-focus" | "vintage-bloom" | "pinhole" | "probe-lens" | "infrared-capture"
  | "thermal-camera" | "microscope-macro" | "lensbaby-blur" | "spherical-lens" | "zoom-ramp"
  // Framing & Perspective (21-40)
  | "eye-level" | "low-angle-hero" | "high-angle" | "birds-eye" | "worms-eye"
  | "dutch-tilt" | "forced-perspective" | "symmetrical" | "center-weighted" | "rule-of-thirds"
  | "extreme-closeup" | "medium-portrait" | "wide-environmental" | "silhouette" | "frame-in-frame"
  | "negative-space" | "shoulder-pov" | "first-person-pov" | "over-the-shoulder" | "profile-side"
  // Focus & Depth (41-55)
  | "shallow-depth-portrait" | "deep-focus" | "rack-focus" | "foreground-blur" | "background-isolation"
  | "split-focus-plane" | "hyperfocal" | "focus-breathing" | "bokeh-emphasis" | "foreground-obstruction"
  | "focus-pull-reveal" | "tilted-focus" | "manual-focus-drift" | "focus-stacking" | "dreamlike-defocus"
  // Motion & Movement (56-75)
  | "handheld-shake" | "locked-tripod" | "slow-dolly" | "tracking-follow" | "steadicam-glide"
  | "crane-jib" | "orbit-circular" | "whip-pan" | "snap-zoom" | "slow-motion"
  | "hyperlapse" | "timelapse" | "rolling-shutter" | "parallax-slide" | "drone-glide"
  | "shoulder-rig" | "crash-zoom" | "long-take" | "kinetic-chase" | "suspended-hover"
  // Exposure & Temporal (76-85)
  | "long-exposure" | "high-shutter" | "motion-blur-smear" | "light-painting" | "low-light-grain"
  | "hdr-capture" | "flicker-blend" | "overexposed-glow" | "underexposed-noir" | "double-exposure"
  // Stylized / Cinematic Language (86-100)
  | "noir-shadow" | "documentary-verite" | "surveillance" | "security-fisheye" | "found-footage"
  | "vintage-film-emulation" | "action-sports-pov" | "miniature-diorama" | "epic-widescreen" | "slow-reveal"
  | "suspense-hold" | "horror-creep" | "hero-reveal" | "montage-insert" | "experimental-abstract";

export interface CinematicPreset {
  id: CinematicEffect;
  name: string;
  description: string;
  color: string;
  category: string;
}

export const CINEMATIC_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "core", name: "Core Effects" },
  { id: "letterbox", name: "Letterbox" },
  { id: "optical", name: "Optical & Lens" },
  { id: "framing", name: "Framing" },
  { id: "focus", name: "Focus & Depth" },
  { id: "motion", name: "Motion" },
  { id: "exposure", name: "Exposure" },
  { id: "stylized", name: "Stylized" },
];

export const CINEMATIC_PRESETS: CinematicPreset[] = [
  // ── Core Effects ──
  { id: "dolly-zoom", name: "Dolly Zoom", description: "Pulsing radial darkening effect", color: "#ff4444", category: "core" },
  { id: "film-grain", name: "Film Grain", description: "Animated noise texture overlay", color: "#8B7355", category: "core" },
  { id: "teal-orange", name: "Teal & Orange", description: "Teal-orange color tint blend", color: "#FF8C00", category: "core" },
  { id: "vignette", name: "Vignette", description: "Dark edges, bright center", color: "#333333", category: "core" },
  { id: "shallow-dof", name: "Shallow DOF", description: "Blurred edges, sharp center", color: "#6699CC", category: "core" },
  { id: "anamorphic-flare", name: "Anamorphic", description: "Animated horizontal light streak", color: "#00BFFF", category: "core" },
  { id: "bleach-bypass", name: "Bleach Bypass", description: "Desaturated high contrast look", color: "#A0A0A0", category: "core" },
  { id: "dutch-angle", name: "Dutch Angle", description: "Rotated frame with shadow", color: "#CC5500", category: "core" },
  { id: "split-diopter", name: "Split Diopter", description: "Left half blurred, right sharp", color: "#9966CC", category: "core" },

  // ── Letterbox Styles ──
  { id: "letterbox", name: "Letterbox", description: "Black bars top & bottom (12%)", color: "#1a1a1a", category: "letterbox" },
  { id: "cinemascope", name: "Cinemascope", description: "Thick black bars (18%)", color: "#0a0a0a", category: "letterbox" },
  { id: "pillarbox", name: "Pillarbox", description: "Black bars left & right", color: "#111111", category: "letterbox" },
  { id: "windowbox", name: "Windowbox", description: "Black border all four sides", color: "#0d0d0d", category: "letterbox" },
  { id: "soft-letterbox", name: "Soft Edge", description: "Gradient fade bars top/bottom", color: "#2a2a2a", category: "letterbox" },
  { id: "color-letterbox", name: "Color Bars", description: "Purple-blue tinted bars", color: "#1a0a2e", category: "letterbox" },
  { id: "animated-letterbox", name: "Animated Bars", description: "Breathing height black bars", color: "#1a1a2e", category: "letterbox" },
  { id: "gradient-letterbox", name: "Gradient Bars", description: "Red-tinted gradient fade bars", color: "#2e1a1a", category: "letterbox" },
  { id: "neon-letterbox", name: "Neon Bars", description: "Black bars with glowing neon line", color: "#00ff88", category: "letterbox" },
  { id: "vintage-letterbox", name: "Vintage Frame", description: "Warm aged bars with grain", color: "#8B6914", category: "letterbox" },
  { id: "asymmetric-letterbox", name: "Asymmetric", description: "Thin top bar, thick bottom bar", color: "#3a1a1a", category: "letterbox" },

  // ── Optical & Lens (1-20) ──
  { id: "fisheye", name: "Fisheye", description: "Barrel distortion warps the image outward from center", color: "#4488FF", category: "optical" },
  { id: "ultra-wide", name: "Ultra Wide", description: "Extreme wide-angle perspective via GPU shader", color: "#3366CC", category: "optical" },
  { id: "wide-angle", name: "Wide Angle", description: "Slight barrel distortion mimicking a wide lens", color: "#5577DD", category: "optical" },
  { id: "standard-perspective", name: "Standard", description: "Very subtle edge shadow", color: "#888888", category: "optical" },
  { id: "telephoto", name: "Telephoto", description: "Strong center isolation blur", color: "#AA6633", category: "optical" },
  { id: "super-telephoto", name: "Super Telephoto", description: "Extreme center isolation blur", color: "#CC7744", category: "optical" },
  { id: "macro-closeup", name: "Macro Close-up", description: "Heavy edge blur, tight center", color: "#44AA66", category: "optical" },
  { id: "tilt-shift", name: "Tilt-Shift", description: "Blur top & bottom bands", color: "#DDAA33", category: "optical" },
  { id: "split-diopter-focus", name: "Split Diopter", description: "Left half blurred gradient", color: "#9966CC", category: "optical" },
  { id: "anamorphic-cinema", name: "Anamorphic Cinema", description: "Light streak + thin letterbox", color: "#00CCFF", category: "optical" },
  { id: "soft-focus", name: "Soft Focus", description: "Overall soft blur with glow", color: "#FFAACC", category: "optical" },
  { id: "vintage-bloom", name: "Vintage Bloom", description: "Warm halation glow overlay", color: "#FFcc88", category: "optical" },
  { id: "pinhole", name: "Pinhole", description: "Heavy circular vignette", color: "#555555", category: "optical" },
  { id: "probe-lens", name: "Probe Lens", description: "Dark circular tunnel vignette", color: "#66BB44", category: "optical" },
  { id: "infrared-capture", name: "Infrared", description: "Red/pink color tint overlay", color: "#FF3366", category: "optical" },
  { id: "thermal-camera", name: "Thermal Camera", description: "Heat-map color gradient tint", color: "#FF6600", category: "optical" },
  { id: "microscope-macro", name: "Microscope", description: "Circular frame with ring border", color: "#33AAAA", category: "optical" },
  { id: "lensbaby-blur", name: "Lensbaby", description: "Off-center sweet spot blur", color: "#CC88FF", category: "optical" },
  { id: "spherical-lens", name: "Spherical Lens", description: "Minimal edge shadow", color: "#7799DD", category: "optical" },
  { id: "zoom-ramp", name: "Zoom Ramp", description: "Pulsing radial edge darkening", color: "#FF5533", category: "optical" },

  // ── Framing & Perspective (21-40) ──
  { id: "eye-level", name: "Eye Level", description: "Minimal inner shadow frame", color: "#778899", category: "framing" },
  { id: "low-angle-hero", name: "Low Angle Hero", description: "Top edge gradient shadow", color: "#FF6644", category: "framing" },
  { id: "high-angle", name: "High Angle", description: "Bottom edge gradient shadow", color: "#6688AA", category: "framing" },
  { id: "birds-eye", name: "Bird's Eye", description: "Heavy radial vignette + shadow", color: "#44AA88", category: "framing" },
  { id: "worms-eye", name: "Worm's Eye", description: "Bottom dark, top sky tint", color: "#AA8844", category: "framing" },
  { id: "dutch-tilt", name: "Dutch Tilt", description: "Rotated frame with shadow", color: "#CC5500", category: "framing" },
  { id: "forced-perspective", name: "Forced Perspective", description: "Top/bottom edge shadows", color: "#BB66AA", category: "framing" },
  { id: "symmetrical", name: "Symmetrical", description: "Center crosshair guide lines", color: "#66AACC", category: "framing" },
  { id: "center-weighted", name: "Center Weighted", description: "Bright center, dark edges", color: "#8899AA", category: "framing" },
  { id: "rule-of-thirds", name: "Rule of Thirds", description: "Grid lines at 1/3 intervals", color: "#77AA77", category: "framing" },
  { id: "extreme-closeup", name: "Extreme Close-up", description: "Tight center vignette", color: "#DD5555", category: "framing" },
  { id: "medium-portrait", name: "Medium Portrait", description: "Soft oval center vignette", color: "#AA8877", category: "framing" },
  { id: "wide-environmental", name: "Wide Environmental", description: "Subtle wide edge shadow", color: "#5588AA", category: "framing" },
  { id: "silhouette", name: "Silhouette", description: "High contrast, dark & warm tint", color: "#222222", category: "framing" },
  { id: "frame-in-frame", name: "Frame in Frame", description: "Inner border with outer shadow", color: "#886644", category: "framing" },
  { id: "negative-space", name: "Negative Space", description: "Off-center subtle vignette", color: "#AABBCC", category: "framing" },
  { id: "shoulder-pov", name: "Shoulder POV", description: "Blurred shape in bottom-left", color: "#998877", category: "framing" },
  { id: "first-person-pov", name: "First Person POV", description: "Radial vignette + inner shadow", color: "#DD7744", category: "framing" },
  { id: "over-the-shoulder", name: "Over the Shoulder", description: "Blurred shape in bottom-right", color: "#887766", category: "framing" },
  { id: "profile-side", name: "Profile Side", description: "Side edge gradient shadows", color: "#AA9988", category: "framing" },

  // ── Focus & Depth (41-55) ──
  { id: "shallow-depth-portrait", name: "Shallow Portrait", description: "Edge blur, sharp oval center", color: "#DDAA88", category: "focus" },
  { id: "deep-focus", name: "Deep Focus", description: "Slight contrast & saturation boost", color: "#5577AA", category: "focus" },
  { id: "rack-focus", name: "Rack Focus", description: "Animated shifting blur zone", color: "#7799BB", category: "focus" },
  { id: "foreground-blur", name: "Foreground Blur", description: "Top portion blurred", color: "#99BBDD", category: "focus" },
  { id: "background-isolation", name: "Background Isolation", description: "Strong edge blur, sharp center", color: "#BB8855", category: "focus" },
  { id: "split-focus-plane", name: "Split Focus", description: "Top & bottom thirds blurred", color: "#9966BB", category: "focus" },
  { id: "hyperfocal", name: "Hyperfocal", description: "Slight contrast & saturation lift", color: "#558844", category: "focus" },
  { id: "focus-breathing", name: "Focus Breathing", description: "Animated pulsing edge blur", color: "#7788AA", category: "focus" },
  { id: "bokeh-emphasis", name: "Bokeh Emphasis", description: "Heavy bright edge blur", color: "#FFCC66", category: "focus" },
  { id: "foreground-obstruction", name: "Foreground Obstruct", description: "Blurred corner shape overlay", color: "#776655", category: "focus" },
  { id: "focus-pull-reveal", name: "Focus Pull Reveal", description: "Animated blur-to-sharp transition", color: "#6688BB", category: "focus" },
  { id: "tilted-focus", name: "Tilted Focus", description: "Diagonal blur on corners", color: "#BB9966", category: "focus" },
  { id: "manual-focus-drift", name: "Manual Drift", description: "Subtle animated overall blur", color: "#99AABB", category: "focus" },
  { id: "focus-stacking", name: "Focus Stacking", description: "Contrast & saturation sharpening", color: "#44AA66", category: "focus" },
  { id: "dreamlike-defocus", name: "Dreamlike Defocus", description: "Soft blur with lavender glow", color: "#CCAADD", category: "focus" },

  // ── Motion & Movement (56-75) ──
  { id: "handheld-shake", name: "Handheld", description: "Animated shaking overlay", color: "#AA7744", category: "motion" },
  { id: "locked-tripod", name: "Locked Tripod", description: "Minimal static inner shadow", color: "#667788", category: "motion" },
  { id: "slow-dolly", name: "Slow Dolly", description: "Slow animated radial shift", color: "#5577AA", category: "motion" },
  { id: "tracking-follow", name: "Tracking Follow", description: "Animated side-to-side shadow", color: "#77AA55", category: "motion" },
  { id: "steadicam-glide", name: "Steadicam Glide", description: "Gentle floating animation", color: "#5599BB", category: "motion" },
  { id: "crane-jib", name: "Crane / Jib", description: "Animated vertical shadow sweep", color: "#8866AA", category: "motion" },
  { id: "orbit-circular", name: "Orbiting", description: "Rotating radial shadow", color: "#AA6688", category: "motion" },
  { id: "whip-pan", name: "Whip Pan", description: "Fast side shadow flicker", color: "#FF5544", category: "motion" },
  { id: "snap-zoom", name: "Snap Zoom", description: "Punchy radial zoom animation", color: "#FF6633", category: "motion" },
  { id: "slow-motion", name: "Slow Motion", description: "Plays back video at half speed using frame buffer", color: "#4488CC", category: "motion" },
  { id: "hyperlapse", name: "Hyperlapse", description: "Fast-forwards video at 2× speed", color: "#55AACC", category: "motion" },
  { id: "timelapse", name: "Time-lapse", description: "Accelerates video at 4× speed", color: "#66BBAA", category: "motion" },
  { id: "rolling-shutter", name: "Rolling Shutter", description: "Horizontal scan line animation", color: "#CC7755", category: "motion" },
  { id: "parallax-slide", name: "Parallax Slide", description: "Drifting side shadow animation", color: "#6699AA", category: "motion" },
  { id: "drone-glide", name: "Drone Glide", description: "Gentle hovering blue tint", color: "#55BBDD", category: "motion" },
  { id: "shoulder-rig", name: "Shoulder Rig", description: "Bobbing shake animation", color: "#997755", category: "motion" },
  { id: "crash-zoom", name: "Crash Zoom", description: "Intense radial zoom pulse", color: "#FF3322", category: "motion" },
  { id: "long-take", name: "Long Take", description: "Subtle static inner shadow", color: "#778899", category: "motion" },
  { id: "kinetic-chase", name: "Kinetic Chase", description: "Fast shaking + side shadows", color: "#FF5544", category: "motion" },
  { id: "suspended-hover", name: "Suspended Hover", description: "Slow floating with soft glow", color: "#88AADD", category: "motion" },

  // ── Exposure & Temporal (76-85) ──
  { id: "long-exposure", name: "Long Exposure", description: "Soft blur with warm tint", color: "#4466CC", category: "exposure" },
  { id: "high-shutter", name: "High Shutter", description: "Increased contrast & saturation", color: "#77AACC", category: "exposure" },
  { id: "motion-blur-smear", name: "Motion Blur", description: "Side edges blurred inward", color: "#5577BB", category: "exposure" },
  { id: "light-painting", name: "Light Painting", description: "Colored glow spots + dim", color: "#FF44FF", category: "exposure" },
  { id: "low-light-grain", name: "Low Light Grain", description: "Dark, contrasty, heavy grain", color: "#555544", category: "exposure" },
  { id: "hdr-capture", name: "HDR Capture", description: "Boosted contrast & saturation", color: "#DDBB44", category: "exposure" },
  { id: "flicker-blend", name: "Flicker Blend", description: "Rapid brightness flicker", color: "#AABB88", category: "exposure" },
  { id: "overexposed-glow", name: "Overexposed Glow", description: "Bright blown-out glow", color: "#FFEEDD", category: "exposure" },
  { id: "underexposed-noir", name: "Underexposed Noir", description: "Very dark, desaturated, contrasty", color: "#1a1a22", category: "exposure" },
  { id: "double-exposure", name: "Double Exposure", description: "Inverted layer blend overlay", color: "#AA77BB", category: "exposure" },

  // ── Stylized / Cinematic Language (86-100) ──
  { id: "noir-shadow", name: "Noir Shadow", description: "B&W with dramatic diagonal shadow", color: "#1a1a1a", category: "stylized" },
  { id: "documentary-verite", name: "Documentary Vérité", description: "Handheld shake + grain", color: "#888877", category: "stylized" },
  { id: "surveillance", name: "Surveillance", description: "B&W, scanlines, REC indicator", color: "#33AA33", category: "stylized" },
  { id: "security-fisheye", name: "Security Fisheye", description: "B&W fisheye + LIVE badge", color: "#44BB44", category: "stylized" },
  { id: "found-footage", name: "Found Footage", description: "Faded color, heavy grain, glitch", color: "#776655", category: "stylized" },
  { id: "vintage-film-emulation", name: "Vintage Film", description: "Warm tint, low saturation, grain", color: "#BB9966", category: "stylized" },
  { id: "action-sports-pov", name: "Action Sports POV", description: "Wide vignette + barrel tint", color: "#FF7733", category: "stylized" },
  { id: "miniature-diorama", name: "Miniature Diorama", description: "Strong tilt-shift blur bands", color: "#DDAA44", category: "stylized" },
  { id: "epic-widescreen", name: "Epic Widescreen", description: "Letterbox + blue-tinted vignette", color: "#3344AA", category: "stylized" },
  { id: "slow-reveal", name: "Slow Reveal", description: "Animated radial darkening push", color: "#5566AA", category: "stylized" },
  { id: "suspense-hold", name: "Suspense Hold", description: "Dark vignette + slight pulse", color: "#663333", category: "stylized" },
  { id: "horror-creep", name: "Horror Creep", description: "Dark, desaturated, slow zoom", color: "#441111", category: "stylized" },
  { id: "hero-reveal", name: "Hero Reveal", description: "Animated bright center pullback", color: "#FF8844", category: "stylized" },
  { id: "montage-insert", name: "Montage Insert", description: "Soft inner border shadow", color: "#7788AA", category: "stylized" },
  { id: "experimental-abstract", name: "Experimental", description: "Color-shifting animated blend", color: "#CC44FF", category: "stylized" },
];
