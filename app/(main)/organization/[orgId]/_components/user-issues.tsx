import { Suspense } from "react";
import { getUserIssues } from "@/actions/organizations"; // Assume this includes related data
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssueCard from "@/components/issue-card";
import { Issue, User } from "@prisma/client";

// Define the extended Issue type with relations
type IssueWithRelations = Issue & {
  assignee?: User | null; // Include related user data for assignee
  reporter?: User | null; // Include related user data for reporter
};

// Define types for the component props
interface UserIssuesProps {
  userId: string; // Assuming userId is a string
}

export default async function UserIssues({ userId }: UserIssuesProps) {
  // Fetch issues with related data
  const issues: IssueWithRelations[] = await getUserIssues(userId);

  if (issues.length === 0) {
    return null;
  }

  // Filter issues assigned to and reported by the user
  const assignedIssues = issues.filter(
    (issue) => issue.assignee?.id === userId
  );
  const reportedIssues = issues.filter(
    (issue) => issue.reporter?.id === userId
  );

  return (
    <>
      <h1 className="text-4xl font-bold gradient-title mb-4">My Issues</h1>

      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned">Assigned to You</TabsTrigger>
          <TabsTrigger value="reported">Reported by You</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <Suspense fallback={<div>Loading...</div>}>
            <IssueGrid issues={assignedIssues} />
          </Suspense>
        </TabsContent>
        <TabsContent value="reported">
          <Suspense fallback={<div>Loading...</div>}>
            <IssueGrid issues={reportedIssues} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
}

// Define types for the IssueGrid props
interface IssueGridProps {
  issues: IssueWithRelations[];
}

function IssueGrid({ issues }: IssueGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} showStatus />
      ))}
    </div>
  );
}
