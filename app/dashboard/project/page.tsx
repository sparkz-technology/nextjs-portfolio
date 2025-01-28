import * as React from "react";
import { DeleteDialog, ProjectDialog } from "./project-dialog";
import ProjectTable from "./project-table";
import { listIconsAction, listProjectsAction } from "./action";
import { IIcon, ISearchParams } from "@/lib/type";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function ProjectPage({ searchParams }: ProjectPageProps) {
  const { page, pageSize } = (await searchParams) || {};

  const currentPage = parseInt(page || "1", 10);
  const projectPageSize = parseInt(pageSize || "5", 10);
  const { project, totalCount } = await listProjectsAction({
    pageNo: currentPage,
    pageSize: projectPageSize,
  });

  const iconList = await listIconsAction() as IIcon[];

  if (!project) {
    return notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Projects</h1>
        <ProjectDialog iconList={iconList} />
      </div>
      <DeleteDialog />
      <ProjectTable
        currentPage={currentPage}
        data={project}
        projectPageSize={projectPageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
