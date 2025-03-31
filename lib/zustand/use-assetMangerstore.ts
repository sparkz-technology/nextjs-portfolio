import { create } from "zustand"
import type { FolderType, AssetType, SortOption, SortDirection, FilterOption } from "@/lib/types"

interface AssetManagerState {
  // Data
  folders: FolderType[]
  assets: AssetType[]

  // Pagination
  page: number
  hasMore: boolean
  isLoadingMore: boolean
  totalAssets: number

  // UI state
  currentFolder: string | null
  viewMode: "grid" | "list"
  selectedAssets: string[]
  sortBy: SortOption
  sortDirection: SortDirection
  filterBy: FilterOption
  searchQuery: string

  // Dialog states
  isUploadOpen: boolean
  isNewFolderOpen: boolean
  isRenameOpen: boolean
  isShareOpen: boolean
  isDeleteOpen: boolean
  isMoveOpen: boolean
  isPreviewOpen: boolean

  // Item states
  previewAsset: AssetType | null
  shareAsset: AssetType | null
  renameItem: { id: string; name: string; type: "file" | "folder" } | null
  itemsToDelete: { id: string; name: string; type: "file" | "folder" }[]
  moveTargetFolder: string | null

  // Loading states
  isLoadingFolders: boolean
  isLoadingAssets: boolean
  isCreatingFolder: boolean
  isRenamingItem: boolean
  isDeletingItems: boolean
  isMovingAssets: boolean
  isTogglingFavorite: Record<string, boolean>
  isDownloadingAsset: Record<string, boolean>
  isDownloadingSelected: boolean
  isSearching: boolean

  // Actions
  setFolders: (folders: FolderType[]) => void
  setAssets: (assets: AssetType[]) => void
  appendAssets: (assets: AssetType[]) => void
  resetAssets: () => void
  setCurrentFolder: (folderId: string | null) => void
  setViewMode: (mode: "grid" | "list") => void
  setSelectedAssets: (assetIds: string[]) => void
  addSelectedAsset: (assetId: string) => void
  removeSelectedAsset: (assetId: string) => void
  toggleSelectedAsset: (assetId: string) => void
  clearSelectedAssets: () => void
  setSortBy: (sortBy: SortOption) => void
  setSortDirection: (direction: SortDirection) => void
  toggleSortDirection: () => void
  setFilterBy: (filter: FilterOption) => void
  setSearchQuery: (query: string) => void

  // Pagination actions
  setPage: (page: number) => void
  incrementPage: () => void
  setHasMore: (hasMore: boolean) => void
  setTotalAssets: (total: number) => void
  setLoadingMore: (isLoading: boolean) => void

  // Dialog actions
  openUploadDialog: () => void
  closeUploadDialog: () => void
  openNewFolderDialog: () => void
  closeNewFolderDialog: () => void
  openRenameDialog: (item: { id: string; name: string; type: "file" | "folder" }) => void
  closeRenameDialog: () => void
  openShareDialog: (asset: AssetType) => void
  closeShareDialog: () => void
  openDeleteDialog: (items: { id: string; name: string; type: "file" | "folder" }[]) => void
  closeDeleteDialog: () => void
  openMoveDialog: () => void
  closeMoveDialog: () => void
  openPreviewDialog: (asset: AssetType) => void
  closePreviewDialog: () => void

  // Loading state actions
  setLoadingFolders: (isLoading: boolean) => void
  setLoadingAssets: (isLoading: boolean) => void
  setCreatingFolder: (isCreating: boolean) => void
  setRenamingItem: (isRenaming: boolean) => void
  setDeletingItems: (isDeleting: boolean) => void
  setMovingAssets: (isMoving: boolean) => void
  setTogglingFavorite: (assetId: string, isToggling: boolean) => void
  setDownloadingAsset: (assetId: string, isDownloading: boolean) => void
  setDownloadingSelected: (isDownloading: boolean) => void
  setSearching: (isSearching: boolean) => void

  // Move target
  setMoveTargetFolder: (folderId: string | null) => void
}

