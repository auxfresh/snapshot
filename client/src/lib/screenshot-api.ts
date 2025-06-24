import { apiRequest } from "./queryClient";
import type { CaptureScreenshotRequest, Screenshot } from "@shared/schema";

export async function captureScreenshot(data: CaptureScreenshotRequest): Promise<Screenshot> {
  const response = await apiRequest("POST", "/api/screenshots/capture", data);
  return await response.json();
}

export async function getRecentScreenshots(limit?: number): Promise<Screenshot[]> {
  const url = limit ? `/api/screenshots?limit=${limit}` : "/api/screenshots";
  const response = await apiRequest("GET", url);
  return await response.json();
}

export async function getScreenshot(id: number): Promise<Screenshot> {
  const response = await apiRequest("GET", `/api/screenshots/${id}`);
  return await response.json();
}

export async function deleteScreenshot(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/screenshots/${id}`);
}
