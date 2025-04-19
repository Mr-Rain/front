import type { UserInfo } from './user';

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
  // 可以添加更多学生相关的字段
} 