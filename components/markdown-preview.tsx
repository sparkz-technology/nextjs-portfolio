"use client";
import React from "react";
import MarkdownPreview, { MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";

const CustomMarkdownPreview: React.FC<MarkdownPreviewProps> = (props) => {
  const { theme } = useTheme();

  return React.createElement(MarkdownPreview, {
    ...props,
    wrapperElement: {
      "data-color-mode": theme === "light" || theme === "dark" ? theme : "light",
    },
  });
};

export default CustomMarkdownPreview;
