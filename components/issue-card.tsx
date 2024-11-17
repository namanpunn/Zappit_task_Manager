"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import IssueDetailsDialog from "./issue-details-dialog";
import UserAvatar from "./user-avatar";
import { useRouter } from "next/navigation";
import { Issue, User } from "@prisma/client";

// Define the possible priority values
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Extend the Issue type to include assignee
interface ExtendedIssue extends Issue {
  assignee?: User | null; // Assignee relation (nullable)
}

// Map priority to color
const priorityColor: Record<Priority, string> = {
  LOW: "border-green-600",
  MEDIUM: "border-yellow-300",
  HIGH: "border-orange-400",
  URGENT: "border-red-400",
};

interface IssueCardProps {
  issue: ExtendedIssue; // Use the extended issue type
  showStatus?: boolean;
  onDelete?: (issueId: string) => void;
  onUpdate?: (issueId: string) => void;
}

export default function IssueCard({
  issue,
  showStatus = false,
  onDelete = () => {},
  onUpdate = () => {},
}: IssueCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  // Safeguard: Ensure issue object exists and is valid
  if (!issue) {
    console.error("Invalid issue object provided to IssueCard.");
    return null;
  }

  const handleDelete = (issueId: string) => {
    onDelete(issueId);
    router.refresh();
  };

  const handleUpdate = (issueId: string) => {
    onUpdate(issueId);
    router.refresh();
  };

  const created = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader
          className={`border-t-2 ${priorityColor[issue.priority]} rounded-lg`}
        >
          <CardTitle>{issue.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-2 -mt-3">
          {showStatus && <Badge>{issue.status}</Badge>}
          <Badge variant="outline" className="-ml-1">
            {issue.priority}
          </Badge>
        </CardContent>

        <CardFooter className="flex flex-col items-start space-y-3">
          {/* Ensure assignee exists before rendering */}
          {/* {issue.assignee && <UserAvatar user={issue.assignee} />} */}
          <div className="text-xs text-gray-400 w-full">
            Created {created}
          </div>
        </CardFooter>
      </Card>

      {isDialogOpen && (
        <IssueDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          issue={issue}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          borderCol={priorityColor[issue.priority]}
        />
      )}
    </>
  );
}
