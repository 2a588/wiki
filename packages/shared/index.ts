export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Space {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: number;
  spaceId: number;
  parentId: number | null;
  title: string;
  slug: string;
  icon: string | null;
  position: number;
  createdBy: number;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageVersion {
  id: number;
  pageId: number;
  content: string;
  version: number;
  createdBy: number;
  createdAt: string;
}

export interface Attachment {
  id: number;
  pageId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdBy: number;
  createdAt: string;
}

export interface PageTreeNode extends Page {
  children: PageTreeNode[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface CreateSpaceRequest {
  key: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CreatePageRequest {
  spaceId: number;
  parentId?: number | null;
  title: string;
  icon?: string;
  content?: string;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
  icon?: string;
  parentId?: number | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
