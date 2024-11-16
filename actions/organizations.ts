"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Organization, Project, Issue, User as PrismaUser } from "@prisma/client";
import { OrganizationResource, OrganizationMembershipList } from "@clerk/nextjs/api";

// Function to get organization details based on slug
export async function getOrganization(slug: string): Promise<OrganizationResource | null> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch organization details from Clerk
  const organization = await clerkClient.organizations.getOrganization({ slug });

  if (!organization) {
    return null;
  }

  // Check if the user belongs to this organization
  const membership: OrganizationMembershipList = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: organization.id,
  });

  const userMembership = membership.data.find(
    (member) => member.publicUserData.userId === userId
  );

  // Return null if the user is not a member of the organization
  if (!userMembership) {
    return null;
  }

  return organization;
}

// Function to get projects in an organization
export async function getProjects(orgId: string): Promise<Project[]> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

// Function to get issues assigned or reported by a user
export async function getUserIssues(userId: string): Promise<Issue[]> {
  const { orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("No user id or organization id found");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issues = await db.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

// Function to get users in an organization
export async function getOrganizationUsers(orgId: string): Promise<PrismaUser[]> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const organizationMemberships = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const userIds = organizationMemberships.data.map(
    (membership) => membership.publicUserData.userId
  );

  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        in: userIds,
      },
    },
  });

  return users;
}
