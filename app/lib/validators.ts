import { z } from "zod";

// Define the project schema with types
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less"),
  key: z
    .string()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key must be 10 characters or less")
    .toUpperCase(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

// Define the sprint schema with types
export const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  startDate: z.date(),
  endDate: z.date(),
});

// Define the issue schema with types
export const issueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  assigneeId: z.string().cuid("Please select assignee"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

// Type inference for each schema
export type Project = z.infer<typeof projectSchema>;
export type Sprint = z.infer<typeof sprintSchema>;
export type Issue = z.infer<typeof issueSchema>;
