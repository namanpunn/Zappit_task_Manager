"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import { sprintSchema } from "@/app/lib/validators";
import useFetch from "@/hooks/use-fetch";
import { createSprint } from "@/actions/sprints";
import { z } from "zod";  // Make sure to import Zod

interface SprintCreationFormProps {
  projectTitle: string;
  projectKey: string;
  projectId: string;
  sprintKey: string;
}

export default function SprintCreationForm({
  projectTitle,
  projectKey,
  projectId,
  sprintKey,
}: SprintCreationFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });
  const router = useRouter();

  const { loading: createSprintLoading, fn: createSprintFn } =
    useFetch(createSprint);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof sprintSchema>>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: `${projectKey}-${sprintKey}`,
      startDate: dateRange.from,
      endDate: dateRange.to,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof sprintSchema>> = async (data) => {
    await createSprintFn(projectId, {
      ...data,
      startDate: dateRange.from,
      endDate: dateRange.to,
    });
    setShowForm(false);
    router.refresh(); // Refresh the page to show updated data
  };

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold mb-8 gradient-title">
          {projectTitle}
        </h1>
        <Button
          className="mt-2"
          onClick={() => setShowForm(!showForm)}
          variant={!showForm ? "default" : "destructive"}
        >
          {!showForm ? "Create New Sprint" : "Cancel"}
        </Button>
      </div>
      {showForm && (
        <Card className="pt-4 mb-4">
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex gap-4 items-end"
            >
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Sprint Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  readOnly
                  className="bg-slate-950"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Sprint Duration
                </label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal bg-slate-950 ${!dateRange.from && "text-muted-foreground"
                            }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "LLL dd, y") : "Pick a start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto bg-slate-900" align="start">
                        <DayPicker
                          classNames={{
                            chevron: "fill-blue-500",
                            range_start: "bg-blue-700",
                            range_end: "bg-blue-700",
                            range_middle: "bg-blue-400",
                            day_button: "border-none",
                            today: "border-2 border-blue-700",
                          }}
                          selected={dateRange.from}  // Use `from` directly here
                          mode="single"
                          onSelect={(date) => {
                            if (date) {
                              setDateRange((prev) => ({ ...prev, from: date }));
                              field.onChange(date);  // Update the start date
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />

                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal bg-slate-950 ${!dateRange.to && "text-muted-foreground"
                            }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "LLL dd, y") : "Pick an end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto bg-slate-900" align="start">
                        <DayPicker
                          classNames={{
                            chevron: "fill-blue-500",
                            range_start: "bg-blue-700",
                            range_end: "bg-blue-700",
                            range_middle: "bg-blue-400",
                            day_button: "border-none",
                            today: "border-2 border-blue-700",
                          }}
                          selected={dateRange.to}  // Use `to` directly here
                          mode="single"
                          onSelect={(date) => {
                            if (date) {
                              setDateRange((prev) => ({ ...prev, to: date }));
                              field.onChange(date);  // Update the end date
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />

              </div>
              <Button type="submit" disabled={createSprintLoading}>
                {createSprintLoading ? "Creating..." : "Create Sprint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
