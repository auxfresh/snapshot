import { Download, RefreshCw, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Screenshot } from "@shared/schema";
import type { ScreenshotSettings } from "@/pages/home";

interface PreviewAreaProps {
  screenshot: Screenshot | null;
  settings: ScreenshotSettings;
  isCapturing: boolean;
}

export default function PreviewArea({
  screenshot,
  settings,
  isCapturing,
}: PreviewAreaProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!screenshot) return;

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = screenshot.screenshotUrl;
    link.download = `${screenshot.title}-${screenshot.deviceType}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your screenshot is being downloaded.",
    });
  };

  const renderScreenshotWithFrame = () => {
    if (!screenshot) return null;

    const frameStyle = settings.frameStyle === "rounded" ? "rounded-2xl" : "rounded-lg";
    const deviceIcon = settings.deviceType === "mobile" ? "📱" : "🖥️";

    return (
      <div
        className="p-8 rounded-xl"
        style={{ background: settings.backgroundColor }}
      >
        <div
          className={`bg-white shadow-2xl overflow-hidden max-w-md mx-auto ${frameStyle}`}
          style={{ borderColor: settings.frameColor, borderWidth: "4px" }}
        >
          {/* Browser chrome for desktop */}
          {settings.deviceType === "desktop" && (
            <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 border-b">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          )}
          
          {/* Screenshot image */}
          <div className="relative">
            <img
              src={screenshot.screenshotUrl}
              alt={`Screenshot of ${screenshot.title}`}
              className="w-full h-auto"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'flex';
              }}
            />
            {/* Fallback content */}
            <div className="hidden items-center justify-center h-64 bg-gray-100 text-gray-500">
              <div className="text-center">
                <span className="text-2xl mb-2 block">{deviceIcon}</span>
                <p className="text-sm">{screenshot.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={isCapturing}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!screenshot}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Empty State */}
          {!screenshot && !isCapturing && (
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Snap a website to get started
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                Enter a website URL above and click "Snap It!" to capture a beautiful screenshot
              </p>
            </div>
          )}

          {/* Loading State */}
          {isCapturing && (
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">
                Capturing screenshot...
              </h3>
              <p className="text-primary/70 text-center max-w-sm">
                Please wait while we process your request
              </p>
            </div>
          )}

          {/* Screenshot Result */}
          {screenshot && !isCapturing && (
            <div className="space-y-4">
              {renderScreenshotWithFrame()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
