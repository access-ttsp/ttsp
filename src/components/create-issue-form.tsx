"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { createIssue } from "@/modules/issues/actions";
import {
  createIssueFormSchema,
  type InferCreateIssueFormSchema,
} from "@/modules/issues/model";

interface CreateIssueFormProps {
  projectId: string;
  slug: string;
}

const ISSUE_STATUSES = ["backlog", "todo", "in progress", "done"] as const;

export function CreateIssueForm({ projectId, slug }: CreateIssueFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InferCreateIssueFormSchema>({
    resolver: typeboxResolver(createIssueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "backlog",
    },
  });

  const onSubmit = async (data: InferCreateIssueFormSchema) => {
    try {
      await createIssue(slug, projectId, {
        title: data.title,
        description: data.description ?? "",
        status: data.status ?? "backlog",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create issue"
      );
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Issue details</CardTitle>
          <CardDescription>
            Set a title, description and status for the issue.
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

      <div className="flex justify-end">
        <Button disabled={isSubmitting} size="lg" type="submit">
          Create Issue
        </Button>
      </div>
    </form>
  );
}
