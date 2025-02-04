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

// function IconRenderer({ iconName }: IconRendererProps) {
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
import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

interface IconRendererProps {
  iconName: string;
}

type IconLibrary = {
  [key: string]: (icon: string) => Promise<ComponentType<{ size?: number }>>;
};

function IconRenderer({ iconName }: IconRendererProps) {
  const trimmedIconName = iconName.trim();
  const icon = trimmedIconName.charAt(0).toUpperCase() + trimmedIconName.slice(1);

  // Dynamically import only the specific icon needed from the library
  const Icons: IconLibrary = {
    ci: (icon) => import('react-icons/ci').then((mod) => mod[icon] as ComponentType<{ size?: number }>),
    fa: (icon) => import('react-icons/fa').then((mod) => mod[icon] as ComponentType<{ size?: number }>),
    io: (icon) => import('react-icons/io').then((mod) => mod[icon] as ComponentType<{ size?: number }>),
    io5: (icon) => import('react-icons/io5').then((mod) => mod[icon] as ComponentType<{ size?: number }>),
    md: (icon) => import('react-icons/md').then((mod) => mod[icon] as ComponentType<{ size?: number }>),
    ti: (icon) => import('react-icons/ti').then((mod) => mod[icon] as ComponentType<{ size?: number }>),
    // ...add other libraries as needed
  };

  const libraryPrefix = iconName.slice(0, 2).toLowerCase();
  const IconLibrary = Icons[libraryPrefix];

  if (!IconLibrary) {
    return <></>;
  }

  // Dynamically import the icon using the icon name
  const IconComponent = dynamic(() => IconLibrary(icon));

  return <IconComponent size={20} />;
}

export default IconRenderer;
