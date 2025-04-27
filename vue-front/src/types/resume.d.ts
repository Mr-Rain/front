// src/types/resume.d.ts
import type { StudentProfile } from './student'; // 基础信息可以复用部分学生信息

/**
 * 教育经历
 */
export interface EducationExperience {
  id?: string | number; // 可选，用于更新
  school: string;
  major: string;
  degree: string; // 学位 (例如: 学士, 硕士)
  startDate: string; // YYYY-MM (驼峰)
  endDate: string; // YYYY-MM 或 '至今' (驼峰)
  description?: string; // 在校经历描述
}

/**
 * 工作/实习经历
 */
export interface WorkExperience {
  id?: string | number;
  companyName: string; // (驼峰)
  position: string; // 职位
  startDate: string; // YYYY-MM (驼峰)
  endDate: string; // YYYY-MM 或 '至今' (驼峰)
  description: string; // 工作内容描述 (Markdown格式)
}

/**
 * 项目经历
 */
export interface ProjectExperience {
  id?: string | number;
  projectName: string; // (驼峰)
  role: string; // 担任角色
  startDate: string; // YYYY-MM (驼峰)
  endDate: string; // YYYY-MM 或 '至今' (驼峰)
  description: string; // 项目描述 (Markdown格式)
  projectLink?: string; // 项目链接 (可选, 驼峰)
}

/**
 * 简历信息接口
 */
export interface ResumeInfo {
  id: string | number;
  studentId?: string | number; // 关联的学生ID (驼峰命名)
  title: string; // 简历标题 (例如: 张三-前端开发工程师简历)
  type?: 'file' | 'online'; // 新增: 简历类型，区分附件还是在线创建
  isDefault?: boolean; // 是否为默认简历 (驼峰命名)
  // 基本信息 (可以从 StudentProfile 同步或独立维护)
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  // --- 学生信息 (从后端 DTO 获取) ---
  studentName?: string; // 驼峰命名
  studentSchool?: string; // 驼峰命名
  studentMajor?: string; // 驼峰命名
  // --- 简历核心内容 ---
  bio?: string; // 新增: 个人简介
  skills?: string[]; // 新增: 技能标签数组
  educationList?: EducationExperience[]; // 教育经历 (驼峰命名)
  workList?: WorkExperience[]; // 工作经历 (驼峰命名)
  projectList?: ProjectExperience[]; // 项目经历 (驼峰命名)
  skillsDescription?: string; // 技能描述 (驼峰命名)
  selfEvaluation?: string; // 自我评价 (驼峰命名)
  expectedSalary?: string; // 新增: 期望薪资 (驼峰)
  expectedLocation?: string; // 新增: 期望地点 (驼峰)
  // --- 文件信息 (如果支持上传附件) ---
  fileUrl?: string; // 附件简历 URL (驼峰命名)
  fileName?: string; // 附件简历文件名 (驼峰命名)
  uploadTime?: string; // 上传时间 (驼峰命名)
  // --- 时间戳 ---
  createTime?: string; // 驼峰命名
  updateTime?: string; // 驼峰命名
}

/**
 * 创建简历请求参数类型
 */
export interface CreateResumePayload {
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  // 下划线命名
  education_experiences?: EducationExperience[];
  work_experiences?: WorkExperience[];
  project_experiences?: ProjectExperience[];
  skills_description?: string;
  self_evaluation?: string;
  // 驼峰命名
  educationExperiences?: EducationExperience[];
  workExperiences?: WorkExperience[];
  projectExperiences?: ProjectExperience[];
  skillsDescription?: string;
  selfEvaluation?: string;
}