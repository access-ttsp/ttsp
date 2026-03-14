"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { CreateProjectBody } from "./model";
import { ProjectsService } from "./service";

export async function createProject(
  teamSlug: string,
  data: CreateProjectBody
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  await ProjectsService.createProject(session.user.id, teamSlug, data);
  redirect(`/${teamSlug}`);
}
