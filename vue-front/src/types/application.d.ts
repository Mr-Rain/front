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
  | 'accepted' // 录用
  | 'rejected' // 不合适
  | 'withdrawn'; // 学生撤回

/**
 * 职位申请信息接口
 */
export interface ApplicationInfo {
  id: string | number;
  jobId: string | number;
  studentId: string | number;
  resumeId: string | number; // 使用的简历ID
  status: ApplicationStatus;
  applyTime: string; // 申请时间 (ISO 8601)
  updateTime?: string; // 状态更新时间 (ISO 8601)
  feedback?: string; // 企业反馈/面试安排等 (可选, Markdown)
  rating?: number; // 候选人评分 (1-5)

  // 面试相关信息
  interviewTime?: string; // 面试时间 (ISO 8601)
  interviewLocation?: string; // 面试地点
  interviewType?: 'onsite' | 'video' | 'phone'; // 面试方式
  interviewContact?: string; // 面试联系人
  interviewContactInfo?: string; // 联系人信息
  interviewNotes?: string; // 面试说明

  // --- 冗余信息，方便前端展示 ---
  jobInfo?: Pick<JobInfo, 'id' | 'title' | 'companyName' | 'location' | 'salaryRange' | 'jobType'>; // 添加 jobType
  studentInfo?: Pick<StudentProfile, 'id' | 'realName' | 'school' | 'major'>; // 使用 realName
  resumeSnapshot?: Partial<ResumeInfo>; // 申请时简历快照 (可选)

  // 直接展示的字段，方便前端使用
  jobTitle?: string;
  companyName?: string;
  resumeTitle?: string;
  deletedResumeTitle?: string; // 已删除简历的标题
  studentName?: string; // 学生姓名
  studentSchool?: string; // 学生学校
  studentMajor?: string; // 学生专业
}

/**
 * (学生端) 申请职位荷载
 */
export interface ApplyJobPayload {
  jobId: string | number;
  resumeId: string | number; // 选择的简历ID
}

/**
 * (企业端) 更新申请状态荷载
 */
export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  feedback?: string;
  rating?: number; // 候选人评分 (1-5)

  // 面试相关信息
  interviewTime?: string;
  interviewType?: 'onsite' | 'video' | 'phone';
  interviewLocation?: string;
  interviewContact?: string;
  interviewContactInfo?: string;
  interviewNotes?: string; // 面试说明
}