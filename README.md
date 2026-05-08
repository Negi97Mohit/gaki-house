<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>GAKI – House of Video Creation</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: #4FD1C5;
    --text-1: #0f0f0f;
    --text-2: #555;
    --text-3: #aaa;
    --line: #e8e8e8;
    --bg: #fff;
    --bg-2: #f7f7f7;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Inter', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text-1);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; text-decoration: none; }

  .wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 32px;
  }

  /* ── HERO ── */
  .hero { padding: 96px 0 80px; }

  .logo-lockup {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 52px;
  }

  .logo-name {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .hero-title {
    font-size: clamp(34px, 6vw, 50px);
    font-weight: 300;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: var(--text-1);
    margin-bottom: 22px;
  }

  .hero-title strong {
    font-weight: 500;
    color: var(--accent);
  }

  .hero-sub {
    font-size: 15.5px;
    font-weight: 300;
    color: var(--text-2);
    max-width: 500px;
    line-height: 1.7;
    margin-bottom: 36px;
  }

  .badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .badge {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-3);
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 3px 9px;
    letter-spacing: 0.06em;
  }

  /* ── SECTION ── */
  .section { padding: 64px 0; border-top: 1px solid var(--line); }

  .section-tag {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-3);
    margin-bottom: 40px;
  }

  /* ── FEATURES ── */
  .features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px 48px;
  }

  .feature-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-1);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .feature-label::before {
    content: '';
    width: 5px; height: 5px;
    background: var(--accent);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .feature p {
    font-size: 13.5px;
    font-weight: 300;
    color: var(--text-2);
    line-height: 1.6;
  }

  /* ── ARCH ── */
  .arch-row {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 32px;
    padding: 22px 0;
    border-bottom: 1px solid var(--line);
    align-items: baseline;
  }

  .arch-row:last-child { border-bottom: none; }

  .arch-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-1);
  }

  .arch-path {
    display: block;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--accent);
    margin-top: 4px;
    letter-spacing: 0.03em;
  }

  .arch-desc {
    font-size: 13.5px;
    font-weight: 300;
    color: var(--text-2);
    line-height: 1.6;
  }

  /* ── CODE ── */
  .code-block {
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 14px;
  }

  .code-bar {
    padding: 9px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .code-dots { display: flex; gap: 5px; }
  .code-dot { width: 9px; height: 9px; border-radius: 50%; }
  .d1 { background: #ff5f57; } .d2 { background: #ffbd2e; } .d3 { background: #28ca41; }

  .code-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-3);
    letter-spacing: 0.06em;
  }

  pre {
    padding: 16px 18px;
    font-family: var(--mono);
    font-size: 12.5px;
    line-height: 2;
    overflow-x: auto;
    color: var(--text-2);
  }

  .ps { color: var(--accent); user-select: none; margin-right: 4px; }
  .pk { color: #999; }

  /* ── STEPS ── */
  .step {
    display: flex;
    gap: 24px;
    padding: 20px 0;
    border-bottom: 1px solid var(--line);
  }
  .step:last-child { border-bottom: none; }

  .step-n {
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--text-3);
    padding-top: 3px;
    min-width: 18px;
  }

  .step-title {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-1);
    margin-bottom: 2px;
  }

  .step-hint {
    font-size: 12.5px;
    font-weight: 300;
    color: var(--text-3);
  }

  /* ── PREREQS ── */
  .prereqs { display: flex; gap: 8px; margin-bottom: 40px; }

  .prereq {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-2);
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 5px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .prereq-v { color: var(--text-3); font-size: 10px; }

  /* ── DOCS ── */
  .doc-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }

  .doc-col-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-3);
    margin-bottom: 16px;
  }

  .doc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid var(--line);
    font-size: 13.5px;
    font-weight: 300;
    color: var(--text-2);
    transition: color 0.1s;
    cursor: default;
  }

  .doc-item:last-child { border-bottom: none; }
  .doc-item:hover { color: var(--text-1); }

  .doc-arrow {
    font-size: 11px;
    color: var(--text-3);
    transform: rotate(-45deg);
    display: inline-block;
  }

  /* ── FOOTER ── */
  .footer {
    padding: 52px 0 80px;
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .footer-name {
    font-family: var(--mono);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .footer-stack {
    display: flex;
    flex-wrap: wrap;
  }

  .footer-stack span {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-3);
    padding: 0 10px;
    border-right: 1px solid var(--line);
  }

  .footer-stack span:first-child { padding-left: 0; }
  .footer-stack span:last-child { border-right: none; }

  @media (max-width: 560px) {
    .features, .doc-cols { grid-template-columns: 1fr; }
    .arch-row { grid-template-columns: 1fr; gap: 6px; }
  }
</style>
</head>
<body>
<div class="wrap">

  <!-- HERO -->
  <div class="hero">
    <div class="logo-lockup">
      <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" stroke="#4FD1C5" stroke-width="6" stroke-linejoin="round"/>
        <path d="M50 30 L70 50 L50 70 L30 50 Z" stroke="#4FD1C5" stroke-width="6" stroke-linejoin="round"/>
        <g stroke="#4FD1C5" stroke-width="6" stroke-linecap="round">
          <line x1="50" y1="30" x2="10" y2="30"/>
          <line x1="70" y1="50" x2="70" y2="10"/>
          <line x1="50" y1="70" x2="90" y2="70"/>
          <line x1="30" y1="50" x2="30" y2="90"/>
        </g>
      </svg>
      <span class="logo-name">GAKI</span>
    </div>

    <h1 class="hero-title">House of<br/><strong>Video Creation</strong></h1>
    <p class="hero-sub">A production-grade browser and desktop live streaming studio — OBS scene collections, AI features, and seamless cross-device broadcast handoff.</p>

    <div class="badges">
      <span class="badge">MIT</span>
      <span class="badge">Electron</span>
      <span class="badge">React · Vite</span>
      <span class="badge">pnpm Monorepo</span>
      <span class="badge">WebGL</span>
    </div>
  </div>

  <!-- FEATURES -->
  <div class="section">
    <p class="section-tag">Features</p>
    <div class="features">
      <div class="feature">
        <p class="feature-label">OBS Scene Integration</p>
        <p>Import standard OBS Studio <code style="font-family:var(--mono);font-size:11.5px;">.json</code> scene collections natively — no conversion required.</p>
      </div>
      <div class="feature">
        <p class="feature-label">Cross-Device Handoff</p>
        <p>Start on mobile or browser, then transfer the live broadcast to desktop without dropping the stream key.</p>
      </div>
      <div class="feature">
        <p class="feature-label">Multi-Layered Canvas</p>
        <p>Zustand-managed state with draggable elements, PiP controls, and custom WebGL stinger transitions.</p>
      </div>
      <div class="feature">
        <p class="feature-label">Seamless Auth</p>
        <p>Integrated Google sign-in across web, desktop, and the handoff infrastructure — one session everywhere.</p>
      </div>
    </div>
  </div>

  <!-- ARCHITECTURE -->
  <div class="section">
    <p class="section-tag">Architecture</p>
    <div class="arch-row">
      <div><span class="arch-name">Web Studio</span><span class="arch-path">apps/web</span></div>
      <p class="arch-desc">Core React/Vite application. Orchestrates the multi-layered video canvas, OBS JSON parsing, and scene transitions.</p>
    </div>
    <div class="arch-row">
      <div><span class="arch-name">Desktop Client</span><span class="arch-path">apps/desktop</span></div>
      <p class="arch-desc">Electron wrapper providing native OS capabilities, local file recording, and a local RTMP server.</p>
    </div>
    <div class="arch-row">
      <div><span class="arch-name">ML Backend</span><span class="arch-path">apps/ml-backend</span></div>
      <p class="arch-desc">Python-based AI microservices powering background removal, auto-framing, and other intelligent features.</p>
    </div>
    <div class="arch-row">
      <div><span class="arch-name">Handoff Infra</span><span class="arch-path">api-handoff · api-signaling · handoff-sdk</span></div>
      <p class="arch-desc">Backbone for zero-downtime broadcast transfers across devices and network boundaries.</p>
    </div>
    <div class="arch-row">
      <div><span class="arch-name">Rendering Engine</span><span class="arch-path">packages/engine</span></div>
      <p class="arch-desc">WebGL rendering loop and audio mixing, isolated as a standalone package for maximum performance.</p>
    </div>
  </div>

  <!-- QUICK START -->
  <div class="section">
    <p class="section-tag">Quick Start</p>
    <div class="prereqs">
      <span class="prereq">Node.js <span class="prereq-v">v18+</span></span>
      <span class="prereq">pnpm <span class="prereq-v">v8+</span></span>
    </div>

    <div class="step">
      <span class="step-n">01</span>
      <div style="flex:1">
        <p class="step-title">Install dependencies</p>
        <p class="step-hint">Installs across all workspaces</p>
        <div class="code-block">
          <div class="code-bar">
            <div class="code-dots"><div class="code-dot d1"></div><div class="code-dot d2"></div><div class="code-dot d3"></div></div>
            <span class="code-label">terminal</span>
          </div>
          <pre><span class="ps">$</span>pnpm install</pre>
        </div>
      </div>
    </div>

    <div class="step">
      <span class="step-n">02</span>
      <div style="flex:1">
        <p class="step-title">Start the dev environment</p>
        <p class="step-hint">Web Studio + Signaling API</p>
        <div class="code-block">
          <div class="code-bar">
            <div class="code-dots"><div class="code-dot d1"></div><div class="code-dot d2"></div><div class="code-dot d3"></div></div>
            <span class="code-label">terminal</span>
          </div>
          <pre><span class="ps">$</span>pnpm turbo run dev <span class="pk">--filter</span>=web <span class="pk">--filter</span>=api-signaling</pre>
        </div>
      </div>
    </div>

    <div class="step">
      <span class="step-n">03</span>
      <div style="flex:1">
        <p class="step-title">Build the desktop client</p>
        <p class="step-hint">Compiles the Electron application</p>
        <div class="code-block">
          <div class="code-bar">
            <div class="code-dots"><div class="code-dot d1"></div><div class="code-dot d2"></div><div class="code-dot d3"></div></div>
            <span class="code-label">terminal</span>
          </div>
          <pre><span class="ps">$</span>pnpm turbo run build <span class="pk">--filter</span>=desktop</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- DOCUMENTATION -->
  <div class="section">
    <p class="section-tag">Documentation</p>
    <div class="doc-cols">
      <div>
        <p class="doc-col-label">System</p>
        <a class="doc-item" href="docs/ARCHITECTURE.md">Architecture &amp; State <span class="doc-arrow">↗</span></a>
        <a class="doc-item" href="docs/HANDOFF_FLOW.md">Cross-Device Handoff <span class="doc-arrow">↗</span></a>
        <a class="doc-item" href="docs/DEPLOYMENT.md">Deployment Guide <span class="doc-arrow">↗</span></a>
      </div>
      <div>
        <p class="doc-col-label">Apps &amp; Packages</p>
        <a class="doc-item" href="apps/web/README.md">Web Studio <span class="doc-arrow">↗</span></a>
        <a class="doc-item" href="apps/desktop/README.md">Desktop Client <span class="doc-arrow">↗</span></a>
        <a class="doc-item" href="packages/handoff-sdk/README.md">Handoff SDK <span class="doc-arrow">↗</span></a>
        <a class="doc-item" href="packages/engine/README.md">Rendering Engine <span class="doc-arrow">↗</span></a>
        <a class="doc-item" href="apps/ml-backend/README.md">ML Backend <span class="doc-arrow">↗</span></a>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" stroke="#4FD1C5" stroke-width="7" stroke-linejoin="round"/>
        <path d="M50 30 L70 50 L50 70 L30 50 Z" stroke="#4FD1C5" stroke-width="7" stroke-linejoin="round"/>
        <g stroke="#4FD1C5" stroke-width="7" stroke-linecap="round">
          <line x1="50" y1="30" x2="10" y2="30"/>
          <line x1="70" y1="50" x2="70" y2="10"/>
          <line x1="50" y1="70" x2="90" y2="70"/>
          <line x1="30" y1="50" x2="30" y2="90"/>
        </g>
      </svg>
      <span class="footer-name">GAKI</span>
    </div>
    <div class="footer-stack">
      <span>React</span><span>Zustand</span><span>Vite</span><span>Electron</span><span>WebGL</span><span>Turborepo</span>
    </div>
  </div>

</div>
</body>
</html>