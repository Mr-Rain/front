import type { UserInfo } from './user';

/**
 * 公司规模类型
 */
type CompanyScale = '0-20人' | '20-99人' | '100-499人' | '500-999人' | '1000-9999人' | '10000人以上';

/**
 * 公司融资阶段类型
 */
type FinancingStage = '未融资' | '天使轮' | 'Pre-A轮' | 'A轮' | 'A+轮' | 'B轮' | 'C轮' | 'D轮及以上' | '已上市' | '不需要融资';

/**
 * 公司审核状态
 */
export type CompanyAuditStatus = 'pending' | 'approved' | 'rejected';

/**
 * 公司详细信息接口
 */
export interface CompanyProfile extends UserInfo {
  user_type: 'company'; // 明确用户类型为公司
  company_name: string; // 公司名称
  short_name?: string; // 公司简称
  logo?: string; // 公司 Logo URL
  website?: string; // 公司官网
  industry?: string; // 所属行业
  scale?: CompanyScale; // 公司规模
  financing?: FinancingStage; // 融资阶段
  location?: string; // 公司地址
  description?: string; // 公司简介 (可以是 Markdown 格式)
  
  // --- 联系人信息 ---
  contact_person?: string; // 联系人姓名
  contact_email?: string;  // 联系人邮箱
  contact_phone?: string;  // 联系人电话

  // --- 审核相关 ---
  business_license?: string; // 营业执照/认证文件 URL
  business_license_name?: string; // 认证文件名
  submit_time?: string; // 认证提交时间 (ISO 8601)
  audit_status?: CompanyAuditStatus; // 审核状态 (管理端可见)
  audit_message?: string; // 审核意见 (管理端/企业端可见)

  // 可以添加更多公司相关的字段
}

/**
 * (管理端) 审核荷载
 */
export interface AuditPayload {
    status: Exclude<CompanyAuditStatus, 'pending'>; // 审核结果只能是 approved 或 rejected
    message?: string; // 审核意见 (拒绝时必填)
} 