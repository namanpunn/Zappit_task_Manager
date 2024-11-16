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
  sprints: Sprint[];
  organizationId: string;
}

export interface Sprint {
  id: string;
  name: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;
  const project: Project | null = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto">
      <SprintCreationForm
  projectTitle={project.name}
  projectId={projectId}
  projectKey={project.key}
  sprintKey={(project.sprints?.length + 1).toString()}
/>

      {project.sprints.length > 0 ? (
        <SprintBoard
          sprints={project.sprints}
          projectId={projectId}
          orgId={project.organizationId}
        />
      ) : (
        <div>Create a Sprint from the button above</div>
      )}
    </div>
  );
}
