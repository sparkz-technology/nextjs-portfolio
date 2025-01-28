import { listVisitLogAction } from "./action";
import { VisitorChart } from "./visitor-chart";

import { VisitLogFilterType } from "./action";

interface DashboardPageProps {
  searchParams: Promise<{ dateRange: VisitLogFilterType }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { dateRange } = (await searchParams) || {};
  const { visitLog, totalDesktopVisits, totalMobileVisits } = await listVisitLogAction(dateRange ?? ("1y" as VisitLogFilterType));

  return (
    <VisitorChart chartData={visitLog} totalDesktopVisits={totalDesktopVisits} totalMobileVisits={totalMobileVisits} />
  );
}
