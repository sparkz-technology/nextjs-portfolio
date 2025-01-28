export interface ISkill {
  id: string;
  userId: string;
  name: string;
  visibility: boolean;
  sequenceValue: number;
}

export interface IProject {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  visibility: boolean;
  active?: boolean;
  href?: string;
  sequenceValue: number;
  image?: string;
  technologies?: string[];
  video?: string;
  projectLinks: IProjectLink[];
}

export interface IProjectLink {
  id: string;
  type: string;
  href: string;
  icon: IIcon | null;
}

export interface IIcon {
  id: string;
  name: string;
  value: string;
}

export interface IWorkExperience {
  id: string;
  company: string;
  link: string;
  title: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  description: string;
  userId: string;
  visibility: boolean;
  sequenceValue: number;
}

export interface IEducation {
  id: string;
  school: string;
  link: string;
  degree: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  visibility: boolean;
  sequenceValue: number;
}

export interface IGuestSignature {
  id: string;
  message: string | null;
  signatureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  user: {
    username: string;
  } | null;
  _count: {
    likes: number;
  };
}

export interface IMessage {
  id: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  isRead: boolean;
}

export interface IAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  publicId: string;
  createdAt: Date;
}

export interface ISearchParams {
  page?: string;
  pageSize?: string;
}

export type ResponseType = {
  success: boolean;
  message: string;
  status: number;
};

export interface VisitData {
  date: Date;
  desktopVisits: number;
  mobileVisits: number;
  visitors: string[];
}
