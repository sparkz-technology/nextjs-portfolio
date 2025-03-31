"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Edit, Trash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderType {
  id: string;
  name: string;
  children: FolderType[];
}

interface FolderTreeProps {
  folders: FolderType[];
  currentFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onRenameFolder: (folder: { id: string; name: string }) => void;
  onDeleteFolder: (folder: { id: string; name: string }) => void;
  moveMode?: boolean;
  onMoveSelect?: (folderId: string | null) => void;
  selectedMoveFolder?: string | null;
  showAllFiles?: boolean;
}

export function FolderTree({
  folders,
  currentFolder,
  onFolderSelect,
  onRenameFolder,
  onDeleteFolder,
  moveMode = false,
  showAllFiles = false,
  onMoveSelect,
  selectedMoveFolder,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Function to find the path to a folder
  const findPathToFolder = (folderList: FolderType[], id: string, path: string[] = []): string[] | null => {
    for (const folder of folderList) {
      if (folder.id === id) {
        return path;
      }

      if (folder.children.length > 0) {
        const newPath = [...path, folder.id];
        const result = findPathToFolder(folder.children, id, newPath);
        if (result) return result;
      }
    }

    return null;
  };

  useEffect(() => {
    // Expand parent folders of the current folder
    if (currentFolder) {
      const path = findPathToFolder(folders, currentFolder);
      if (path) {
        const newExpanded = { ...expandedFolders };
        path.forEach((id) => {
          newExpanded[id] = true;
        });
        setExpandedFolders((prev: Record<string, boolean>): Record<string, boolean> => {
          path.forEach((id: string) => {
            prev[id] = true;
          });
          return { ...prev, ...prev };
        });
      }
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, folders]);

  const toggleFolder = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };
  

  const renderFolder = (folder: FolderType, level = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const isSelected = moveMode ? selectedMoveFolder === folder.id : currentFolder === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer hover:bg-muted group ${
            isSelected ? "bg-muted" : ""
          }`}
          style={{ paddingLeft: `${level * 10 + 6}px` }}
          onClick={() => (moveMode && onMoveSelect ? onMoveSelect(folder.id) : onFolderSelect(folder.id))}
        >
          {folder.children.length > 0 && (
            <ChevronRight
              className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
              onClick={(e) => toggleFolder(folder.id, e)}
            />
          )}
          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="text-xs truncate">{folder.name}</span>

          {moveMode && isSelected && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}

          {!moveMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-auto opacity-0 group-hover:opacity-100 hover:opacity-100"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder({ id: folder.id, name: folder.name });
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder({ id: folder.id, name: folder.name });
                  }}
                >
                  <Trash className="h-3.5 w-3.5 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isExpanded && folder.children.length > 0 && (
          <div>{folder.children.map((childFolder) => renderFolder(childFolder, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div>
    {
      showAllFiles && (
      <div
        className={`flex items-center gap-1 py-1 px-1 rounded-md cursor-pointer hover:bg-muted ${
          (moveMode ? selectedMoveFolder === null : currentFolder === null) ? "bg-muted" : ""
        }`}
        onClick={() => (moveMode && onMoveSelect ? onMoveSelect(null) : onFolderSelect(null))}
      >
        <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-xs font-medium">All Files</span>
        {moveMode && selectedMoveFolder === null && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
      </div> )}
      {folders.map((folder) => renderFolder(folder))}
    </div>
  );
}
