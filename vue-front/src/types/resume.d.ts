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
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM 或 '至今'
  description?: string; // 在校经历描述
}

/**
 * 工作/实习经历
 */
export interface WorkExperience {
  id?: string | number;
  companyName: string;
  position: string; // 职位
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM 或 '至今'
  description: string; // 工作内容描述 (Markdown格式)
}

/**
 * 项目经历
 */
export interface ProjectExperience {
  id?: string | number;
  projectName: string;
  role: string; // 担任角色
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM 或 '至今'
  description: string; // 项目描述 (Markdown格式)
  projectLink?: string; // 项目链接 (可选)
}

/**
 * 简历信息接口
 * 统一使用驼峰命名法
 */
export interface ResumeInfo {
  id: string | number;
  studentId?: string | number; // 关联的学生ID
  title: string; // 简历标题 (例如: 张三-前端开发工程师简历)
  type?: 'file' | 'online'; // 新增: 简历类型，区分附件还是在线创建
  isDefault?: boolean; // 是否为默认简历
  // 基本信息 (可以从 StudentProfile 同步或独立维护)
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  // --- 学生信息 (从后端 DTO 获取) ---
  studentName?: string;
  studentSchool?: string;
  studentMajor?: string;
  // --- 简历核心内容 ---
  bio?: string; // 新增: 个人简介
  skills?: string[]; // 新增: 技能标签数组
  educationList?: EducationExperience[]; // 教育经历
  workList?: WorkExperience[]; // 工作经历
  projectList?: ProjectExperience[]; // 项目经历
  skillsDescription?: string; // 技能描述
  selfEvaluation?: string; // 自我评价
  expectedSalary?: string; // 新增: 期望薪资
  expectedLocation?: string; // 新增: 期望地点
  // --- 文件信息 (如果支持上传附件) ---
  fileUrl?: string; // 附件简历 URL
  fileName?: string; // 附件简历文件名
  uploadTime?: string; // 上传时间
  // --- 时间戳 ---
  createTime?: string;
  updateTime?: string;
}

/**
 * 创建简历请求参数类型
 * 统一使用驼峰命名法
 */
export interface CreateResumePayload {
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  educationList?: EducationExperience[];
  workList?: WorkExperience[];
  projectList?: ProjectExperience[];
  skillsDescription?: string;
  selfEvaluation?: string;
}