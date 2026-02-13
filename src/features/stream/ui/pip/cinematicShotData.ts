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
  { id: "dolly-zoom", name: "Dolly Zoom", description: "Hitchcock vertigo zoom", color: "#ff4444", category: "core" },
  { id: "film-grain", name: "Film Grain", description: "35mm film texture", color: "#8B7355", category: "core" },
  { id: "teal-orange", name: "Teal & Orange", description: "Hollywood color grade", color: "#FF8C00", category: "core" },
  { id: "vignette", name: "Vignette", description: "Dark edge focus", color: "#333333", category: "core" },
  { id: "shallow-dof", name: "Shallow DOF", description: "Bokeh blur edges", color: "#6699CC", category: "core" },
  { id: "anamorphic-flare", name: "Anamorphic", description: "Horizontal lens flare", color: "#00BFFF", category: "core" },
  { id: "bleach-bypass", name: "Bleach Bypass", description: "Desaturated high contrast", color: "#A0A0A0", category: "core" },
  { id: "dutch-angle", name: "Dutch Angle", description: "Tilted tension shot", color: "#CC5500", category: "core" },
  { id: "split-diopter", name: "Split Diopter", description: "Split-focus blur", color: "#9966CC", category: "core" },

  // ── Letterbox Styles ──
  { id: "letterbox", name: "Letterbox", description: "2.39:1 widescreen bars", color: "#1a1a1a", category: "letterbox" },
  { id: "cinemascope", name: "Cinemascope", description: "Ultra-wide 2.76:1 bars", color: "#0a0a0a", category: "letterbox" },
  { id: "pillarbox", name: "Pillarbox", description: "Vertical side bars", color: "#111111", category: "letterbox" },
  { id: "windowbox", name: "Windowbox", description: "Bars on all four sides", color: "#0d0d0d", category: "letterbox" },
  { id: "soft-letterbox", name: "Soft Edge", description: "Feathered gradient bars", color: "#2a2a2a", category: "letterbox" },
  { id: "color-letterbox", name: "Color Bars", description: "Tinted cinematic bars", color: "#1a0a2e", category: "letterbox" },
  { id: "animated-letterbox", name: "Animated Bars", description: "Breathing letterbox", color: "#1a1a2e", category: "letterbox" },
  { id: "gradient-letterbox", name: "Gradient Bars", description: "Gradient fade bars", color: "#2e1a1a", category: "letterbox" },
  { id: "neon-letterbox", name: "Neon Bars", description: "Glowing neon edges", color: "#00ff88", category: "letterbox" },
  { id: "vintage-letterbox", name: "Vintage Frame", description: "Aged film gate look", color: "#8B6914", category: "letterbox" },
  { id: "asymmetric-letterbox", name: "Asymmetric", description: "Uneven dramatic crop", color: "#3a1a1a", category: "letterbox" },

  // ── Optical & Lens (1-20) ──
  { id: "fisheye", name: "Fisheye", description: "Barrel distortion effect", color: "#4488FF", category: "optical" },
  { id: "ultra-wide", name: "Ultra Wide", description: "Rectilinear wide capture", color: "#3366CC", category: "optical" },
  { id: "wide-angle", name: "Wide Angle", description: "Exaggerated perspective", color: "#5577DD", category: "optical" },
  { id: "standard-perspective", name: "Standard", description: "Natural normal lens", color: "#888888", category: "optical" },
  { id: "telephoto", name: "Telephoto", description: "Compressed perspective", color: "#AA6633", category: "optical" },
  { id: "super-telephoto", name: "Super Telephoto", description: "Extreme isolation", color: "#CC7744", category: "optical" },
  { id: "macro-closeup", name: "Macro Close-up", description: "Extreme magnification", color: "#44AA66", category: "optical" },
  { id: "tilt-shift", name: "Tilt-Shift", description: "Miniature world effect", color: "#DDAA33", category: "optical" },
  { id: "split-diopter-focus", name: "Split Diopter", description: "Dual focus plane", color: "#9966CC", category: "optical" },
  { id: "anamorphic-cinema", name: "Anamorphic Cinema", description: "Oval bokeh & flares", color: "#00CCFF", category: "optical" },
  { id: "soft-focus", name: "Soft Focus", description: "Dreamy diffusion glow", color: "#FFAACC", category: "optical" },
  { id: "vintage-bloom", name: "Vintage Bloom", description: "Warm halation bloom", color: "#FFcc88", category: "optical" },
  { id: "pinhole", name: "Pinhole", description: "Extreme depth aperture", color: "#555555", category: "optical" },
  { id: "probe-lens", name: "Probe Lens", description: "Bug's-eye perspective", color: "#66BB44", category: "optical" },
  { id: "infrared-capture", name: "Infrared", description: "IR false color capture", color: "#FF3366", category: "optical" },
  { id: "thermal-camera", name: "Thermal Camera", description: "Heat map palette", color: "#FF6600", category: "optical" },
  { id: "microscope-macro", name: "Microscope", description: "Scientific macro view", color: "#33AAAA", category: "optical" },
  { id: "lensbaby-blur", name: "Lensbaby", description: "Selective sweet spot", color: "#CC88FF", category: "optical" },
  { id: "spherical-lens", name: "Spherical Lens", description: "Spherical cinema look", color: "#7799DD", category: "optical" },
  { id: "zoom-ramp", name: "Zoom Ramp", description: "Dynamic zoom ramping", color: "#FF5533", category: "optical" },

  // ── Framing & Perspective (21-40) ──
  { id: "eye-level", name: "Eye Level", description: "Neutral straight-on frame", color: "#778899", category: "framing" },
  { id: "low-angle-hero", name: "Low Angle Hero", description: "Powerful heroic framing", color: "#FF6644", category: "framing" },
  { id: "high-angle", name: "High Angle", description: "Vulnerable top-down look", color: "#6688AA", category: "framing" },
  { id: "birds-eye", name: "Bird's Eye", description: "Directly overhead view", color: "#44AA88", category: "framing" },
  { id: "worms-eye", name: "Worm's Eye", description: "Ground-up perspective", color: "#AA8844", category: "framing" },
  { id: "dutch-tilt", name: "Dutch Tilt", description: "Angled unease framing", color: "#CC5500", category: "framing" },
  { id: "forced-perspective", name: "Forced Perspective", description: "Scale illusion trick", color: "#BB66AA", category: "framing" },
  { id: "symmetrical", name: "Symmetrical", description: "Perfect balanced frame", color: "#66AACC", category: "framing" },
  { id: "center-weighted", name: "Center Weighted", description: "Center-dominant framing", color: "#8899AA", category: "framing" },
  { id: "rule-of-thirds", name: "Rule of Thirds", description: "Classic grid framing", color: "#77AA77", category: "framing" },
  { id: "extreme-closeup", name: "Extreme Close-up", description: "Tight detail framing", color: "#DD5555", category: "framing" },
  { id: "medium-portrait", name: "Medium Portrait", description: "Waist-up framing", color: "#AA8877", category: "framing" },
  { id: "wide-environmental", name: "Wide Environmental", description: "Context establishing", color: "#5588AA", category: "framing" },
  { id: "silhouette", name: "Silhouette", description: "Dark subject outline", color: "#222222", category: "framing" },
  { id: "frame-in-frame", name: "Frame in Frame", description: "Nested framing device", color: "#886644", category: "framing" },
  { id: "negative-space", name: "Negative Space", description: "Minimal empty framing", color: "#AABBCC", category: "framing" },
  { id: "shoulder-pov", name: "Shoulder POV", description: "Over-shoulder viewpoint", color: "#998877", category: "framing" },
  { id: "first-person-pov", name: "First Person POV", description: "Subjective camera view", color: "#DD7744", category: "framing" },
  { id: "over-the-shoulder", name: "Over the Shoulder", description: "Dialogue framing", color: "#887766", category: "framing" },
  { id: "profile-side", name: "Profile Side", description: "Side angle portrait", color: "#AA9988", category: "framing" },

  // ── Focus & Depth (41-55) ──
  { id: "shallow-depth-portrait", name: "Shallow Portrait", description: "Creamy background blur", color: "#DDAA88", category: "focus" },
  { id: "deep-focus", name: "Deep Focus", description: "Everything sharp staging", color: "#5577AA", category: "focus" },
  { id: "rack-focus", name: "Rack Focus", description: "Shifting focus transition", color: "#7799BB", category: "focus" },
  { id: "foreground-blur", name: "Foreground Blur", description: "Soft front elements", color: "#99BBDD", category: "focus" },
  { id: "background-isolation", name: "Background Isolation", description: "Subject separation", color: "#BB8855", category: "focus" },
  { id: "split-focus-plane", name: "Split Focus", description: "Dual sharp planes", color: "#9966BB", category: "focus" },
  { id: "hyperfocal", name: "Hyperfocal", description: "Max depth landscape", color: "#558844", category: "focus" },
  { id: "focus-breathing", name: "Focus Breathing", description: "Lens breathing effect", color: "#7788AA", category: "focus" },
  { id: "bokeh-emphasis", name: "Bokeh Emphasis", description: "Beautiful blur circles", color: "#FFCC66", category: "focus" },
  { id: "foreground-obstruction", name: "Foreground Obstruct", description: "Partial occlusion", color: "#776655", category: "focus" },
  { id: "focus-pull-reveal", name: "Focus Pull Reveal", description: "Dramatic focus shift", color: "#6688BB", category: "focus" },
  { id: "tilted-focus", name: "Tilted Focus", description: "Tilted plane of focus", color: "#BB9966", category: "focus" },
  { id: "manual-focus-drift", name: "Manual Drift", description: "Soft wandering focus", color: "#99AABB", category: "focus" },
  { id: "focus-stacking", name: "Focus Stacking", description: "Composite sharp macro", color: "#44AA66", category: "focus" },
  { id: "dreamlike-defocus", name: "Dreamlike Defocus", description: "Ethereal soft wash", color: "#CCAADD", category: "focus" },

  // ── Motion & Movement (56-75) ──
  { id: "handheld-shake", name: "Handheld", description: "Documentary shake", color: "#AA7744", category: "motion" },
  { id: "locked-tripod", name: "Locked Tripod", description: "Rock-steady static", color: "#667788", category: "motion" },
  { id: "slow-dolly", name: "Slow Dolly", description: "Cinematic push-in", color: "#5577AA", category: "motion" },
  { id: "tracking-follow", name: "Tracking Follow", description: "Subject following", color: "#77AA55", category: "motion" },
  { id: "steadicam-glide", name: "Steadicam Glide", description: "Smooth floating move", color: "#5599BB", category: "motion" },
  { id: "crane-jib", name: "Crane / Jib", description: "Elevation sweep", color: "#8866AA", category: "motion" },
  { id: "orbit-circular", name: "Orbiting", description: "Circular camera path", color: "#AA6688", category: "motion" },
  { id: "whip-pan", name: "Whip Pan", description: "Fast snap transition", color: "#FF5544", category: "motion" },
  { id: "snap-zoom", name: "Snap Zoom", description: "Punch-in emphasis", color: "#FF6633", category: "motion" },
  { id: "slow-motion", name: "Slow Motion", description: "Time stretched capture", color: "#4488CC", category: "motion" },
  { id: "hyperlapse", name: "Hyperlapse", description: "Moving time-lapse", color: "#55AACC", category: "motion" },
  { id: "timelapse", name: "Time-lapse", description: "Accelerated time", color: "#66BBAA", category: "motion" },
  { id: "rolling-shutter", name: "Rolling Shutter", description: "Jello skew effect", color: "#CC7755", category: "motion" },
  { id: "parallax-slide", name: "Parallax Slide", description: "Depth layered motion", color: "#6699AA", category: "motion" },
  { id: "drone-glide", name: "Drone Glide", description: "Aerial float movement", color: "#55BBDD", category: "motion" },
  { id: "shoulder-rig", name: "Shoulder Rig", description: "Realistic body motion", color: "#997755", category: "motion" },
  { id: "crash-zoom", name: "Crash Zoom", description: "Sudden intense zoom", color: "#FF3322", category: "motion" },
  { id: "long-take", name: "Long Take", description: "Unbroken continuous", color: "#778899", category: "motion" },
  { id: "kinetic-chase", name: "Kinetic Chase", description: "High energy pursuit", color: "#FF5544", category: "motion" },
  { id: "suspended-hover", name: "Suspended Hover", description: "Weightless float", color: "#88AADD", category: "motion" },

  // ── Exposure & Temporal (76-85) ──
  { id: "long-exposure", name: "Long Exposure", description: "Motion trail streaks", color: "#4466CC", category: "exposure" },
  { id: "high-shutter", name: "High Shutter", description: "Staccato freeze look", color: "#77AACC", category: "exposure" },
  { id: "motion-blur-smear", name: "Motion Blur", description: "Speed smear effect", color: "#5577BB", category: "exposure" },
  { id: "light-painting", name: "Light Painting", description: "Luminous trail art", color: "#FF44FF", category: "exposure" },
  { id: "low-light-grain", name: "Low Light Grain", description: "High ISO noise", color: "#555544", category: "exposure" },
  { id: "hdr-capture", name: "HDR Capture", description: "Extended dynamic range", color: "#DDBB44", category: "exposure" },
  { id: "flicker-blend", name: "Flicker Blend", description: "Time-blended flicker", color: "#AABB88", category: "exposure" },
  { id: "overexposed-glow", name: "Overexposed Glow", description: "Blown-out dream", color: "#FFEEDD", category: "exposure" },
  { id: "underexposed-noir", name: "Underexposed Noir", description: "Dark moody shadows", color: "#1a1a22", category: "exposure" },
  { id: "double-exposure", name: "Double Exposure", description: "Layered composite", color: "#AA77BB", category: "exposure" },

  // ── Stylized / Cinematic Language (86-100) ──
  { id: "noir-shadow", name: "Noir Shadow", description: "Hard shadow drama", color: "#1a1a1a", category: "stylized" },
  { id: "documentary-verite", name: "Documentary Vérité", description: "Raw authentic realism", color: "#888877", category: "stylized" },
  { id: "surveillance", name: "Surveillance", description: "CCTV monitor look", color: "#33AA33", category: "stylized" },
  { id: "security-fisheye", name: "Security Fisheye", description: "Ceiling cam distortion", color: "#44BB44", category: "stylized" },
  { id: "found-footage", name: "Found Footage", description: "Degraded tape look", color: "#776655", category: "stylized" },
  { id: "vintage-film-emulation", name: "Vintage Film", description: "Classic film stock", color: "#BB9966", category: "stylized" },
  { id: "action-sports-pov", name: "Action Sports POV", description: "GoPro action view", color: "#FF7733", category: "stylized" },
  { id: "miniature-diorama", name: "Miniature Diorama", description: "Toy world illusion", color: "#DDAA44", category: "stylized" },
  { id: "epic-widescreen", name: "Epic Widescreen", description: "Grand cinematic scope", color: "#3344AA", category: "stylized" },
  { id: "slow-reveal", name: "Slow Reveal", description: "Gradual dramatic push", color: "#5566AA", category: "stylized" },
  { id: "suspense-hold", name: "Suspense Hold", description: "Tension static frame", color: "#663333", category: "stylized" },
  { id: "horror-creep", name: "Horror Creep", description: "Unsettling slow zoom", color: "#441111", category: "stylized" },
  { id: "hero-reveal", name: "Hero Reveal", description: "Dramatic pull-back", color: "#FF8844", category: "stylized" },
  { id: "montage-insert", name: "Montage Insert", description: "Detail cut-away", color: "#7788AA", category: "stylized" },
  { id: "experimental-abstract", name: "Experimental", description: "Abstract visual art", color: "#CC44FF", category: "stylized" },
];
