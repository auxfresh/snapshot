import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { captureScreenshotSchema, insertScreenshotSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication endpoints
  app.post("/api/auth/sync-user", async (req, res) => {
    try {
      const { firebaseUid, email, displayName, photoURL } = insertUserSchema.parse(req.body);
      
      // Check if user exists
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          firebaseUid,
          email,
          displayName,
          photoURL,
        });
        
        // Create default preferences
        await storage.createUserPreferences({
          userId: user.id,
          defaultDeviceType: "mobile",
          defaultBackgroundColor: "#6366F1",
          defaultFrameStyle: "framed",
          defaultFrameColor: "#FFFFFF",
        });
      } else {
        // Update existing user
        user = await storage.updateUser(firebaseUid, {
          email,
          displayName,
          photoURL,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("User sync error:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  app.get("/api/users/:firebaseUid/preferences", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const preferences = await storage.getUserPreferences(user.id);
      res.json(preferences);
    } catch (error) {
      console.error("Get preferences error:", error);
      res.status(500).json({ message: "Failed to get preferences" });
    }
  });

  app.put("/api/users/:firebaseUid/preferences", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const updates = req.body;
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const preferences = await storage.updateUserPreferences(user.id, updates);
      res.json(preferences);
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Capture screenshot endpoint
  app.post("/api/screenshots/capture", async (req, res) => {
    try {
      const { url, deviceType, backgroundColor, frameStyle, frameColor, firebaseUid } = 
        captureScreenshotSchema.extend({ firebaseUid: z.string().optional() }).parse(req.body);

      // Get ScreenshotOne API key from environment
      const apiKey = process.env.SCREENSHOTONE_API_KEY || process.env.SCREENSHOT_API_KEY || "";
      
      if (!apiKey) {
        return res.status(500).json({ 
          message: "ScreenshotOne API key not configured" 
        });
      }

      // Build ScreenshotOne API URL
      const screenshotParams = new URLSearchParams({
        access_key: apiKey,
        url: url,
        viewport_width: deviceType === "mobile" ? "375" : "1920",
        viewport_height: deviceType === "mobile" ? "667" : "1080",
        device_scale_factor: "2",
        format: "png",
        block_ads: "true",
        block_cookie_banners: "true",
        delay: "3",
        timeout: "30",
      });

      const screenshotApiUrl = `https://api.screenshotone.com/take?${screenshotParams.toString()}`;

      // Make request to ScreenshotOne API
      const response = await fetch(screenshotApiUrl);
      
      if (!response.ok) {
        throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
      }

      // Get the screenshot URL (ScreenshotOne returns the image directly)
      const screenshotUrl = screenshotApiUrl;

      // Extract title from URL
      const title = new URL(url).hostname.replace('www.', '');

      // Get user ID if authenticated
      let userId = 1; // Default for anonymous users
      if (firebaseUid) {
        const user = await storage.getUserByFirebaseUid(firebaseUid);
        if (user) {
          userId = user.id;
        }
      }

      // Save screenshot to storage
      const screenshot = await storage.createScreenshot({
        userId,
        url,
        title,
        deviceType,
        backgroundColor,
        frameStyle,
        frameColor,
        screenshotUrl,
      });

      res.json(screenshot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      
      console.error("Screenshot capture error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to capture screenshot" 
      });
    }
  });

  // Get recent screenshots
  app.get("/api/screenshots", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const firebaseUid = req.query.firebaseUid as string;
      
      let userId: number | undefined;
      if (firebaseUid) {
        const user = await storage.getUserByFirebaseUid(firebaseUid);
        userId = user?.id;
      }
      
      const screenshots = await storage.getRecentScreenshots(userId, limit);
      res.json(screenshots);
    } catch (error) {
      console.error("Get screenshots error:", error);
      res.status(500).json({ message: "Failed to fetch screenshots" });
    }
  });

  // Get single screenshot
  app.get("/api/screenshots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const screenshot = await storage.getScreenshot(id);
      
      if (!screenshot) {
        return res.status(404).json({ message: "Screenshot not found" });
      }
      
      res.json(screenshot);
    } catch (error) {
      console.error("Get screenshot error:", error);
      res.status(500).json({ message: "Failed to fetch screenshot" });
    }
  });

  // Delete screenshot
  app.delete("/api/screenshots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScreenshot(id);
      res.json({ message: "Screenshot deleted successfully" });
    } catch (error) {
      console.error("Delete screenshot error:", error);
      res.status(500).json({ message: "Failed to delete screenshot" });
    }
  });

  // Download screenshot endpoint
  app.get("/api/screenshots/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const screenshot = await storage.getScreenshot(id);
      
      if (!screenshot) {
        return res.status(404).json({ message: "Screenshot not found" });
      }

      // Fetch the image from ScreenshotOne
      const imageResponse = await fetch(screenshot.screenshotUrl);
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch screenshot: ${imageResponse.status}`);
      }

      // Set download headers
      const filename = `${screenshot.title}-${screenshot.deviceType}.png`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'image/png');

      // Pipe the image data to the response
      const imageBuffer = await imageResponse.arrayBuffer();
      res.send(Buffer.from(imageBuffer));
    } catch (error) {
      console.error("Download screenshot error:", error);
      res.status(500).json({ message: "Failed to download screenshot" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
