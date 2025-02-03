import { Dock, DockIcon } from "@/components/motion/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import IconRenderer from "./icon-renderer";

const getNavbar = async () => {
  return await prisma.socialLink.findMany({
    where: {
      navbar: true,
    },
    include: {
      icon: true,
    },
  });
};

export default async function Navbar() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const socialLinks = await getNavbar() ?? [];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex origin-bottom h-full max-h-14">
      <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
        {DATA.navbar
          .filter((filterItem) => !("superAdminOnly" in filterItem) || !filterItem.superAdminOnly || isSuperAdmin)
          .map((item) => (
            <DockIcon key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12")} aria-label={item.label}>
                    <item.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        <Separator orientation="vertical" className="h-full" />
        {socialLinks.map((social) => (
          <DockIcon key={social?.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={social.url} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12")} aria-label={social.name}>
                  <IconRenderer iconName={social.icon.value as string} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{social.name}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}
        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  );
}
