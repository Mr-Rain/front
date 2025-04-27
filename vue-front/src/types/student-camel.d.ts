import type { UserInfo } from './user';
import type { EducationExperienceCamel } from './education-experience-camel';
import type { WorkExperienceCamel } from './work-experience-camel';

/**
 * 学生详细信息接口 (使用 camelCase 命名字段，与后端 Java 实体类保持一致)
 */
export interface StudentProfileCamel extends UserInfo {
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
  studentId?: string; // 用户ID，不再用作学号
  grade?: string; // 年级
  experience?: string; // 实习或项目经历
  expectedSalary?: string; // 期望薪资 (已在后端实现)
  expectedLocation?: string; // 期望工作地点 (已在后端实现)
  educationExperiences?: EducationExperienceCamel[]; // 教育经历
  workExperiences?: WorkExperienceCamel[]; // 工作/实习经历
  bio?: string; // 个人简介
}
