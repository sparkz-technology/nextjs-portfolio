import { create } from "zustand";
import { IAsset, IEducation, IGuestSignature, IProject, ISkill, IWorkExperience  } from "../type";
import { BlogWithLikeStatus } from "@/app/blog/action";

interface IDialogState<T> {
  type: string;
  data: T | null;
  openDialog: (type: string) => void;
  openDialogWithData: (payload: { type: string; data: T | null }) => void;
  closeDialog: () => void;
}

export const createDialogStore = <T>() =>
  create<IDialogState<T>>((set) => ({
    type: "", 
    data: null, 
    openDialog: (type) => set(() => ({ type })), 
    closeDialog: () => set(() => ({ type: "", data: null })), 
    openDialogWithData: ({ type, data }) => set(() => ({ type, data })), 
  }));

export const useSkillDialog = createDialogStore<ISkill>();
export const useWorkExperienceDialog = createDialogStore<IWorkExperience>();
export const useEducationDialog = createDialogStore<IEducation>();  
export const useGuestSignatureDialog = createDialogStore<IGuestSignature>();
export const useAssetDialog = createDialogStore<IAsset>();
export const useProjectDialog = createDialogStore<IProject>();
export const useBlogDialog = createDialogStore<BlogWithLikeStatus>();