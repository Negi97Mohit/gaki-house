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
} from "lucide-react";

interface DynamicLayoutPickerProps {
  onSelectLayout: (mode: "split-vertical" | "split-horizontal") => void;
}

export const DynamicLayoutPicker: React.FC<DynamicLayoutPickerProps> = ({
  onSelectLayout,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 left-2 h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto"
          title="Change Layout"
          onClick={(e) => e.stopPropagation()} // Prevent selection when clicking the button
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onSelectLayout("split-vertical")}>
          <SplitSquareVertical className="w-4 h-4 mr-2" />
          Split Vertically
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectLayout("split-horizontal")}>
          <SplitSquareHorizontal className="w-4 h-4 mr-2" />
          Split Horizontally
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
