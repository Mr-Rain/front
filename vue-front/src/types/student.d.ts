import type { UserInfo } from './user';

/**
 * 教育经历接口
 */
export interface EducationExperience {
  id?: string | number; // 可选，用于更新
  school: string; // 学校名称
  major: string; // 专业
  degree: string; // 学位 (例如: 学士, 硕士)
  start_date: string; // 开始时间 YYYY-MM
  end_date: string; // 结束时间 YYYY-MM 或 '至今'
  description?: string; // 在校经历描述
}

/**
 * 工作/实习经历接口
 */
export interface WorkExperience {
  id?: string | number; // 可选，用于更新
  company_name: string; // 公司名称
  position: string; // 职位
  start_date: string; // 开始时间 YYYY-MM
  end_date: string; // 结束时间 YYYY-MM 或 '至今'
  description: string; // 工作内容描述 (Markdown格式)
}

/**
 * 学生详细信息接口
 */
export interface StudentProfile extends UserInfo {
  user_type: 'student'; // 明确用户类型为学生
  student_id?: string; // 学号
  major?: string; // 专业
  grade?: string; // 年级
  school?: string; // 学校
  education?: string; // 学历 (例如: 本科, 硕士, 博士)
  skills?: string[]; // 技能标签
  experience?: string; // 实习或项目经历 (可以是 Markdown 格式)
  expected_salary?: string; // 期望薪资
  expected_location?: string; // 期望工作地点
  education_experiences?: EducationExperience[]; // 教育经历
  work_experiences?: WorkExperience[]; // 工作/实习经历
  bio?: string; // 个人简介
}