"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { IconGripVertical } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useId, useMemo, useState } from "react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IssueView } from "@/modules/issues/model";
import type { ProjectStatusView } from "@/modules/project-statuses/service";

const EMPTY_ISSUES: IssueView[] = [];
const EMPTY_STATUSES: ProjectStatusView[] = [];

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface IssuesKanbanProps {
  fallbackData?: IssueView[];
  projectId: string;
  slug: string;
  statuses: ProjectStatusView[];
}

async function fetchIssues(url: string): Promise<IssueView[]> {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch issues");
  }
  return res.json();
}

const COLUMN_PREFIX = "column-";
const CARD_DROP_PREFIX = "card-drop-";

function getTargetFromOverId(
  overId: string,
  issuesByStatus: Map<number, IssueView[]>
): { statusId: number; index: number } | null {
  if (overId.startsWith(COLUMN_PREFIX)) {
    const statusId = Number.parseInt(overId.slice(COLUMN_PREFIX.length), 10);
    if (Number.isNaN(statusId)) {
      return null;
    }
    const columnIssues = issuesByStatus.get(statusId) ?? [];
    return { statusId, index: columnIssues.length };
  }
  if (overId.startsWith(CARD_DROP_PREFIX)) {
    const issueId = Number.parseInt(overId.slice(CARD_DROP_PREFIX.length), 10);
    if (Number.isNaN(issueId)) {
      return null;
    }
    for (const [statusId, columnIssues] of issuesByStatus) {
      const idx = columnIssues.findIndex((i) => i.id === issueId);
      if (idx >= 0) {
        return { statusId, index: idx };
      }
    }
    return null;
  }
  return null;
}

