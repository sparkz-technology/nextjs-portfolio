import { Icons } from "@/components/icons";
import { HomeIcon, LayoutDashboardIcon, LibraryBig } from "lucide-react";

export const DATA = {
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/guestbook", icon: LibraryBig, label: "Book" },
    { href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard", superAdminOnly: true },
  ],
  contact: {
    email: "sutharsansparkz@gmail.com",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/sparkz-technology",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/sutharsang",
        icon: Icons.linkedin,

        navbar: true,
      },
      Email: {
        name: "Send Email",
        url: "mailto:sutharsansparkz@gmail.com",
        icon: Icons.email,
        navbar: true,
      },
    },
  },

} as const;
