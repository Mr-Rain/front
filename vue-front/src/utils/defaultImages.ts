// 导入默认图片
import defaultAvatar from '@/assets/images/default-avatar.svg';
import defaultCompany from '@/assets/images/default-company.svg';

// 默认头像
export const DEFAULT_AVATAR = defaultAvatar;

// 默认公司Logo
export const DEFAULT_COMPANY_LOGO = defaultCompany;

// 根据用户类型获取默认头像
export function getDefaultAvatarByUserType(userType: string | undefined): string {
  switch (userType) {
    case 'company':
      return DEFAULT_COMPANY_LOGO;
    case 'student':
    case 'admin':
    default:
      return DEFAULT_AVATAR;
  }
}
