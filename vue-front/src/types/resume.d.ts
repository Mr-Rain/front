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
  start_date: string; // YYYY-MM
  end_date: string; // YYYY-MM 或 '至今'
  description?: string; // 在校经历描述
}

/**
 * 工作/实习经历
 */
export interface WorkExperience {
  id?: string | number;
  company_name: string;
  position: string; // 职位
  start_date: string; // YYYY-MM
  end_date: string; // YYYY-MM 或 '至今'
  description: string; // 工作内容描述 (Markdown格式)
}

/**
 * 项目经历
 */
export interface ProjectExperience {
  id?: string | number;
  project_name: string;
  role: string; // 担任角色
  start_date: string; // YYYY-MM
  end_date: string; // YYYY-MM 或 '至今'
  description: string; // 项目描述 (Markdown格式)
  project_link?: string; // 项目链接 (可选)
}

/**
 * 简历信息接口
 */
export interface ResumeInfo {
  id: string | number;
  student_id: string | number; // 关联的学生ID
  title: string; // 简历标题 (例如: 张三-前端开发工程师简历)
  is_default?: boolean; // 是否为默认简历
  // 基本信息 (可以从 StudentProfile 同步或独立维护)
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  // --- 简历核心内容 ---
  education_experiences?: EducationExperience[];
  work_experiences?: WorkExperience[];
  project_experiences?: ProjectExperience[];
  skills_description?: string; // 技能描述 (Markdown格式)
  self_evaluation?: string; // 自我评价 (Markdown格式)
  // --- 文件信息 (如果支持上传附件) ---
  file_url?: string; // 附件简历 URL
  file_name?: string; // 附件简历文件名
  upload_time?: string; // 上传时间
  // --- 时间戳 ---
  create_time?: string;
  update_time?: string;
} 