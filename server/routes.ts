import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { captureScreenshotSchema, insertScreenshotSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Capture screenshot endpoint
  app.post("/api/screenshots/capture", async (req, res) => {
    try {
      const { url, deviceType, backgroundColor, frameStyle, frameColor } = 
        captureScreenshotSchema.parse(req.body);

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

      // Save screenshot to storage
      const screenshot = await storage.createScreenshot({
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
      const screenshots = await storage.getRecentScreenshots(limit);
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

  const httpServer = createServer(app);
  return httpServer;
}
