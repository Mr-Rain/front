/**
 * 全局错误处理服务
 */
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';
import {
  ApiErrorCode,
  ErrorType,
  createApiError,
  getErrorTypeByStatus,
  getDefaultErrorMessage,
  isNetworkError,
  isTimeoutError,
  isCancelError
} from '@/types/error';

// 定义API错误接口（与types/error.ts中的保持一致）
interface ApiError {
  code: ApiErrorCode;
  message: string;
  type: ErrorType;
  originalError?: any;
  details?: any;
  url?: string;
  method?: string;
  params?: any;
  data?: any;
  status?: number;
  response?: any;
  shouldRetry?: boolean;
  retryCount?: number;
  timestamp?: number;
}

// 错误处理配置
interface ErrorHandlerConfig {
  // 是否在控制台打印错误
  logError?: boolean;

  // 是否显示错误通知
  showNotification?: boolean;

  // 是否自动重试网络错误
  autoRetryNetworkError?: boolean;

  // 最大重试次数
  maxRetryCount?: number;

  // 重试延迟（毫秒）
  retryDelay?: number;

  // 是否记录错误日志到服务器
  logToServer?: boolean;

  // 错误日志API
  errorLogApi?: string;
}

// 默认配置
const defaultConfig: ErrorHandlerConfig = {
  logError: true,
  showNotification: true,
  autoRetryNetworkError: true,
  maxRetryCount: 3,
  retryDelay: 1000,
  logToServer: false,
  errorLogApi: '/api/logs/error'
};

