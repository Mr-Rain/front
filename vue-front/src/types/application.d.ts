// src/types/application.d.ts
import type { JobInfo } from './job';
import type { StudentProfile } from './student';
import type { ResumeInfo } from './resume';

/**
 * 申请状态
 */
type ApplicationStatus =
  | 'pending' // 待处理 (企业未查看)
  | 'viewed' // 已查看
  | 'interview' // 邀请面试
  | 'offer' // 发放 Offer
  | 'rejected' // 不合适
  | 'withdrawn'; // 学生撤回

/**
 * 职位申请信息接口
 */
export interface ApplicationInfo {
  id: string | number;
  job_id: string | number;
  student_id: string | number;
  resume_id: string | number; // 使用的简历ID
  status: ApplicationStatus;
  apply_time: string; // 申请时间 (ISO 8601)
  update_time?: string; // 状态更新时间 (ISO 8601)
  feedback?: string; // 企业反馈/面试安排等 (可选, Markdown)

  // --- 冗余信息，方便前端展示 ---
  job_info?: Pick<JobInfo, 'id' | 'title' | 'company_name' | 'location' | 'salary_range'>; // 职位简要信息
  student_info?: Pick<StudentProfile, 'id' | 'name' | 'school' | 'major'>; // 学生简要信息 (企业端)
  resume_snapshot?: Partial<ResumeInfo>; // 申请时简历快照 (可选)
}

/**
 * (学生端) 申请职位荷载
 */
export interface ApplyJobPayload {
  job_id: string | number;
  resume_id: string | number; // 选择的简历ID
}

/**
 * (企业端) 更新申请状态荷载
 */
export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  feedback?: string;
} 