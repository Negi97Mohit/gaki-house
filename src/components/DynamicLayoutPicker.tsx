import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface DynamicLayoutPickerProps {
  onSelectLayout: (
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  portalContainer?: HTMLElement | null;
}

export const DynamicLayoutPicker: React.FC<DynamicLayoutPickerProps> = ({
  onSelectLayout,
  portalContainer,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 left-2 h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
          title="Change Layout"
          style={{ zIndex: "var(--z-draggable-element-active)" }}
          onClick={(e) => e.stopPropagation()} // Prevent selection when clicking the button
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        container={portalContainer}
      >
        <DropdownMenuItem onClick={() => onSelectLayout("split-vertical")}>
          <SplitSquareVertical className="w-4 h-4 mr-2" />
          Split Horizontal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectLayout("split-horizontal")}>
          <SplitSquareHorizontal className="w-4 h-4 mr-2" />
          Split Vertical
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectLayout("pip")}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Picture in Picture
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectLayout("reset")}
          className="text-red-500"
        >
          <X className="w-4 h-4 mr-2" />
          Reset Layout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
