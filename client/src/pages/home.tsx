import { useState } from "react";
import { Camera, Settings, History } from "lucide-react";
import ScreenshotCapture from "@/components/screenshot-capture";
import BackgroundOptions from "@/components/background-options";
import FrameOptions from "@/components/frame-options";
import PreviewArea from "@/components/preview-area";
import RecentScreenshots from "@/components/recent-screenshots";
import type { Screenshot } from "@shared/schema";

export interface ScreenshotSettings {
  deviceType: "mobile" | "desktop";
  backgroundColor: string;
  frameStyle: "framed" | "rounded";
  frameColor: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [settings, setSettings] = useState<ScreenshotSettings>({
    deviceType: "mobile",
    backgroundColor: "#6366F1",
    frameStyle: "framed",
    frameColor: "#FFFFFF",
  });
  const [currentScreenshot, setCurrentScreenshot] = useState<Screenshot | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const updateSettings = (updates: Partial<ScreenshotSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Camera className="text-primary-foreground text-sm" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SnapShot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <History className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <ScreenshotCapture
              url={url}
              setUrl={setUrl}
              settings={settings}
              updateSettings={updateSettings}
              setCurrentScreenshot={setCurrentScreenshot}
              isCapturing={isCapturing}
              setIsCapturing={setIsCapturing}
            />
            
            <BackgroundOptions
              backgroundColor={settings.backgroundColor}
              onBackgroundChange={(color) => updateSettings({ backgroundColor: color })}
            />
            
            <FrameOptions
              frameStyle={settings.frameStyle}
              frameColor={settings.frameColor}
              onFrameStyleChange={(style) => updateSettings({ frameStyle: style })}
              onFrameColorChange={(color) => updateSettings({ frameColor: color })}
            />
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <PreviewArea
              screenshot={currentScreenshot}
              settings={settings}
              isCapturing={isCapturing}
            />
          </div>
        </div>

        {/* Recent Screenshots */}
        <RecentScreenshots />
      </main>
    </div>
  );
}
