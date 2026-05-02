const fs = require('fs');

const b64Path = 'c:\\Users\\Dell\\Desktop\\gaki\\b64.txt';
const mainTsPath = 'c:\\Users\\Dell\\Desktop\\gaki\\apps\\desktop\\electron\\main.ts';

const b64 = fs.readFileSync(b64Path, 'utf8').trim();
let mainTs = fs.readFileSync(mainTsPath, 'utf8');

// 1. Replace the text logo with the base64 image logo
const imgHtml = `<img src="data:image/png;base64,${b64}" class="logo-img" alt="GAKI" />`;

// Replace both occurrences of <div class="logo">GAKI</div>
mainTs = mainTs.replace(/<div class="logo">GAKI<\/div>/g, imgHtml);

// Replace the CSS
mainTs = mainTs.replace(
  `    .logo {\n      font-size: 36px; font-weight: 800; letter-spacing: -1.5px;\n      margin-bottom: 4px;\n    }`,
  `    .logo-img {\n      width: 72px; height: 72px; border-radius: 16px; margin-bottom: 12px;\n      box-shadow: 0 8px 16px rgba(0,0,0,0.5);\n    }`
);

// 2. Implement Single Instance Lock
const lockCode = `const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {`;

mainTs = mainTs.replace(`app.whenReady().then(() => {`, lockCode);

// Close the else block
mainTs = mainTs.replace(`});\n\napp.on("window-all-closed"`, `  });\n}\n\napp.on("window-all-closed"`);

// 3. Explain development mode issue in the HTML text
// Replace "Return to App" with "Open GAKI (Return to App)"
mainTs = mainTs.replace(
  `<button class="btn" onclick="window.location.href=\\'gaki://auth-complete\\'">Return to App</button>`,
  `<button class="btn" onclick="window.location.href=\\'gaki://auth-complete\\'">Return to App</button>`
);

fs.writeFileSync(mainTsPath, mainTs);
console.log("Done patching main.ts");
