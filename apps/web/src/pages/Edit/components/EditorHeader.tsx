import { useNavigate } from "react-router-dom";
import {
    X,
    Undo,
    Redo,
    Settings,
    Download
} from "lucide-react";
import { Button } from "@caption-cam/ui/button";
import { cn } from "@caption-cam/core/lib/utils";

interface EditorHeaderProps {
    sessionName: string;
    showControlPanel: boolean;
    setShowControlPanel: (show: boolean) => void;
    onExport: () => void;
}

export const EditorHeader = ({
    sessionName,
    showControlPanel,
    setShowControlPanel,
    onExport
}: EditorHeaderProps) => {
    const navigate = useNavigate();

    return (
        <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0 bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="text-neutral-400 hover:text-white"
                >
                    <X className="w-4 h-4 mr-2" />
                    Close
                </Button>
                <div className="h-6 w-px bg-neutral-800" />
                <h1 className="text-sm font-medium text-neutral-300 truncate max-w-xs">
                    {sessionName}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                    <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                    <Redo className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-neutral-800 mx-2" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowControlPanel(!showControlPanel)}
                    className={cn(
                        "text-neutral-400 hover:text-white",
                        showControlPanel && "bg-neutral-800 text-white"
                    )}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Controls
                </Button>
                <Button
                    size="sm"
                    onClick={onExport}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>
        </header>
    );
};
