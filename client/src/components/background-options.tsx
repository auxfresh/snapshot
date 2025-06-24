import { useState } from "react";
import { Palette, Brush, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BackgroundOptionsProps {
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
}

const colorOptions = [
  "#6366F1", // primary
  "#EC4899", // secondary
  "#06B6D4", // cyan
  "#10B981", // emerald
  "linear-gradient(135deg, #F97316 0%, #EC4899 100%)", // orange to pink gradient
];

const smartColors = [
  "#A8A29E", // stone
  "#475569", // slate
  "#B91C1C", // red
];

export default function BackgroundOptions({
  backgroundColor,
  onBackgroundChange,
}: BackgroundOptionsProps) {
  const [activeTab, setActiveTab] = useState("colors");

  const ColorButton = ({ color, isActive }: { color: string; isActive: boolean }) => (
    <button
      onClick={() => onBackgroundChange(color)}
      className={`w-12 h-12 rounded-lg border-2 shadow-lg hover:scale-105 transition-transform ${
        isActive ? "border-primary ring-2 ring-primary/20" : "border-white"
      }`}
      style={{ background: color }}
    />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Options</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="gradients" className="flex items-center gap-2">
              <Brush className="w-4 h-4" />
              Gradients
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {colorOptions.map((color) => (
                <ColorButton
                  key={color}
                  color={color}
                  isActive={backgroundColor === color}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="gradients" className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              <ColorButton
                color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                isActive={backgroundColor === "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
              />
              <ColorButton
                color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                isActive={backgroundColor === "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"}
              />
              <ColorButton
                color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                isActive={backgroundColor === "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"}
              />
              <ColorButton
                color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                isActive={backgroundColor === "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"}
              />
              <ColorButton
                color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                isActive={backgroundColor === "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">Smart Picker</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {smartColors.map((color) => (
              <ColorButton
                key={color}
                color={color}
                isActive={backgroundColor === color}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Generated from your screenshot</p>
        </div>
      </CardContent>
    </Card>
  );
}
