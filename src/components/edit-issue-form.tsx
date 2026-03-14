"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateIssue } from "@/app/(restricted)/[slug]/projects/[id]/issues/edit/[issueId]/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type InferUpdateIssueFormSchema,
  type IssueView,
  updateIssueFormSchema,
} from "@/modules/issues/model";

interface EditIssueFormProps {
  issue: IssueView;
  projectId: string;
  slug: string;
}

const ISSUE_STATUSES = ["backlog", "todo", "in progress", "done"] as const;

export function EditIssueForm({ issue, projectId, slug }: EditIssueFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InferUpdateIssueFormSchema>({
    resolver: typeboxResolver(updateIssueFormSchema),
    defaultValues: {
      title: issue.title,
      description: issue.description ?? "",
      status: issue.status ?? "backlog",
    },
  });

  const onSubmit = async (data: InferUpdateIssueFormSchema) => {
    try {
      await updateIssue(slug, projectId, String(issue.id), {
        title: data.title,
        description: data.description ?? "",
        status: data.status ?? "backlog",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update issue"
      );
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/${slug}/projects/${projectId}/issues/${issue.id}`}>
            &larr; Back
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Issue details</CardTitle>
          <CardDescription>
            Update the title, description and status for the issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                aria-invalid={!!errors.title}
                id="title"
                placeholder="e.g. Fix login button styling"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-destructive text-sm">
                  {errors.title.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                aria-invalid={!!errors.description}
                id="description"
                placeholder="Brief description of the issue..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <span className="text-destructive text-sm">
                  {errors.description.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "backlog"}
                  >
                    <SelectTrigger
                      aria-invalid={!!errors.status}
                      className="w-full"
                      id="status"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <span className="text-destructive text-sm">
                  {errors.status.message}
                </span>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href={`/${slug}/projects/${projectId}/issues/${issue.id}`}>
            Cancel
          </Link>
        </Button>
        <Button disabled={isSubmitting} size="lg" type="submit">
          Save
        </Button>
      </div>
    </form>
  );
}
