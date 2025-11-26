// src/components/DraggableGraph.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { GraphObject } from "@/types/caption";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Move, X, Maximize2 } from "lucide-react";
import { SmartDraggable } from "@/components/video-canvas/SmartDraggable";

interface DraggableGraphProps {
  graph: GraphObject;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onDelete: (id: string) => void;
  isFocused: boolean;
  containerSize: { width: number; height: number }; // Added containerSize
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#FFBB28",
];

export const DraggableGraph = ({
  graph,
  onPositionChange,
  onResize,
  onDelete,
  isFocused,
  containerSize,
}: DraggableGraphProps) => {
  const [isInteracting, setIsInteracting] = useState(false);

  const handleChange = (
    id: string,
    layout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }
  ) => {
    if (layout.position) {
      // SmartDraggable uses top-left, GraphObject expects percentage center?
      // Wait, looking at original DraggableGraph, it used top/left percents.
      // So we can pass directly.
      onPositionChange(id, layout.position);
    }
    if (layout.size) {
      // Original onResize expected pixels, but SmartDraggable returns Percentages.
      // We need to convert back if the parent expects pixels, OR update parent to expect %.
      // Assuming we want to stick to the standard % based layout used in other overlays:

      // Note: The original code passed width/height in PIXELS to onResize:
      // onResize(graph.id, { width: Math.max(newWidth, 200), ... })
      // But stored it in graph.size (which likely expects pixels based on original usage).

      // However, for consistency, SmartDraggable works best with %.
      // Let's convert % back to pixels for the graph object if that's what it stores.
      const widthPx = (layout.size.width / 100) * containerSize.width;
      const heightPx = (layout.size.height / 100) * containerSize.height;
      onResize(id, { width: widthPx, height: heightPx });
    }
  };

  const renderChart = () => {
    if (!graph.data || graph.data.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center p-4">
          <p>
            Graph created. <br /> Now, add some data points by speaking.
          </p>
        </div>
      );
    }
    switch (graph.graphType) {
      case "bar":
        return (
          <BarChart data={graph.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" name={graph.config.xAxisLabel} />
            <YAxis name={graph.config.yAxisLabel} />
            <Tooltip cursor={{ fill: "rgba(206, 206, 206, 0.2)" }} />
            <Legend />
            <Bar
              dataKey="value"
              fill="#8884d8"
              name={graph.config.yAxisLabel || "Value"}
            />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={graph.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" name={graph.config.xAxisLabel} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              name={graph.config.yAxisLabel || "Value"}
            />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={graph.data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              fill="#8884d8"
              label
            >
              {graph.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return <div>Unsupported graph type</div>;
    }
  };

  // Convert pixel size to percentage for SmartDraggable initial state
  // graph.size is likely in pixels based on previous usage
  const widthPercent = (graph.size.width / containerSize.width) * 100;
  const heightPercent = (graph.size.height / containerSize.height) * 100;

  return (
    <SmartDraggable
      id={graph.id}
      position={graph.position} // Assumed % from original file
      size={{ width: widthPercent, height: heightPercent }}
      containerSize={containerSize}
      zIndex={10}
      isSelected={isFocused}
      minWidth={200}
      minHeight={150}
      onChange={handleChange}
      onDragStart={() => setIsInteracting(true)}
      onDragStop={() => setIsInteracting(false)}
      cancel=".delete-btn"
      className={cn(
        "group bg-card/80 backdrop-blur-sm border rounded-lg shadow-2xl transition-all duration-200",
        isFocused && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="w-full h-full relative p-4 flex flex-col cursor-move">
        <Move className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-5 text-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <button
          className="delete-btn absolute -top-3 -right-3 z-50 h-8 w-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(graph.id);
          }}
          title="Delete graph"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="h-4 w-4 text-white" />
        </button>

        <h3 className="text-lg font-semibold text-center mb-2 text-card-foreground select-none">
          {graph.config.title}
        </h3>

        <div className="flex-grow w-full h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() as React.ReactElement}
          </ResponsiveContainer>
        </div>

        {/* Resize Handle Visualization (functionality handled by SmartDraggable) */}
        <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Maximize2 className="h-3 w-3 text-primary-foreground" />
        </div>
      </div>
    </SmartDraggable>
  );
};
