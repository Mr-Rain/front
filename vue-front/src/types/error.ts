/**
 * 错误类型定义
 */

// API错误码枚举
export enum ApiErrorCode {
  // 成功
  SUCCESS = 200,
  
  // 客户端错误 (4xx)
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
  
  // 服务器错误 (5xx)
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  
  // 自定义业务错误码 (1000+)
  VALIDATION_ERROR = 1000,
  BUSINESS_ERROR = 1001,
  DATA_NOT_FOUND = 1002,
  DUPLICATE_ENTRY = 1003,
  OPERATION_FAILED = 1004,
  
  // 网络错误
  NETWORK_ERROR = 9000,
  TIMEOUT_ERROR = 9001,
  CANCEL_ERROR = 9002,
  
  // 未知错误
  UNKNOWN_ERROR = 9999
}

// 错误类型枚举
export enum ErrorType {
  // 网络错误
  NETWORK = 'network',
  
  // 认证错误
  AUTH = 'auth',
  
  // 权限错误
  PERMISSION = 'permission',
  
  // 业务错误
  BUSINESS = 'business',
  
  // 服务器错误
  SERVER = 'server',
  
  // 客户端错误
  CLIENT = 'client',
  
  // 未知错误
  UNKNOWN = 'unknown'
}

// API错误接口
export interface ApiError {
  // 错误码
  code: ApiErrorCode;
  
  // 错误消息
  message: string;
  
  // 错误类型
  type: ErrorType;
  
  // 原始错误对象
  originalError?: any;
  
  // 错误详情
  details?: any;
  
  // 请求URL
  url?: string;
  
  // 请求方法
  method?: string;
  
  // 请求参数
  params?: any;
  
  // 请求数据
  data?: any;
  
  // 响应状态码
  status?: number;
  
  // 响应数据
  response?: any;
  
  // 是否需要重试
  shouldRetry?: boolean;
  
  // 重试次数
  retryCount?: number;
  
  // 时间戳
  timestamp?: number;
}

// 创建API错误的工厂函数
export function createApiError(
  code: ApiErrorCode,
  message: string,
  type: ErrorType,
  options?: Partial<Omit<ApiError, 'code' | 'message' | 'type'>>
): ApiError {
  return {
    code,
    message,
    type,
    timestamp: Date.now(),
    ...options
  };
}

// 根据HTTP状态码获取错误类型
export function getErrorTypeByStatus(status: number): ErrorType {
  if (status >= 500) {
    return ErrorType.SERVER;
  } else if (status === 401 || status === 403) {
    return ErrorType.AUTH;
  } else if (status >= 400) {
    return ErrorType.CLIENT;
  } else {
    return ErrorType.UNKNOWN;
  }
}

// 根据错误码获取默认错误消息
export function getDefaultErrorMessage(code: ApiErrorCode): string {
  switch (code) {
    case ApiErrorCode.BAD_REQUEST:
      return '请求参数错误';
    case ApiErrorCode.UNAUTHORIZED:
      return '未授权，请先登录';
    case ApiErrorCode.FORBIDDEN:
      return '无权访问该资源';
    case ApiErrorCode.NOT_FOUND:
      return '请求的资源不存在';
    case ApiErrorCode.METHOD_NOT_ALLOWED:
      return '请求方法不允许';
    case ApiErrorCode.REQUEST_TIMEOUT:
      return '请求超时';
    case ApiErrorCode.CONFLICT:
      return '资源冲突';
    case ApiErrorCode.GONE:
      return '请求的资源不再可用';
    case ApiErrorCode.PAYLOAD_TOO_LARGE:
      return '请求数据过大';
    case ApiErrorCode.UNSUPPORTED_MEDIA_TYPE:
      return '不支持的媒体类型';
    case ApiErrorCode.TOO_MANY_REQUESTS:
      return '请求过于频繁，请稍后再试';
    case ApiErrorCode.INTERNAL_SERVER_ERROR:
      return '服务器内部错误';
    case ApiErrorCode.NOT_IMPLEMENTED:
      return '服务未实现';
    case ApiErrorCode.BAD_GATEWAY:
      return '网关错误';
    case ApiErrorCode.SERVICE_UNAVAILABLE:
      return '服务不可用';
    case ApiErrorCode.GATEWAY_TIMEOUT:
      return '网关超时';
    case ApiErrorCode.VALIDATION_ERROR:
      return '数据验证失败';
    case ApiErrorCode.BUSINESS_ERROR:
      return '业务处理失败';
    case ApiErrorCode.DATA_NOT_FOUND:
      return '数据不存在';
    case ApiErrorCode.DUPLICATE_ENTRY:
      return '数据已存在';
    case ApiErrorCode.OPERATION_FAILED:
      return '操作失败';
    case ApiErrorCode.NETWORK_ERROR:
      return '网络连接错误';
    case ApiErrorCode.TIMEOUT_ERROR:
      return '请求超时';
    case ApiErrorCode.CANCEL_ERROR:
      return '请求已取消';
    case ApiErrorCode.UNKNOWN_ERROR:
    default:
      return '未知错误';
  }
}

// 判断是否是网络错误
export function isNetworkError(error: any): boolean {
  return !error.response && error.message && (
    error.message.includes('Network Error') ||
    error.message.includes('net::ERR') ||
    error.code === 'ECONNABORTED'
  );
}

// 判断是否是超时错误
export function isTimeoutError(error: any): boolean {
  return error.code === 'ECONNABORTED' && error.message && error.message.includes('timeout');
}

// 判断是否是取消请求错误
export function isCancelError(error: any): boolean {
  return axios.isCancel(error);
}

// 导入axios以使用isCancel方法
import axios from 'axios';
