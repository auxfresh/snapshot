import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AuthHeader from "@/components/auth/AuthHeader";
import ScreenshotCapture from "@/components/screenshot-capture";
import BackgroundOptions from "@/components/background-options";
import FrameOptions from "@/components/frame-options";
import PreviewArea from "@/components/preview-area";
import RecentScreenshots from "@/components/recent-screenshots";
import type { Screenshot, UserPreferences } from "@shared/schema";

export interface ScreenshotSettings {
  deviceType: "mobile" | "desktop";
  backgroundColor: string;
  frameStyle: "framed" | "rounded";
  frameColor: string;
}

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [settings, setSettings] = useState<ScreenshotSettings>({
    deviceType: "mobile",
    backgroundColor: "#6366F1",
    frameStyle: "framed",
    frameColor: "#FFFFFF",
  });
  const [currentScreenshot, setCurrentScreenshot] = useState<Screenshot | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Sync user with backend when authenticated
  const syncUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/auth/sync-user", userData);
      return await response.json();
    },
  });

  // Load user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/users/preferences", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const response = await apiRequest("GET", `/api/users/${user.uid}/preferences`);
      return await response.json();
    },
    enabled: !!user?.uid,
  });

  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<ScreenshotSettings>) => {
      if (!user?.uid) return;
      const response = await apiRequest("PUT", `/api/users/${user.uid}/preferences`, {
        defaultDeviceType: updates.deviceType,
        defaultBackgroundColor: updates.backgroundColor,
        defaultFrameStyle: updates.frameStyle,
        defaultFrameColor: updates.frameColor,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/preferences"] });
    },
  });

  // Sync user when authenticated
  useEffect(() => {
    if (user && !syncUserMutation.data) {
      syncUserMutation.mutate({
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
  }, [user]);

  // Load user preferences into settings
  useEffect(() => {
    if (userPreferences) {
      setSettings({
        deviceType: userPreferences.defaultDeviceType as "mobile" | "desktop",
        backgroundColor: userPreferences.defaultBackgroundColor,
        frameStyle: userPreferences.defaultFrameStyle as "framed" | "rounded",
        frameColor: userPreferences.defaultFrameColor,
      });
    }
  }, [userPreferences]);

  const updateSettings = (updates: Partial<ScreenshotSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    
    // Save preferences for authenticated users
    if (user) {
      updatePreferencesMutation.mutate(updates);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

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
