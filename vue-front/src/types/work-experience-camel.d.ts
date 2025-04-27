/**
 * 工作/实习经历接口 (使用 camelCase 命名字段，与后端 Java 实体类保持一致)
 */
export interface WorkExperienceCamel {
  id?: string | number; // 可选，用于更新
  companyName: string; // 公司名称
  position: string; // 职位
  startDate: string; // 开始时间 YYYY-MM
  endDate: string; // 结束时间 YYYY-MM 或 '至今'
  description: string; // 工作内容描述 (Markdown格式)
}
