# Apply Snap Integration Edits
# Run from: c:\Users\Dell\Desktop\caption-cam

$file = "src\components\VideoCanvas.tsx"
$content = Get-Content $file -Raw

# Edit 1: Add useMemo import
$content = $content -replace 'import React, \{ useState, useRef, useEffect, useCallback \} from "react";', 'import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";'

# Edit 2: Add snap imports
$content = $content -replace 'import \{ CanvasGridLayout \} from "@/components/CanvasGridLayout";', 'import { CanvasGridLayout } from "@/components/CanvasGridLayout";
import { SnapGuideLine } from "@/components/SnapGuideLine";
import { GuideLine, OverlayElement } from "@/hooks/useSnapGuides";'

# Edit 3: Add state variable
$content = $content -replace '  const captionRndRef = useRef<Rnd \| null>\(null\); // <-- ADD THIS REF', '  const captionRndRef = useRef<Rnd | null>(null);
  const [activeSnapGuides, setActiveSnapGuides] = useState<GuideLine[]>([]);'

# Edit 4: Add allOverlays collection
$allOverlaysCode = @'
  const handleCanvasClick = () => {
    onDeselectAll();
  };

  // Collect all overlays for snapping
  const allOverlays = useMemo((): OverlayElement[] => {
    const overlays: OverlayElement[] = [];
    textOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout, type: 'text' }));
    browserOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout as any, type: 'browser' }));
    fileOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout as any, type: 'file' }));
    generatedOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout, type: 'overlay' }));
    return overlays;
  }, [textOverlays, browserOverlays, fileOverlays, generatedOverlays]);

  const filteredHtmlOverlays = dynamicLayout.isActive
'@
$content = $content -replace '  const handleCanvasClick = \(\) => \{\r?\n    onDeselectAll\(\);\r?\n  \};\r?\n\r?\n  const filteredHtmlOverlays = dynamicLayout\.isActive', $allOverlaysCode

# Save
$content | Set-Content $file -NoNewline

Write-Host "✓ Applied Edits 1-4 successfully"
Write-Host "⚠ Edits 5-6 (adding props) need to be done manually due to duplicate patterns"
