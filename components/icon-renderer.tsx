// "use server"
// import * as FaIcons from "react-icons/fa";
// import * as AiIcons from "react-icons/ai";
// import * as IoIcons from "react-icons/io";
// import * as MdIcons from "react-icons/md";

// import { Icons } from "./icons";

// type IconLibrary = typeof FaIcons | typeof AiIcons | typeof IoIcons | typeof MdIcons;

// const iconLibraryMap: Record<string, IconLibrary> = {
//   fa: FaIcons,
//   ai: AiIcons,
//   io: IoIcons,
//   md: MdIcons,
// };

// interface IconRendererProps {
//   iconName: string;
// }

// function IconRenderer(props: IconRendererProps) {
//   if (props){
//   return null
//   }
//   const { iconName="" } = props
//   const libraryPrefix = iconName.slice(0, 2).toLowerCase() as keyof typeof iconLibraryMap;
//   const iconLibrary = iconLibraryMap[libraryPrefix];

//   if (!iconLibrary) {
//     return <Icons.globe />;
//   }

//   const trimmedIconName = iconName.trim();

//   // Ensure the IconComponent type is a React component
//   const IconComponent = iconLibrary[trimmedIconName as keyof IconLibrary] as React.ComponentType<{ size?: number }> | undefined;

//   if (!IconComponent) {
//     return <Icons.globe />;
//   }

//   return <IconComponent size={20} />;
// }

// export default IconRenderer;
import React from "react";
import { IconType } from "react-icons";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { MdMailOutline, MdLink } from "react-icons/md";

// Define a record of available icons
const icons: Record<string, IconType> = {
  FaLinkedin,
  FaGithub,
  MdMailOutline,
  MdLink,
};

interface IconRendererProps {
  iconName?: string; // Optional to avoid undefined errors
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconName = "" }) => {
  const trimmedIconName = iconName.trim();
  const IconComponent = icons[trimmedIconName] || MdLink; // Default to MdLink if not found

  return (
    <IconComponent size={20} />
       )
};

export default IconRenderer;
