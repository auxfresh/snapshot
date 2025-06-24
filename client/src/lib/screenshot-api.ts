import { apiRequest } from "./queryClient";
import type { CaptureScreenshotRequest, Screenshot } from "@shared/schema";

export async function captureScreenshot(data: CaptureScreenshotRequest & { firebaseUid?: string }): Promise<Screenshot> {
  const response = await apiRequest("POST", "/api/screenshots/capture", data);
  return await response.json();
}

export async function getRecentScreenshots(limit?: number, firebaseUid?: string): Promise<Screenshot[]> {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (firebaseUid) params.append("firebaseUid", firebaseUid);
  
  const url = `/api/screenshots${params.toString() ? `?${params.toString()}` : ""}`;
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
