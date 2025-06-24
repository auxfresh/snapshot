import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FrameOptionsProps {
  frameStyle: "framed" | "rounded";
  frameColor: string;
  onFrameStyleChange: (style: "framed" | "rounded") => void;
  onFrameColorChange: (color: string) => void;
}

const frameColors = [
  "#FFFFFF", // white
  "#D1D5DB", // gray-300
  "#6B7280", // gray-500
  "#374151", // gray-700
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#10B981", // emerald
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
];

export default function FrameOptions({
  frameStyle,
  frameColor,
  onFrameStyleChange,
  onFrameColorChange,
}: FrameOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frame Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Frame Style</Label>
          <RadioGroup value={frameStyle} onValueChange={onFrameStyleChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="framed" id="framed" />
              <Label htmlFor="framed">Framed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rounded" id="rounded" />
              <Label htmlFor="rounded">Rounded</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Frame Color</Label>
          <div className="grid grid-cols-6 gap-2">
            {frameColors.map((color) => (
              <button
                key={color}
                onClick={() => onFrameColorChange(color)}
                className={`w-8 h-8 rounded shadow-sm border-2 transition-all ${
                  frameColor === color
                    ? "border-primary ring-2 ring-primary/20 scale-110"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
