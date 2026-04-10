$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts"

foreach ($file in $files) {
    if ($file.FullName -like "*node_modules*" -or $file.FullName -like "*dist*") { continue }
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # Ensure Caption imports are correct
    $content = $content -replace '@/components/StyleControls', '@/features/caption/ui/StyleControls'
    $content = $content -replace '@/components/CustomStylesSelector', '@/features/caption/ui/CustomStylesSelector'
    $content = $content -replace '@/components/CaptionEditor', '@/features/caption/ui/CaptionEditor'
    $content = $content -replace '@/components/StyleSync', '@/features/caption/ui/StyleSync'
    $content = $content -replace '@/components/text-toolbar/', '@/features/caption/ui/text-toolbar/'
    
    # Ensure Canvas imports
    $content = $content -replace '@/components/ExcalidrawOverlay', '@/features/canvas/ui/ExcalidrawOverlay'

    # Ensure Studio imports
    $content = $content -replace '@/components/FloatingLogo', '@/features/studio/ui/FloatingLogo'
    $content = $content -replace '@/components/InstructionsDialog', '@/features/studio/ui/InstructionsDialog'
    $content = $content -replace '@/components/RemoteConnectModal', '@/features/studio/ui/RemoteConnectModal'
    $content = $content -replace '@/components/ToolsPopover', '@/features/studio/ui/ToolsPopover'

    # Ensure Loader import
    $content = $content -replace '@/components/Loader', '@/shared/ui/Loader'
     
    # Ensure banner editor
    $content = $content -replace '@/components/banner-editor/', '@/features/banners/ui/editor/components/'

    if ($content -ne $originalContent) {
        Write-Host "Fixed imports in $($file.Name)"
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}
