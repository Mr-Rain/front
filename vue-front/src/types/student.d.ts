import type { UserInfo } from './user';

/**
 * 教育经历接口
 */
export interface EducationExperience {
  id?: string | number; // 可选，用于更新
  school: string; // 学校名称
  major: string; // 专业
  degree: string; // 学位 (例如: 学士, 硕士)
  startDate: string; // 开始时间 YYYY-MM
  endDate: string; // 结束时间 YYYY-MM 或 '至今'
  description?: string; // 在校经历描述
}

/**
 * 工作/实习经历接口
 */
export interface WorkExperience {
  id?: string | number; // 可选，用于更新
  companyName: string; // 公司名称
  position: string; // 职位
  startDate: string; // 开始时间 YYYY-MM
  endDate: string; // 结束时间 YYYY-MM 或 '至今'
  description: string; // 工作内容描述 (Markdown格式)
}

/**
 * 学生详细信息接口
 * 与后端 StudentDTO 保持一致
 * 统一使用驼峰命名法
 */
export interface StudentProfile extends UserInfo {
  userType: 'student'; // 明确用户类型为学生

  // 基本信息 (来自 users 表)
  username: string;
  email?: string;
  status: string;
  createTime?: string;
  lastLoginTime?: string;

  // 学生特有信息 (来自 students 表)
  realName?: string | null; // 真实姓名
  gender?: string | null; // 性别
  age?: number | null; // 年龄
  phone?: string | null; // 手机号
  school?: string | null; // 学校
  major?: string | null; // 专业
  education?: string | null; // 学历
  graduationYear?: number | null; // 毕业年份
  skills?: string[] | null; // 技能标签
  introduction?: string | null; // 个人介绍
  avatar?: string | null; // 头像URL

  // 学号 (数据库字段)
  studentNumber?: string; // 真实学号，存储在数据库中

  // 扩展信息
  location?: string | null; // 地点/城市
  studentId?: string; // 用户ID，不再用作学号
  grade?: string; // 年级
  experience?: string; // 实习或项目经历
  expectedSalary?: string; // 期望薪资
  expectedLocation?: string; // 期望工作地点
  // educationExperiences?: EducationExperience[] | string; // 教育经历 (可能是JSON字符串或对象数组)
  // workExperiences?: WorkExperience[] | string; // 工作/实习经历 (可能是JSON字符串或对象数组)
  educationList?: EducationExperience[]; // 改为 List
  workList?: WorkExperience[]; // 改为 List
  bio?: string; // 个人简介
}

// 为了兼容现有代码，保留原有别名
export type StudentProfileCamel = StudentProfile;
export type EducationExperienceCamel = EducationExperience;
export type WorkExperienceCamel = WorkExperience;