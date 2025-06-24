import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { captureScreenshot } from "@/lib/screenshot-api";
import type { Screenshot } from "@shared/schema";
import type { ScreenshotSettings } from "@/pages/home";

interface ScreenshotCaptureProps {
  url: string;
  setUrl: (url: string) => void;
  settings: ScreenshotSettings;
  updateSettings: (updates: Partial<ScreenshotSettings>) => void;
  setCurrentScreenshot: (screenshot: Screenshot | null) => void;
  isCapturing: boolean;
  setIsCapturing: (capturing: boolean) => void;
}

export default function ScreenshotCapture({
  url,
  setUrl,
  settings,
  updateSettings,
  setCurrentScreenshot,
  isCapturing,
  setIsCapturing,
}: ScreenshotCaptureProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [urlError, setUrlError] = useState("");

  const captureMutation = useMutation({
    mutationFn: captureScreenshot,
    onMutate: () => {
      setIsCapturing(true);
      setCurrentScreenshot(null);
    },
    onSuccess: (screenshot) => {
      setCurrentScreenshot(screenshot);
      queryClient.invalidateQueries({ queryKey: ["/api/screenshots"] });
      toast({
        title: "Success!",
        description: "Screenshot captured successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Capture error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to capture screenshot. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCapturing(false);
    },
  });

  const validateUrl = (inputUrl: string) => {
    if (!inputUrl) {
      setUrlError("Please enter a website URL");
      return false;
    }

    try {
      new URL(inputUrl);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Please enter a valid URL (must start with http:// or https://)");
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) {
      validateUrl(value);
    } else {
      setUrlError("");
    }
  };

  const handleCapture = () => {
    if (!validateUrl(url)) return;

    captureMutation.mutate({
      url,
      deviceType: settings.deviceType,
      backgroundColor: settings.backgroundColor,
      frameStyle: settings.frameStyle,
      frameColor: settings.frameColor,
      firebaseUid: user?.uid,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="website-url">Enter website URL</Label>
          <Input
            id="website-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={urlError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
          />
          {urlError && <p className="text-sm text-red-600 mt-1">{urlError}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Device Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={settings.deviceType === "mobile" ? "default" : "outline"}
              onClick={() => updateSettings({ deviceType: "mobile" })}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Smartphone className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Mobile</span>
            </Button>
            <Button
              variant={settings.deviceType === "desktop" ? "default" : "outline"}
              onClick={() => updateSettings({ deviceType: "desktop" })}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Monitor className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Desktop</span>
            </Button>
          </div>
        </div>

        <Button
          onClick={handleCapture}
          disabled={isCapturing || !url}
          className="w-full bg-secondary hover:bg-secondary/90"
        >
          {isCapturing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Snap It!
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