export const useAssetManagerStore = create<AssetManagerState>((set) => ({
  // Data
  folders: [],
  assets: [],

  // Pagination
  page: 1,
  hasMore: false,
  isLoadingMore: false,
  totalAssets: 0,

  // UI state
  currentFolder: null,
  viewMode: "grid",
  selectedAssets: [],
  sortBy: "name",
  sortDirection: "asc",
  filterBy: "all",
  searchQuery: "",

  // Dialog states
  isUploadOpen: false,
  isNewFolderOpen: false,
  isRenameOpen: false,
  isShareOpen: false,
  isDeleteOpen: false,
  isMoveOpen: false,
  isPreviewOpen: false,

  // Item states
  previewAsset: null,
  shareAsset: null,
  renameItem: null,
  itemsToDelete: [],
  moveTargetFolder: null,

  // Loading states
  isLoadingFolders: false,
  isLoadingAssets: false,
  isCreatingFolder: false,
  isRenamingItem: false,
  isDeletingItems: false,
  isMovingAssets: false,
  isTogglingFavorite: {},
  isDownloadingAsset: {},
  isDownloadingSelected: false,
  isSearching: false,

  setFolders: (folders) => set({ folders }),
  setAssets: (assets) => set({ assets }),
  appendAssets: (newAssets) =>
    set((state) => ({
      assets: [...state.assets, ...newAssets],
    })),
  resetAssets: () => set({ assets: [], page: 1, hasMore: false }),
  setCurrentFolder: (currentFolder) =>
    set((state) => {
      if (state.currentFolder !== currentFolder) {
        return {
          currentFolder,
          selectedAssets: [],
          page: 1,
          assets: [],
        };
      }
      return state;
    }),
  
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedAssets: (selectedAssets) => set({ selectedAssets }),
  addSelectedAsset: (assetId) =>
    set((state) => ({
      selectedAssets: [...state.selectedAssets, assetId],
    })),
  removeSelectedAsset: (assetId) =>
    set((state) => ({
      selectedAssets: state.selectedAssets.filter((id) => id !== assetId),
    })),
  toggleSelectedAsset: (assetId) =>
    set((state) => {
      if (state.selectedAssets.includes(assetId)) {
        return { selectedAssets: state.selectedAssets.filter((id) => id !== assetId) }
      } else {
        return { selectedAssets: [...state.selectedAssets, assetId] }
      }
    }),
  clearSelectedAssets: () => set({ selectedAssets: [] }),
  setSortBy: (sortBy) => set({ sortBy, page: 1, assets: [] }),
  setSortDirection: (sortDirection) => set({ sortDirection, page: 1, assets: [] }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
      page: 1,
      assets: [],
    })),
  setFilterBy: (filterBy) => set({ filterBy, page: 1, assets: [] }),
  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1, assets: [] }),

  // Pagination actions
  setPage: (page) => set({ page }),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  setHasMore: (hasMore) => set({ hasMore }),
  setTotalAssets: (totalAssets) => set({ totalAssets }),
  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

  // Dialog actions
  openUploadDialog: () => set({ isUploadOpen: true }),
  closeUploadDialog: () => set({ isUploadOpen: false }),
  openNewFolderDialog: () => set({ isNewFolderOpen: true }),
  closeNewFolderDialog: () => set({ isNewFolderOpen: false }),
  openRenameDialog: (renameItem) => set({ isRenameOpen: true, renameItem }),
  closeRenameDialog: () => set({ isRenameOpen: false, renameItem: null }),
  openShareDialog: (shareAsset) => set({ isShareOpen: true, shareAsset }),
  closeShareDialog: () => set({ isShareOpen: false, shareAsset: null }),
  openDeleteDialog: (itemsToDelete) => set({ isDeleteOpen: true, itemsToDelete }),
  closeDeleteDialog: () => set({ isDeleteOpen: false, itemsToDelete: [] }),
  openMoveDialog: () => set({ isMoveOpen: true }),
  closeMoveDialog: () => set({ isMoveOpen: false, moveTargetFolder: null }),
  openPreviewDialog: (previewAsset) => set({ isPreviewOpen: true, previewAsset }),
  closePreviewDialog: () => set({ isPreviewOpen: false, previewAsset: null }),

  // Loading state actions
  setLoadingFolders: (isLoadingFolders) => set({ isLoadingFolders }),
  setLoadingAssets: (isLoadingAssets) => set({ isLoadingAssets }),
  setCreatingFolder: (isCreatingFolder) => set({ isCreatingFolder }),
  setRenamingItem: (isRenamingItem) => set({ isRenamingItem }),
  setDeletingItems: (isDeletingItems) => set({ isDeletingItems }),
  setMovingAssets: (isMovingAssets) => set({ isMovingAssets }),
  setTogglingFavorite: (assetId, isToggling) =>
    set((state) => ({
      isTogglingFavorite: {
        ...state.isTogglingFavorite,
        [assetId]: isToggling,
      },
    })),
  setDownloadingAsset: (assetId, isDownloading) =>
    set((state) => ({
      isDownloadingAsset: {
        ...state.isDownloadingAsset,
        [assetId]: isDownloading,
      },
    })),
  setDownloadingSelected: (isDownloadingSelected) => set({ isDownloadingSelected }),
  setSearching: (isSearching) => set({ isSearching }),

  // Move target
  setMoveTargetFolder: (moveTargetFolder) => set({ moveTargetFolder }),
}))

