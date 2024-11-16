"use client";

import { useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import useFetch from "@/hooks/use-fetch";
import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organizations";

// Define Zod schema for issue validation
const issueSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export type IssueSchema = z.infer<typeof issueSchema>;

interface IssueCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  status: string;
  projectId: string;
  onIssueCreated: () => void;
  orgId: string;
}

export default function IssueCreationDrawer({
  isOpen,
  onClose,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}: IssueCreationDrawerProps) {
  // Hooks for API calls
  const {
    loading: createIssueLoading,
    fn: createIssueFn,
    error,
    data: newIssue,
  } = useFetch(createIssue);

  const {
    loading: usersLoading,
    fn: fetchUsers,
    data: users,
  } = useFetch(getOrganizationUsers);

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IssueSchema>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
    },
  });

  // Fetch organization users when the drawer is opened
  useEffect(() => {
    if (isOpen && orgId) {
      fetchUsers(orgId);
    }
  }, [isOpen, orgId, fetchUsers]);

  // Handle form submission
  const onSubmit: SubmitHandler<IssueSchema> = async (data) => {
    await createIssueFn(projectId, {
      ...data,
      status,
      sprintId,
    });
  };

  // Reset form and close drawer after successful issue creation
  useEffect(() => {
    if (newIssue) {
      reset();
      onClose();
      onIssueCreated();
    }
  }, [newIssue, createIssueLoading, onClose, onIssueCreated, reset]);

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Issue</DrawerTitle>
        </DrawerHeader>

        {usersLoading && <p>Loading users...</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Assignee Selector */}
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium mb-1">
              Assignee
            </label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigneeId && (
              <p className="text-red-500 text-sm mt-1">{errors.assigneeId.message}</p>
            )}
          </div>

          {/* Description Editor */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MDEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Priority Selector */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 mt-2">{error.message}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createIssueLoading}
            className="w-full"
          >
            {createIssueLoading ? "Creating..." : "Create Issue"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
