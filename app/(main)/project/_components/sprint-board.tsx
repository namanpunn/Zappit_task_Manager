"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import useFetch from "@/hooks/use-fetch";

import statuses from "@/data/status.json";
import { getIssuesForSprint, updateIssueOrder } from "@/actions/issues";

import SprintManager from "./sprint-manager";
import IssueCreationDrawer from "./create-issue";
import IssueCard from "@/components/issue-card";
import BoardFilters from "./board-filters";
import { IssueStatus, IssuePriority, Sprint } from "@prisma/client";
import { Issue } from "@prisma/client";



// Define Sprint type
// type Sprint = {
//   id: string;
//   status: "PLANNED" | "ACTIVE" | "COMPLETED";
//   name: string;
//   startDate?: string; 
//   endDate?: string;   
// };

// Define Issue type
// interface Issue {
//   projectId: string;
//   id: string;
//   title: string;
//   description: string | null;
//   status: IssueStatus;
//   order: number;
//   priority: IssuePriority;
//   assigneeId: string | null; // Use assigneeId instead of assignee
//   reporterId: string;
//   sprintId: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   // Remove or adjust 'assignee' field if needed
// }

// Props for SprintBoard
type SprintBoardProps = {
  sprints: Sprint[];
  projectId: string;
  orgId: string;
};

// Reorder function to handle Drag & Drop reordering
function reorder(list: Issue[], startIndex: number, endIndex: number): Issue[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const handleFilterChange = (filteredIssues: Issue[]) => {
  console.log(filteredIssues);
};

const SprintBoard: React.FC<SprintBoardProps> = ({ sprints, projectId, orgId }) => {
  const [currentSprint, setCurrentSprint] = useState<Sprint>(
    sprints.find((spr) => spr.status === "ACTIVE") || sprints[0]
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const {
    loading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch<Issue[]>(getIssuesForSprint);

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>(issues || []);

  const handleFilterChange = (filteredIssues: Issue[]): void => {
    setFilteredIssues(filteredIssues);
  };

  useEffect(() => {
    if (currentSprint?.id) {
      fetchIssues(currentSprint.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSprint?.id]);

  const handleAddIssue = (status: string) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  };

  const handleIssueCreated = () => {
    fetchIssues(currentSprint.id);
  };

  const {
    fn: updateIssueOrderFn,
    loading: updateIssuesLoading,
    error: updateIssuesError,
  } = useFetch<{ success: boolean }>(updateIssueOrder);

  const onDragEnd = async (result: DropResult) => {
    if (currentSprint.status === "PLANNED") {
      toast.warning("Start the sprint to update the board");
      return;
    }
    if (currentSprint.status === "COMPLETED") {
      toast.warning("Cannot update the board after the sprint has ended");
      return;
    }
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newOrderedData = [...(issues || [])];

    // Source and destination lists
    const sourceList = newOrderedData.filter(
      (list) => list.status === source.droppableId
    );

    const destinationList = newOrderedData.filter(
      (list) => list.status === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      const reorderedCards = reorder(
        sourceList,
        source.index,
        destination.index
      );

      reorderedCards.forEach((card, i) => {
        card.order = i;
      });
    } else {
      // Remove card from the source list
      const [movedCard] = sourceList.splice(source.index, 1);

      // Assign the new list ID to the moved card
      movedCard.status = destination.droppableId as IssueStatus;

      // Add the card to the destination list
      destinationList.splice(destination.index, 0, movedCard);

      sourceList.forEach((card, i) => {
        card.order = i;
      });

      destinationList.forEach((card, i) => {
        card.order = i;
      });
    }

    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    setIssues(newOrderedData);

    updateIssueOrderFn(sortedIssues);
  };

  if (issuesError) return <div>Error loading issues</div>;

  return (
    <div className="flex flex-col">
      <SprintManager
        sprint={currentSprint} // Use lowercase 'sprint'
        setSprint={(sprint) => setCurrentSprint(sprint)}
        sprints={sprints}
        projectId={projectId}
      />


      {/* {issues && !issuesLoading && (
        <BoardFilters issues={issues} onFilterChange={handleFilterChange} />
      )} */}

      {updateIssuesError && (
        <p className="text-red-500 mt-2">{updateIssuesError.message}</p>
      )}
      {(updateIssuesLoading || issuesLoading) && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
          {statuses.map((column) => (
            <Droppable key={column.key} droppableId={column.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  <h3 className="font-semibold mb-2 text-center">{column.name}</h3>
                  {filteredIssues
                    ?.filter((issue) => issue.status === column.key)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                        isDragDisabled={updateIssuesLoading}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <IssueCard
                              issue={issue}
                              onDelete={() => fetchIssues(currentSprint.id)}
                              onUpdate={(issueId: string) => {

                                const updatedIssue = issues?.find((issue) => issue.id === issueId);
                                if (updatedIssue) {
                                  setIssues((issues) =>
                                    issues?.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue))
                                  );
                                }
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  {column.key === "TODO" &&
                    currentSprint.status !== "COMPLETED" && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => handleAddIssue(column.key)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Issue
                      </Button>
                    )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentSprint.id}
        status={selectedStatus || ""} // Provide an empty string if selectedStatus is null
        projectId={projectId}
        onIssueCreated={handleIssueCreated}
        orgId={orgId}
      />
    </div>
  );
};

export default SprintBoard;
