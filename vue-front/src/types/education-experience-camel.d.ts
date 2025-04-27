/**
 * 教育经历接口 (使用 camelCase 命名字段，与后端 Java 实体类保持一致)
 */
export interface EducationExperienceCamel {
  id?: string | number; // 可选，用于更新
  school: string; // 学校名称
  major: string; // 专业
  degree: string; // 学位 (例如: 学士, 硕士)
  startDate: string; // 开始时间 YYYY-MM
  endDate: string; // 结束时间 YYYY-MM 或 '至今'
  description?: string; // 在校经历描述
}
