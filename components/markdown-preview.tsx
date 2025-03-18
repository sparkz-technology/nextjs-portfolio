"use client";
import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes"; // Assuming you're using next-themes

// Create and export the component
interface CustomMarkdownPreviewProps {
  [key: string]: any;
}

const CustomMarkdownPreview: React.FC<CustomMarkdownPreviewProps> = (props) => {
  const { theme } = useTheme();

  return React.createElement(MarkdownPreview, {
    ...props,
    wrapperElement: {
      "data-color-mode": theme === "light" || theme === "dark" ? theme : undefined,
    },
  });
};

export default CustomMarkdownPreview;
