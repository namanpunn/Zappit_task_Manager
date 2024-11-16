"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Project, Sprint } from "@prisma/client";

interface ProjectData {
  name: string;
  key: string;
  description: string;
}

// Function to create a project
export async function createProject(data: ProjectData): Promise<Project> {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No Organization Selected");
  }

  // Check if the user is an admin of the organization
  const { data: membershipList } = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const userMembership = membershipList.find(
    (membership) => membership.publicUserData?.userId === userId
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error("Only organization admins can create projects");
  }

  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error: any) {
    throw new Error("Error creating project: " + error.message);
  }
}

// Function to get a project by ID, including its sprints
export async function getProject(projectId: string): Promise<(Project & { sprints: Sprint[] }) | null> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Find user to verify existence
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get project with sprints and organization
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Verify project belongs to the organization
  if (project.organizationId !== orgId) {
    return null;
  }

  return project;
}

// Function to delete a project by ID
export async function deleteProject(projectId: string): Promise<{ success: boolean }> {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  if (orgRole !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have permission to delete it"
    );
  }

  await db.project.delete({
    where: { id: projectId },
  });

  return { success: true };
}
