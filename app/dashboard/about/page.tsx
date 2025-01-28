import { IIcon } from "@/lib/type";
import { listIconsAction } from "../action";
import { listaboutAction } from "./action";
import { AdminDataManager } from "./admin-data-manager";

type IAbout = {
  name?: string | null;
  initials?: string | null;
  url?: string | null;
  location?: string | null;
  locationLink?: string | null;
  description?: string | null;
  summary?: string | null;
  avatarUrl?: string | null;
  Contact?: {
    email?: string | null;
    tel?: string | null;
    social?: {
      id?: string | null;
      name?: string | null;
      url?: string | null;
      icon?: {
        id?: string | null;
      };
    }[];
  };
} 
export default async function AdminDashboard() {
  const aboutData = await listaboutAction();
  const iconList = (await listIconsAction()) as IIcon[];

  if (!aboutData.success) {
    return <div>{aboutData.message}</div>;
  }
console.log(aboutData)
  return (
    <div className="p-4 space-y-4">
      <AdminDataManager initialData={aboutData.about as IAbout} iconList={iconList} />
    </div>
  );
}
