"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Sprint, Project } from "@prisma/client";

interface SprintData {
  name: string;
  startDate: string;
  endDate: string;
}

type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

// Function to create a sprint
export async function createSprint(
  projectId: string,
  data: SprintData
): Promise<Sprint> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { sprints: { orderBy: { createdAt: "desc" } } },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found");
  }

  const sprint = await db.sprint.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: "PLANNED",
      projectId: projectId,
    },
  });

  return sprint;
}

// Function to update the status of a sprint
export async function updateSprintStatus(
  sprintId: string,
  newStatus: SprintStatus
): Promise<{ success: boolean; sprint: Sprint }> {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { project: true },
    });

    if (!sprint) {
      throw new Error("Sprint not found");
    }

    if (sprint.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    if (orgRole !== "org:admin") {
      throw new Error("Only Admin can make this change");
    }

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      throw new Error("Cannot start sprint outside of its date range");
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      throw new Error("Can only complete an active sprint");
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status: newStatus },
    });

    return { success: true, sprint: updatedSprint };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
