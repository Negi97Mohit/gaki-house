import { useEffect } from "react";

export interface UseKeyboardShortcutsProps {
    // System & View
    onToggleFullscreen?: () => void;

    // AI Assistant
    onToggleAiAssistant?: () => void;
    onToggleSettings?: () => void;

    // Canvas & History
    onUndo?: () => void;
    onRedo?: () => void;
    onResetScene?: () => void;
    onDelete?: () => void;

    // Layer Control
    onBringToFront?: () => void;
    onSendToBack?: () => void;
    onBringForward?: () => void;
    onSendBackward?: () => void;

    // Media & Stream
    onToggleRecording?: () => void;
    onToggleMic?: () => void;
    onToggleCamera?: () => void;
    onToggleBroadcast?: () => void;
    onToggleSmartSwitch?: () => void;

    // Element Creation
    onAddText?: () => void;
    onOpenAssetLibrary?: () => void;
    onToggleDrawing?: () => void;
}

export const useKeyboardShortcuts = ({
    onToggleFullscreen,
    onToggleAiAssistant,
    onToggleSettings,
    onUndo,
    onRedo,
    onResetScene,
    onDelete,
    onBringToFront,
    onSendToBack,
    onBringForward,
    onSendBackward,
    onToggleRecording,
    onToggleMic,
    onToggleCamera,
    onToggleBroadcast,
    onToggleSmartSwitch,
    onAddText,
    onOpenAssetLibrary,
    onToggleDrawing,
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (
                (e.target as HTMLElement).tagName === "INPUT" ||
                (e.target as HTMLElement).tagName === "TEXTAREA" ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            const isCmdOrCtrl = e.metaKey || e.ctrlKey;
            const isShift = e.shiftKey;

            // --- System & View ---
            if (e.key.toLowerCase() === "f") {
                if (isCmdOrCtrl) {
                    e.preventDefault();
                    onToggleFullscreen?.();
                } else {
                    // Standard 'f' can also toggle if not typing
                    e.preventDefault();
                    onToggleFullscreen?.();
                }
            }

            // --- AI Assistant ---
            if (isCmdOrCtrl && e.key.toLowerCase() === "k") {
                e.preventDefault();
                onToggleAiAssistant?.();
            }
            if (e.key === ",") {
                // "Comma" usually opens settings
                e.preventDefault();
                onToggleSettings?.();
            }

            // --- Canvas & History ---
            if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (isShift) {
                    onRedo?.();
                } else {
                    onUndo?.();
                }
            }
            if (isCmdOrCtrl && e.key.toLowerCase() === "y") {
                e.preventDefault();
                onRedo?.();
            }
            if (isCmdOrCtrl && e.key === "0") {
                e.preventDefault();
                onResetScene?.();
            }
            if (e.key === "Delete" || e.key === "Backspace") {
                // Should probably prevent default to avoid accidental navigation back
                // e.preventDefault(); 
                // Wait, backspace navigates back in some browsers. Safe to prevent default.
                e.preventDefault();
                onDelete?.();
            }

            // --- Layer Control ---
            if (e.key === "]") {
                e.preventDefault();
                if (isCmdOrCtrl) {
                    onBringForward?.(); // Cmd+]
                } else {
                    onBringToFront?.(); // ]
                }
            }
            if (e.key === "[") {
                e.preventDefault();
                if (isCmdOrCtrl) {
                    onSendBackward?.(); // Cmd+[
                } else {
                    onSendToBack?.(); // [
                }
            }

            // --- Media & Stream ---

            if (isCmdOrCtrl && e.key.toLowerCase() === "m") {
                e.preventDefault();
                onToggleMic?.();
            }
            if (isCmdOrCtrl && e.key.toLowerCase() === "e") {
                e.preventDefault();
                onToggleCamera?.();
            }
            if (isCmdOrCtrl && e.key.toLowerCase() === "b") {
                e.preventDefault();
                onToggleBroadcast?.();
            }
            if (e.key.toLowerCase() === "s") {
                e.preventDefault();
                onToggleSmartSwitch?.();
            }

            // --- Element Creation ---
            if (e.key.toLowerCase() === "t") {
                e.preventDefault();
                onAddText?.();
            }
            if (e.key.toLowerCase() === "l") {
                e.preventDefault();
                onOpenAssetLibrary?.();
            }
            if (e.key.toLowerCase() === "d") {
                e.preventDefault();
                onToggleDrawing?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        onToggleFullscreen,
        onToggleAiAssistant,
        onToggleSettings,
        onUndo,
        onRedo,
        onResetScene,
        onDelete,
        onBringToFront,
        onSendToBack,
        onBringForward,
        onSendBackward,
        onToggleRecording,
        onToggleMic,
        onToggleCamera,
        onToggleBroadcast,
        onToggleSmartSwitch,
        onAddText,
        onOpenAssetLibrary,
        onToggleDrawing,
    ]);
};
