import { screenshots, users, userPreferences, type Screenshot, type InsertScreenshot, type User, type InsertUser, type UserPreferences, type InsertUserPreferences } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(firebaseUid: string, updates: Partial<InsertUser>): Promise<User>;
  
  // User preferences methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  
  // Screenshot methods
  getScreenshot(id: number): Promise<Screenshot | undefined>;
  getRecentScreenshots(userId?: number, limit?: number): Promise<Screenshot[]>;
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
  deleteScreenshot(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(firebaseUid: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.firebaseUid, firebaseUid))
      .returning();
    return user;
  }

  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const [preferences] = await db
      .insert(userPreferences)
      .values(insertPreferences)
      .returning();
    return preferences;
  }

  async updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [preferences] = await db
      .update(userPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return preferences;
  }

  // Screenshot methods
  async getScreenshot(id: number): Promise<Screenshot | undefined> {
    const [screenshot] = await db.select().from(screenshots).where(eq(screenshots.id, id));
    return screenshot || undefined;
  }

  async getRecentScreenshots(userId?: number, limit: number = 10): Promise<Screenshot[]> {
    if (userId) {
      return await db
        .select()
        .from(screenshots)
        .where(eq(screenshots.userId, userId))
        .orderBy(desc(screenshots.createdAt))
        .limit(limit);
    } else {
      return await db
        .select()
        .from(screenshots)
        .orderBy(desc(screenshots.createdAt))
        .limit(limit);
    }
  }

  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const [screenshot] = await db
      .insert(screenshots)
      .values(insertScreenshot)
      .returning();
    return screenshot;
  }

  async deleteScreenshot(id: number): Promise<void> {
    await db.delete(screenshots).where(eq(screenshots.id, id));
  }
}

export const storage = new DatabaseStorage();
