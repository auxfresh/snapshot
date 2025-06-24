import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const screenshots = pgTable("screenshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  deviceType: text("device_type").notNull(), // 'mobile' or 'desktop'
  backgroundColor: text("background_color").notNull(),
  frameStyle: text("frame_style").notNull(), // 'framed' or 'rounded'
  frameColor: text("frame_color").notNull(),
  screenshotUrl: text("screenshot_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  defaultDeviceType: text("default_device_type").notNull().default("mobile"),
  defaultBackgroundColor: text("default_background_color").notNull().default("#6366F1"),
  defaultFrameStyle: text("default_frame_style").notNull().default("framed"),
  defaultFrameColor: text("default_frame_color").notNull().default("#FFFFFF"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  firebaseUid: true,
  email: true,
  displayName: true,
  photoURL: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

export const insertScreenshotSchema = createInsertSchema(screenshots).omit({
  id: true,
  createdAt: true,
});

export const captureScreenshotSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  deviceType: z.enum(["mobile", "desktop"]),
  backgroundColor: z.string(),
  frameStyle: z.enum(["framed", "rounded"]),
  frameColor: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;
export type CaptureScreenshotRequest = z.infer<typeof captureScreenshotSchema>;
