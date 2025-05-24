export interface SystemAnnouncementDTO {
  id: number;
  title: string;
  content: string;
  publisherId?: number;
  publisherName?: string;
  publishTime?: string; // ISO 8601 date string
  createTime: string; // ISO 8601 date string
  updateTime: string; // ISO 8601 date string
  level: 'normal' | 'important' | 'urgent' | string; // 允许string以便扩展
  status: 'draft' | 'published' | 'revoked' | string; // 允许string以便扩展
  targetUserType?: 'all' | 'student' | 'company' | string | null; // 允许string以便扩展
}

export interface CreateSystemAnnouncementRequest {
  title: string;
  content: string;
  level?: 'normal' | 'important' | 'urgent' | string;
  status?: 'draft' | 'published' | 'revoked' | string;
  targetUserType?: 'all' | 'student' | 'company' | string | null;
}

export interface UpdateSystemAnnouncementRequest {
  title?: string;
  content?: string;
  level?: 'normal' | 'important' | 'urgent' | string;
  status?: 'draft' | 'published' | 'revoked' | string;
  targetUserType?: 'all' | 'student' | 'company' | string | null;
}

export interface SystemAnnouncementQueryRequest {
  keyword?: string;
  status?: string;
  level?: string;
  targetUserType?: string;
  sortField?: 'publishTime' | 'createTime' | string;
  sortOrder?: 'asc' | 'desc' | string;
  pageNum?: number;
  pageSize?: number;
} 