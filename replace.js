const fs = require('fs');
const files = [
  'apps/web/src/features/canvas/ui/DraggableFileViewer.tsx',
  'apps/web/src/features/canvas/ui/DraggableTextOverlay.tsx',
  'apps/web/src/features/canvas/ui/DraggableHtmlOverlay.tsx',
  'apps/web/src/features/canvas/ui/DraggableEmptyGridPanel.tsx',
  'apps/web/src/features/canvas/ui/OverlayLayer.tsx'
];

for(const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/import\s*\{\s*HybridDraggable\s*\}\s*from\s+[^;]+;/, "import { EngineWrapper as HybridDraggable } from '@/features/canvas/engines/EngineWrapper';");
  
  if(content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  } else {
    console.log('No change in import', file);
  }
}
