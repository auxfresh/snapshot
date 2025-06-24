import { screenshots, type Screenshot, type InsertScreenshot } from "@shared/schema";

export interface IStorage {
  getScreenshot(id: number): Promise<Screenshot | undefined>;
  getRecentScreenshots(limit?: number): Promise<Screenshot[]>;
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
  deleteScreenshot(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private screenshots: Map<number, Screenshot>;
  private currentId: number;

  constructor() {
    this.screenshots = new Map();
    this.currentId = 1;
  }

  async getScreenshot(id: number): Promise<Screenshot | undefined> {
    return this.screenshots.get(id);
  }

  async getRecentScreenshots(limit: number = 10): Promise<Screenshot[]> {
    const allScreenshots = Array.from(this.screenshots.values());
    return allScreenshots
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const id = this.currentId++;
    const screenshot: Screenshot = {
      ...insertScreenshot,
      id,
      createdAt: new Date(),
    };
    this.screenshots.set(id, screenshot);
    return screenshot;
  }

  async deleteScreenshot(id: number): Promise<void> {
    this.screenshots.delete(id);
  }
}

export const storage = new MemStorage();
