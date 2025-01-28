import { notFound } from "next/navigation";

import { DeleteDialog, ExpreienceDialog } from "@/app/dashboard/experience/work-experience-dialog";
import WorkExprienceTable from "@/app/dashboard/experience/work-experience-table";
import { ISearchParams } from "@/lib/type";
import { listWorkExprienceAction } from "@/app/dashboard/experience/action";

interface WorkExperiencePageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function WorkExperiencePage({ searchParams }: WorkExperiencePageProps) {
  const { page, pageSize } = (await searchParams) || {};

  const currentPage = parseInt(page || "1", 10);
  const expriencePageSize = parseInt(pageSize || "5", 10);
  const { workExperience, totalCount } = await listWorkExprienceAction({
    pageNo: currentPage,
    pageSize: expriencePageSize,
  });

  if (!workExperience) {
    return notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Work Expreience</h1>
        <ExpreienceDialog />
      </div>
      <DeleteDialog />
      <WorkExprienceTable
        data={workExperience}
        totalCount={totalCount}
        currentPage={currentPage}
        expriencePageSize={expriencePageSize}
      />
    </div>
  );
}
