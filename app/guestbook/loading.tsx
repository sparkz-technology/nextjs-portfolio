import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = () => {
  return (
    <Card className="rounded-lg flex flex-col justify-between space-y-3 h-32 col-span-12 sm:col-span-6">
      <Skeleton className="w-full h-24" />
    </Card>
  );
};

export default function Loading() {
  return (
    <div className="grid grid-cols-12 gap-5 mt-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
