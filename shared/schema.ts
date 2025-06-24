import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const screenshots = pgTable("screenshots", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  deviceType: text("device_type").notNull(), // 'mobile' or 'desktop'
  backgroundColor: text("background_color").notNull(),
  frameStyle: text("frame_style").notNull(), // 'framed' or 'rounded'
  frameColor: text("frame_color").notNull(),
  screenshotUrl: text("screenshot_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;
export type CaptureScreenshotRequest = z.infer<typeof captureScreenshotSchema>;
