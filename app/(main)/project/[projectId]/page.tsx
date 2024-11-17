import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import SprintCreationForm from "../_components/create-sprint";
import SprintBoard from "../_components/sprint-board";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

interface Project {
  name: string;
  key: string;
  sprints: Sprint[]; // Make sure the Sprint type includes all required properties
  organizationId: string;
}

export interface Sprint {
  id: string;
  name: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  startDate: Date;
  endDate: Date;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;
  const project: Project | null = await getProject(projectId);

  if (!project) {
    notFound();
  }

  // Ensure the sprints have the necessary properties
  const formattedSprints = project.sprints.map((sprint) => ({
    ...sprint,
    startDate: sprint.startDate || new Date(),  // Fallback if missing
    endDate: sprint.endDate || new Date(),      // Fallback if missing
    projectId: sprint.projectId || projectId,   // Ensure projectId is set
    createdAt: sprint.createdAt || new Date(),
    updatedAt: sprint.updatedAt || new Date(),
  }));

  return (
    <div className="container mx-auto">
      <SprintCreationForm
        projectTitle={project.name}
        projectId={projectId}
        projectKey={project.key}
        sprintKey={(project.sprints?.length + 1).toString()}
      />

      {formattedSprints.length > 0 ? (
        <SprintBoard
          sprints={formattedSprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      ) : (
        <div>Create a Sprint from the button above</div>
      )}
    </div>
  );
}