// 错误处理类
class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 处理API错误
   * @param error 错误对象
   * @param options 处理选项
   * @returns 处理后的错误对象
   */
  public handleApiError(error: any, options: {
    showNotification?: boolean;
    rethrow?: boolean;
  } = {}): ApiError {
    // 合并选项
    const { showNotification = this.config.showNotification, rethrow = false } = options;

    // 解析错误
    const apiError = this.parseError(error);

    // 记录错误
    if (this.config.logError) {
      this.logError(apiError);
    }

    // 发送错误日志到服务器
    if (this.config.logToServer) {
      this.sendErrorLog(apiError);
    }

    // 处理特定类型的错误
    this.handleSpecificError(apiError);

    // 显示错误通知
    if (showNotification) {
      this.showErrorNotification(apiError);
    }

    // 是否重新抛出错误
    if (rethrow) {
      throw apiError;
    }

    return apiError;
  }

  /**
   * 解析错误对象
   * @param error 原始错误对象
   * @returns 标准化的API错误对象
   */
  private parseError(error: any): ApiError {
    // 如果已经是ApiError类型，直接返回
    if (error && error.code && error.type && error.message) {
      return error as ApiError;
    }

    // 处理Axios错误
    if (error.response) {
      // 服务器响应错误
      const { status, data, config } = error.response;
      const errorCode = data?.code || status;
      const errorMessage = data?.message || getDefaultErrorMessage(errorCode);
      const errorType = getErrorTypeByStatus(status);

      return createApiError(errorCode, errorMessage, errorType, {
        originalError: error,
        details: data,
        url: config?.url,
        method: config?.method,
        params: config?.params,
        data: config?.data,
        status,
        response: data
      });
    } else if (isNetworkError(error)) {
      // 网络错误
      return createApiError(
        ApiErrorCode.NETWORK_ERROR,
        '网络连接错误，请检查您的网络连接',
        ErrorType.NETWORK,
        {
          originalError: error,
          shouldRetry: this.config.autoRetryNetworkError,
          retryCount: 0
        }
      );
    } else if (isTimeoutError(error)) {
      // 超时错误
      return createApiError(
        ApiErrorCode.TIMEOUT_ERROR,
        '请求超时，请稍后重试',
        ErrorType.NETWORK,
        {
          originalError: error,
          shouldRetry: this.config.autoRetryNetworkError,
          retryCount: 0
        }
      );
    } else if (isCancelError(error)) {
      // 取消请求错误
      return createApiError(
        ApiErrorCode.CANCEL_ERROR,
        '请求已取消',
        ErrorType.CLIENT,
        {
          originalError: error,
          shouldRetry: false
        }
      );
    } else if (error.code && error.message) {
      // 自定义错误
      return createApiError(
        error.code,
        error.message,
        ErrorType.BUSINESS,
        {
          originalError: error,
          details: error.details
        }
      );
    } else {
      // 未知错误
      return createApiError(
        ApiErrorCode.UNKNOWN_ERROR,
        error.message || '发生未知错误',
        ErrorType.UNKNOWN,
        {
          originalError: error
        }
      );
    }
  }

  /**
   * 处理特定类型的错误
   * @param error API错误对象
   */
  private handleSpecificError(error: ApiError): void {
    // 处理认证错误
    if (error.code === ApiErrorCode.UNAUTHORIZED) {
      // 清除本地存储的token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');

      // 跳转到登录页面
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }

    // 处理权限错误
    if (error.code === ApiErrorCode.FORBIDDEN) {
      router.push('/401');
    }

    // 处理资源不存在错误
    if (error.code === ApiErrorCode.NOT_FOUND) {
      // 可以选择跳转到404页面或者保持在当前页面
      // this.router.push('/404');
    }

    // 处理服务器错误
    if (error.type === ErrorType.SERVER) {
      // 可以选择跳转到错误页面
      // this.router.push('/500');
    }
  }

  /**
   * 显示错误通知
   * @param error API错误对象
   */
  private showErrorNotification(error: ApiError): void {
    // 根据错误类型选择不同的通知方式
    switch (error.type) {
      case ErrorType.AUTH:
        // 认证错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'warning',
          duration: 3000
        });
        break;

      case ErrorType.PERMISSION:
        // 权限错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'warning',
          duration: 3000
        });
        break;

      case ErrorType.NETWORK:
        // 网络错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'error',
          duration: 3000
        });
        break;

      case ErrorType.SERVER:
        // 服务器错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'error',
          duration: 3000
        });
        break;

      case ErrorType.BUSINESS:
        // 业务错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'error',
          duration: 3000
        });
        break;

      case ErrorType.CLIENT:
        // 客户端错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'warning',
          duration: 3000
        });
        break;

      case ErrorType.UNKNOWN:
      default:
        // 未知错误，使用消息框
        ElMessage({
          message: error.message,
          type: 'error',
          duration: 3000
        });
        break;
    }
  }

  /**
   * 在控制台记录错误
   * @param error API错误对象
   */
  private logError(error: ApiError): void {
    console.group(`[API Error] ${error.message}`);
    console.error('Error Code:', error.code);
    console.error('Error Type:', error.type);
    console.error('URL:', error.url);
    console.error('Method:', error.method);
    console.error('Params:', error.params);
    console.error('Data:', error.data);
    console.error('Response:', error.response);
    console.error('Original Error:', error.originalError);
    console.groupEnd();
  }

  /**
   * 发送错误日志到服务器
   * @param error API错误对象
   */
  private async sendErrorLog(error: ApiError): Promise<void> {
    if (!this.config.errorLogApi) return;

    try {
      // 构建错误日志数据
      const logData = {
        code: error.code,
        message: error.message,
        type: error.type,
        url: error.url,
        method: error.method,
        params: error.params,
        data: error.data,
        status: error.status,
        userAgent: navigator.userAgent,
        timestamp: error.timestamp || Date.now()
      };

      // 发送错误日志
      await fetch(this.config.errorLogApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });
    } catch (e) {
      // 忽略错误日志发送失败
      console.error('Failed to send error log:', e);
    }
  }

  /**
   * 显示全局错误对话框
   * @param title 标题
   * @param message 消息
   * @param type 类型
   */
  public showErrorDialog(title: string, message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
    ElMessageBox.alert(message, title, {
      type,
      confirmButtonText: '确定',
      callback: () => {}
    });
  }

  /**
   * 处理全局未捕获的Promise错误
   */
  public setupGlobalErrorHandlers(): void {
    // 处理未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.handleApiError(error, { showNotification: true });

      // 阻止默认处理
      event.preventDefault();
    });

    // 处理全局错误
    window.addEventListener('error', (event) => {
      // 忽略资源加载错误
      if (event.target && (event.target as HTMLElement).tagName) {
        return;
      }

      const error = event.error;
      this.handleApiError(error, { showNotification: true });

      // 阻止默认处理
      event.preventDefault();
    });
  }
}

// 创建默认的错误处理器实例
const errorHandler = new ErrorHandler();

// 导出错误处理器
export default errorHandler;

// 导出便捷函数
export const handleApiError = errorHandler.handleApiError.bind(errorHandler);
export const showErrorDialog = errorHandler.showErrorDialog.bind(errorHandler);
export const setupGlobalErrorHandlers = errorHandler.setupGlobalErrorHandlers.bind(errorHandler);
