import { notFound } from "next/navigation";
import { DeleteDialog, SkillDialog } from "@/app/dashboard/skill/skill-dialog";
import SkillTable from "@/app/dashboard/skill/skill-table";
import { ISearchParams } from "@/lib/types";
import { listSkillsAction } from "@/app/dashboard/skill/action";

interface SkillPageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function SkillPage({ searchParams }: SkillPageProps) {
  const { page, pageSize } = (await searchParams) || {};

  const currentPage = parseInt(page || "1", 10);
  const skillPageSize = parseInt(pageSize || "5", 10);
  const { skills, totalCount } = await listSkillsAction({ pageNo: currentPage, pageSize: skillPageSize });

  if (!skills) {
    return notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Skills</h1>
        <SkillDialog />
      </div>
      <DeleteDialog />
      <SkillTable data={skills} totalCount={totalCount} currentPage={currentPage} skillPageSize={skillPageSize} />
    </div>
  );
}