function KanbanCard({
  issue,
  statusId,
  index,
  slug,
  projectId,
}: {
  issue: IssueView;
  statusId: number;
  index: number;
  slug: string;
  projectId: string;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDragRef,
  } = useDraggable({
    id: issue.id,
    data: { type: "card" as const, statusId, index },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${CARD_DROP_PREFIX}${issue.id}`,
    data: { type: "card" as const, statusId, index },
  });
  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef]
  );

  return (
    <Link
      className="flex cursor-pointer items-start gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-all duration-200 ease-out hover:bg-muted/50 hover:shadow-md data-[dragging=true]:opacity-40 data-[over=true]:ring-2 data-[over=true]:ring-primary/30"
      data-dragging={isDragging}
      data-over={isOver}
      href={`/${slug}/projects/${projectId}/issues/${issue.id}`}
      ref={setNodeRef}
    >
      <Button
        {...attributes}
        {...listeners}
        className="size-6 shrink-0 cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        size="icon"
        variant="ghost"
      >
        <IconGripVertical className="size-3.5" />
        <span className="sr-only">Drag to reorder</span>
      </Button>
      <div className="min-w-0 flex-1">
        <span className="font-medium">{issue.title}</span>
        <div className="mt-1 text-muted-foreground text-xs">
          {formatDate(issue.createdAt)}
        </div>
      </div>
    </Link>
  );
}

function KanbanColumn({
  status,
  issues,
  slug,
  projectId,
  isOver,
  setNodeRef,
}: {
  status: ProjectStatusView;
  issues: IssueView[];
  slug: string;
  projectId: string;
  isOver: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
}) {
  return (
    <div
      className="flex min-w-[280px] flex-1 flex-col rounded-lg border bg-muted/30 p-3 transition-all duration-200 ease-out data-[over=true]:bg-muted/60 data-[over=true]:ring-1 data-[over=true]:ring-primary/20"
      data-over={isOver}
      ref={setNodeRef}
    >
      <div className="mb-2 flex items-center gap-2">
        <Badge className="text-muted-foreground" variant="outline">
          {status.name}
        </Badge>
        <span className="text-muted-foreground text-sm">
          {issues.length} issue(s)
        </span>
      </div>
      <div className="flex min-h-[80px] flex-col gap-2">
        {issues.map((issue, index) => (
          <KanbanCard
            index={index}
            issue={issue}
            key={issue.id}
            projectId={projectId}
            slug={slug}
            statusId={status.id}
          />
        ))}
      </div>
    </div>
  );
}

function CardOverlayContent({ issue }: { issue: IssueView }) {
  return (
    <div className="flex cursor-grab items-start gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-xl ring-2 ring-primary/20">
      <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
        <IconGripVertical className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-medium">{issue.title}</span>
        <div className="mt-1 text-muted-foreground text-xs">
          {formatDate(issue.createdAt)}
        </div>
      </div>
    </div>
  );
}

export function IssuesKanban({
  fallbackData,
  projectId,
  slug,
  statuses,
}: IssuesKanbanProps) {
  const sortableId = useId();
  const [activeId, setActiveId] = useState<number | null>(null);
  const url = `/api/projects/${projectId}/issues`;
  const { data, isLoading, mutate } = useSWR<IssueView[]>(url, fetchIssues, {
    fallbackData,
    refreshInterval: 30_000,
  });
  const issues = data ?? EMPTY_ISSUES;
  const statusList = statuses ?? EMPTY_STATUSES;

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const issuesByStatus = useMemo(() => {
    const map = new Map<number, IssueView[]>();
    for (const status of statusList) {
      map.set(status.id, []);
    }
    for (const issue of issues) {
      const list = map.get(issue.statusId);
      if (list) {
        list.push(issue);
      } else {
        map.set(issue.statusId, [issue]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.priority - b.priority);
    }
    return map;
  }, [issues, statusList]);

  const handleReorder = useCallback(
    async (
      sourceStatusId: number,
      issueIds: number[],
      optimistic: IssueView[]
    ) => {
      mutate(optimistic, false);
      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusId: sourceStatusId, issueIds }),
        });
        if (!res.ok) {
          throw new Error("Failed to reorder");
        }
        await mutate();
      } catch {
        mutate(issues, false);
      }
    },
    [issues, url, mutate]
  );

  const handleMove = useCallback(
    async (
      activeId: number,
      targetStatusId: number,
      targetIndex: number,
      optimistic: IssueView[]
    ) => {
      mutate(optimistic, false);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/issues/${activeId}/move`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetStatusId, targetIndex }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to move");
        }
        await mutate();
      } catch {
        mutate(issues, false);
      }
    },
    [issues, projectId, mutate]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!(active?.id && over?.id) || active.id === over.id) {
        return;
      }

      const activeId = Number(active.id);
      const overId = String(over.id);
      const sourceStatusId = (active.data.current as { statusId?: number })
        ?.statusId;
      if (sourceStatusId == null) {
        return;
      }

      const target = getTargetFromOverId(overId, issuesByStatus);
      if (!target) {
        return;
      }

      const { statusId: targetStatusId, index: targetIndex } = target;

      if (sourceStatusId === targetStatusId) {
        const sourceIssues = issuesByStatus.get(sourceStatusId) ?? [];
        const oldIndex = sourceIssues.findIndex((i) => i.id === activeId);
        if (oldIndex < 0 || oldIndex === targetIndex) {
          return;
        }
        const reordered = [...sourceIssues];
        const [removed] = reordered.splice(oldIndex, 1);
        reordered.splice(targetIndex, 0, removed);
        const issueIds = reordered.map((i) => i.id);
        const optimistic = issues.map((i) => {
          if (i.statusId !== sourceStatusId) {
            return i;
          }
          const newIdx = reordered.findIndex((r) => r.id === i.id);
          return newIdx < 0 ? i : { ...i, priority: newIdx };
        });
        await handleReorder(sourceStatusId, issueIds, optimistic);
        return;
      }

      const optimistic = issues.map((i) =>
        i.id !== activeId ? i : { ...i, statusId: targetStatusId }
      );
      await handleMove(activeId, targetStatusId, targetIndex, optimistic);
    },
    [issues, issuesByStatus, handleReorder, handleMove]
  );

  const activeIssue = useMemo(
    () => (activeId != null ? issues.find((i) => i.id === activeId) : null),
    [activeId, issues]
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <DndContext
        collisionDetection={closestCenter}
        id={sortableId}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusList.map((status) => {
            const columnId = `${COLUMN_PREFIX}${status.id}`;
            const issuesInColumn = issuesByStatus.get(status.id) ?? [];
            return (
              <DroppableColumn
                columnId={columnId}
                issues={issuesInColumn}
                key={status.id}
                projectId={projectId}
                slug={slug}
                status={status}
              />
            );
          })}
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeIssue ? <CardOverlayContent issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>
      {isLoading && issues.length === 0 && (
        <p className="text-center text-muted-foreground">Loading issues...</p>
      )}
      {!isLoading && issues.length === 0 && (
        <p className="text-center text-muted-foreground">No issues found.</p>
      )}
    </div>
  );
}

function DroppableColumn({
  columnId,
  status,
  issues,
  slug,
  projectId,
}: {
  columnId: string;
  status: ProjectStatusView;
  issues: IssueView[];
  slug: string;
  projectId: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
    data: { type: "column" as const, statusId: status.id },
  });
  return (
    <KanbanColumn
      isOver={isOver}
      issues={issues}
      projectId={projectId}
      setNodeRef={setNodeRef}
      slug={slug}
      status={status}
    />
  );
}
