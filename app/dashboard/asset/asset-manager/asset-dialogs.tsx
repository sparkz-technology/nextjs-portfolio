"use client";

import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Folder, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "../file-uploader";
import { FolderTree } from "../folder-tree";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import {
  createFolder,
  updateFolder,
  deleteFolder,
  deleteAsset,
  moveAssets,
  getAssetsPaginated,
  getFolders,
  updateAsset,
} from "../action";
import { AssetType, FolderType } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";

// Form validation schemas
const newFolderSchema = Yup.object({
  name: Yup.string()
    .required("Folder name is required")
    .max(100, "Folder name is too long")
    .matches(/^[^\\/:*?"<>|]+$/, "Folder name contains invalid characters"),
});

const renameSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .max(100, "Name is too long")
    .matches(/^[^\\/:*?"<>|]+$/, "Name contains invalid characters"),
});

export function AssetDialogs({ folders = [] }: { folders: FolderType[] }) {
  const {
    assets,
    // Dialog states
    isUploadOpen,
    isNewFolderOpen,
    isRenameOpen,
    isShareOpen,
    isDeleteOpen,
    isMoveOpen,

    // Item states
    previewAsset,
    shareAsset,
    renameItem,
    itemsToDelete,
    moveTargetFolder,

    // Loading states
    isCreatingFolder,
    isRenamingItem,
    isDeletingItems,
    isMovingAssets,

    // Data
    currentFolder,
    // folders,
    selectedAssets,

    // Actions
    closeUploadDialog,
    closeNewFolderDialog,
    closeRenameDialog,
    closeShareDialog,
    closeDeleteDialog,
    closeMoveDialog,
    closePreviewDialog,

    setFolders,
    setAssets,
    setCreatingFolder,
    setRenamingItem,
    setDeletingItems,
    setMovingAssets,
    setDownloadingAsset,
    setMoveTargetFolder,
    clearSelectedAssets,
  } = useAssetManagerStore();

  // Formik forms
  const newFolderFormik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: newFolderSchema,
    onSubmit: async (values, { resetForm }) => {
      setCreatingFolder(true);
      const result = await createFolder(values.name, currentFolder);

      if (result.success) {
        toast.success(`Folder "${values.name}" has been created`);

        // Refresh folders
        const foldersResult = await getFolders();
        if (foldersResult.success) {
          setFolders(foldersResult.folders || []);
        }

        resetForm();
        closeNewFolderDialog();
      } else {
        toast.error(result.error || "Failed to create folder");
      }
      setCreatingFolder(false);
    },
  });

  const renameFormik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: renameSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!renameItem) return;

      setRenamingItem(true);

      if (renameItem.type === "folder") {
        const result = await updateFolder(renameItem.id, values.name);

        if (result.success) {
          toast.success(`Folder has been renamed to "${values.name}"`);

          // Refresh folders
          const foldersResult = await getFolders();
          if (foldersResult.success) {
            setFolders(foldersResult.folders || []);
          }
        } else {
          toast.error(result.error || "Failed to rename folder");
        }
      } else {
        const result = await updateAsset(renameItem.id, { name: values.name });
        if (result.success) {
          toast.success(`File has been renamed to "${values.name}"`);
          const updateAsset = assets.map((a: AssetType) => {
            console.log(renameItem.id == a.id);
            if (a.id == renameItem.id) {
              return { ...result.asset };
            }
            return a;
          }) as AssetType[];
          setAssets(updateAsset);
        } else {
          toast.error(result.error || "Failed to rename file");
        }
      }

      setRenamingItem(false);
      resetForm();
      closeRenameDialog();
    },
  });

  const handleDelete = async () => {
    if (itemsToDelete.length === 0) return;

    setDeletingItems(true);

    // Process folders
    const folders = itemsToDelete.filter((item) => item.type === "folder");
    for (const folder of folders) {
      const result = await deleteFolder(folder.id);

      if (!result.success) {
        toast.error(result.error || `Failed to delete folder "${folder.name}"`);
      }
    }

    // Process files
    const files = itemsToDelete.filter((item) => item.type === "file");
    for (const file of files) {
      const result = await deleteAsset(file.id);

      if (!result.success) {
        toast.error(result.error || `Failed to delete file "${file.name}"`);
      } else {
        const updateAsset = assets.filter((a: AssetType) => a.id !== file.id) as AssetType[];
        setAssets(updateAsset);
      }
    }
    // Refresh data
    const foldersResult = await getFolders();
    if (foldersResult.success) {
      setFolders(foldersResult.folders || []);
    }

    toast.success(`${itemsToDelete.length} item(s) have been deleted`);

    setDeletingItems(false);
    closeDeleteDialog();
    clearSelectedAssets();
  };

  const handleMove = async () => {
    if (selectedAssets.length === 0) return;

    setMovingAssets(true);

    const result = await moveAssets(selectedAssets, moveTargetFolder);

    if (result.success) {
      toast.success(`${selectedAssets.length} file(s) have been moved`);

      // Refresh assets
      const assetsResult = await getAssetsPaginated({
        folderId: currentFolder,
        page: 1,
        limit: 20,
        sortBy: "name",
        sortDirection: "asc",
        filterBy: "all",
        search: "",
      });

      if (assetsResult.success && assetsResult.assets) {
        setAssets(assetsResult.assets);
      }
    } else {
      toast.error(result.error || "Failed to move files");
    }

    setMovingAssets(false);
    closeMoveDialog();
    clearSelectedAssets();
  };

  const handleShare = () => {
    if (!shareAsset) return;

    // Generate a random share link
    const shareLink = `https://example.com/share/${shareAsset.id}?token=${Math.random().toString(36).substring(2, 15)}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success("Share link has been copied to your clipboard");
    });

    closeShareDialog();
  };

  const handleDownloadAsset =async (asset: AssetType) => {
    // Set loading state for this specific asset
    setDownloadingAsset(asset.id, true);

    if (!asset?.publicId) {
      toast.error("No public ID found for the selected asset");
      return;
    }
    const url = asset.url;
    const name = asset.name;
    const blob = await fetch(url).then((response) => response.blob());
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    toast.success("Asset downloaded successfully");
    setDownloadingAsset(asset.id, false);
      setDownloadingAsset(asset.id, false);
      toast.success(`${asset.name} has been downloaded`);

  };

  useEffect(() => {
    if (renameItem) {
      renameFormik.setFieldValue("name", renameItem.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renameItem]);

  const handleUploadComplete = async () => {
    // Refresh assets
    const assetsResult = await getAssetsPaginated({
      folderId: currentFolder,
      page: 1,
      limit: 20,
      sortBy: "name",
      sortDirection: "asc",
      filterBy: "all",
      search: "",
    });

    if (assetsResult.success && assetsResult.assets) {
      setAssets(assetsResult.assets);
    }

    closeUploadDialog();
  };

  return (
    <>
      {/* File upload dialog */}
      <Dialog open={isUploadOpen} onOpenChange={closeUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>Upload files to the current folder</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FileUploader
              folderId={currentFolder}
              onUploadComplete={handleUploadComplete}
              multiple={true}
              maxSize={10}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeUploadDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New folder dialog */}
      <Dialog open={isNewFolderOpen} 
      key={`${isNewFolderOpen}`}
      onOpenChange={closeNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for the new folder</DialogDescription>
          </DialogHeader>

          <form onSubmit={newFolderFormik.handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  name="name"
                  placeholder="New Folder"
                  value={newFolderFormik.values.name}
                  onChange={newFolderFormik.handleChange}
                  onBlur={newFolderFormik.handleBlur}
                />
                {newFolderFormik.touched.name && newFolderFormik.errors.name && (
                  <p className="text-xs text-destructive">{newFolderFormik.errors.name}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={closeNewFolderDialog}
                disabled={isCreatingFolder}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isCreatingFolder}>
                {isCreatingFolder ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={isRenameOpen} onOpenChange={closeRenameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename {renameItem?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>
              Enter a new name for the {renameItem?.type === "folder" ? "folder" : "file"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={renameFormik.handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">New Name</Label>
                <Input
                  id="new-name"
                  name="name"
                  placeholder="Enter new name"
                  value={renameFormik.values.name}
                  onChange={renameFormik.handleChange}
                  onBlur={renameFormik.handleBlur}
                />
                {renameFormik.touched.name && renameFormik.errors.name && (
                  <p className="text-xs text-destructive">{renameFormik.errors.name}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" size="sm" type="button" onClick={closeRenameDialog} disabled={isRenamingItem}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isRenamingItem}>
                {isRenamingItem ? (
                  <>
                    <span className="mr-2">Renaming...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  "Rename"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={isShareOpen} onOpenChange={closeShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>Create a shareable link for &quot;{shareAsset?.name}&quot;</DialogDescription>
          </DialogHeader>

          {/* <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link Settings</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="anyone" defaultChecked />
                <label
                  htmlFor="anyone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Anyone with the link can view
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="expiry" />
                <label
                  htmlFor="expiry"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set expiration date
                </label>
              </div>
            </div>
          </div> */}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeShareDialog}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleShare}>
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {itemsToDelete.length > 1 ? "Items" : itemsToDelete[0]?.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription>
              {itemsToDelete.length > 1
                ? `Are you sure you want to delete ${itemsToDelete.length} items?`
                : `Are you sure you want to delete "${itemsToDelete[0]?.name}"?`}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {itemsToDelete.length > 1 && (
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
              <ul className="space-y-1">
                {itemsToDelete.map((item) => (
                  <li key={item.id} className="text-sm flex items-center gap-1.5">
                    {item.type === "folder" ? (
                      <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeDeleteDialog} disabled={isDeletingItems}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeletingItems}>
              {isDeletingItems ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move files dialog */}
      <Dialog open={isMoveOpen} onOpenChange={closeMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move Files</DialogTitle>
            <DialogDescription>Select a destination folder for {selectedAssets.length} file(s)</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 border-b bg-muted/50">
                <h4 className="text-sm font-medium">Destination Folder</h4>
              </div>
              <div className="max-h-[200px] overflow-y-auto p-2">
                <FolderTree
                  folders={folders}
                  currentFolder={currentFolder}
                  onFolderSelect={() => {}}
                  onRenameFolder={() => {}}
                  onDeleteFolder={() => {}}
                  moveMode={true}
                  onMoveSelect={setMoveTargetFolder}
                  selectedMoveFolder={moveTargetFolder}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeMoveDialog} disabled={isMovingAssets}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleMove} disabled={isMovingAssets}>
              {isMovingAssets ? (
                <>
                  <span className="mr-2">Moving...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                "Move Files"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File preview dialog */}
      <Dialog open={!!previewAsset} onOpenChange={(open) => !open && closePreviewDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>Information about the selected file</DialogDescription>
          </DialogHeader>

          {previewAsset && (
            <div className="space-y-4">
              <div className="flex justify-center">
                {previewAsset.type === "image" ? (
                  <div className="border rounded-md p-2 bg-muted/30">
                    <Image
                      width={200}
                      height={200}
                      src={previewAsset.url || "/placeholder.svg"}
                      alt={previewAsset.name}
                      className="max-h-[200px] object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] w-[200px] bg-muted/30 rounded-md border">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                  <div className="font-medium text-muted-foreground">Name:</div>
                  <div>{previewAsset.name}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                  <div className="font-medium text-muted-foreground">Type:</div>
                  <div>{previewAsset.type}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                  <div className="font-medium text-muted-foreground">Size:</div>
                  <div>{previewAsset.sizeFormatted}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                  <div className="font-medium text-muted-foreground">Modified:</div>
                  <div>{new Date(previewAsset.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => closePreviewDialog()}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleDownloadAsset(previewAsset);
                    closePreviewDialog();
                  }}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
