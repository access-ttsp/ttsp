import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IssuesTable } from "@/components/issues-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { ProjectsService } from "@/modules/projects/service";

export default async function IssuesListPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }

  const { slug, id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await ProjectsService.getProjectById(
    session.user.id,
    projectId
  );
  if (!project) {
    notFound();
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${slug}/projects/new`}>
                  Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${slug}/projects/${id}`}>
                  {project.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Issues</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-row items-center justify-between gap-4">
          <h1 className="font-semibold text-2xl">Issues</h1>
          <Button asChild size="sm">
            <Link href={`/${slug}/projects/${id}/issues/new`}>New issue</Link>
          </Button>
        </div>
        <IssuesTable projectId={id} slug={slug} />
      </div>
    </>
  );
}
