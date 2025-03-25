import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (not used for storage, just for type reference)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Assessment schemas for validation
export const educationSchema = z.object({
  level: z.string().min(1, "Education level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  achievements: z.string().optional(),
});

export const skillSchema = z.object({
  technicalSkills: z.array(z.string()).min(1, "Select at least one technical skill"),
  softSkills: z.array(z.string()).min(1, "Select at least one soft skill"),
  skillProficiencies: z.array(
    z.object({
      skill: z.string(),
      proficiency: z.number().min(1).max(5),
    })
  ).optional(),
});

export const experienceSchema = z.object({
  experiences: z.array(
    z.object({
      jobTitle: z.string().min(1, "Job title is required"),
      company: z.string().min(1, "Company name is required"),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().optional(),
      currentPosition: z.boolean().optional(),
      responsibilities: z.string().min(1, "Please describe your responsibilities"),
    })
  ).optional().default([]),
  industries: z.array(z.string()).optional().default([]), // Making industries optional
});

export const interestSchema = z.object({
  careerGoals: z.string().optional().default(""), // Making career goals optional
  interestAreas: z.array(z.string()).min(1, "Select at least one area of interest"),
  workPreferences: z.object({
    remotePreference: z.number().min(1).max(5),
    teamSizePreference: z.number().min(1).max(5),
  }),
});

export const assessmentSchema = z.object({
  education: educationSchema,
  skills: skillSchema,
  experience: experienceSchema,
  interests: interestSchema,
});

export type AssessmentData = z.infer<typeof assessmentSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type InterestData = z.infer<typeof interestSchema>;

// Career recommendation schema
export const careerRecommendationSchema = z.object({
  careerPaths: z.array(
    z.object({
      title: z.string(),
      match: z.number(),
      description: z.string(),
      requiredSkills: z.array(z.string()),
      icon: z.string().optional(),
      skillGap: z.object({
        skills: z.array(z.string()),
        learningPath: z.array(z.string()),
      }),
    })
  ),
});

export type CareerRecommendation = z.infer<typeof careerRecommendationSchema>;
