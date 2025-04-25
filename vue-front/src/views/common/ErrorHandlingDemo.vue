<template>
  <div class="error-handling-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h2>API错误处理示例</h2>
          <p class="subtitle">展示统一错误处理功能</p>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基本错误处理示例 -->
        <el-tab-pane label="基本错误处理" name="basic">
          <div class="section">
            <h3>基本错误处理</h3>
            <p>演示不同类型的API错误处理</p>
            
            <div class="demo-buttons">
              <el-button type="primary" @click="simulateSuccessRequest">
                成功请求
              </el-button>
              
              <el-button type="warning" @click="simulateClientError">
                客户端错误 (400)
              </el-button>
              
              <el-button type="danger" @click="simulateServerError">
                服务器错误 (500)
              </el-button>
              
              <el-button type="info" @click="simulateNetworkError">
                网络错误
              </el-button>
              
              <el-button type="warning" @click="simulateTimeoutError">
                超时错误
              </el-button>
            </div>
            
            <div v-if="lastResponse" class="response-display">
              <h4>最近响应</h4>
              <pre>{{ JSON.stringify(lastResponse, null, 2) }}</pre>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 认证错误处理示例 -->
        <el-tab-pane label="认证错误处理" name="auth">
          <div class="section">
            <h3>认证错误处理</h3>
            <p>演示认证相关的错误处理</p>
            
            <div class="demo-buttons">
              <el-button type="warning" @click="simulateUnauthorizedError">
                未授权错误 (401)
              </el-button>
              
              <el-button type="danger" @click="simulateForbiddenError">
                权限不足错误 (403)
              </el-button>
              
              <el-button type="info" @click="simulateTokenExpiredError">
                Token过期错误
              </el-button>
            </div>
            
            <el-alert
              title="注意：这些操作可能会导致您被登出系统"
              type="warning"
              :closable="false"
              show-icon
              style="margin-top: 20px"
            />
          </div>
        </el-tab-pane>
        
        <!-- 业务错误处理示例 -->
        <el-tab-pane label="业务错误处理" name="business">
          <div class="section">
            <h3>业务错误处理</h3>
            <p>演示业务逻辑相关的错误处理</p>
            
            <div class="demo-buttons">
              <el-button type="warning" @click="simulateValidationError">
                数据验证错误
              </el-button>
              
              <el-button type="danger" @click="simulateBusinessError">
                业务处理错误
              </el-button>
              
              <el-button type="info" @click="simulateDataNotFoundError">
                数据不存在错误
              </el-button>
              
              <el-button type="warning" @click="simulateDuplicateEntryError">
                数据重复错误
              </el-button>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 全局错误处理示例 -->
        <el-tab-pane label="全局错误处理" name="global">
          <div class="section">
            <h3>全局错误处理</h3>
            <p>演示全局未捕获错误的处理</p>
            
            <div class="demo-buttons">
              <el-button type="danger" @click="simulateUncaughtError">
                未捕获的错误
              </el-button>
              
              <el-button type="warning" @click="simulateUncaughtPromiseError">
                未捕获的Promise错误
              </el-button>
            </div>
            
            <el-alert
              title="这些错误通常会导致应用崩溃，但现在会被全局错误处理器捕获"
              type="info"
              :closable="false"
              show-icon
              style="margin-top: 20px"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import service from '@/utils/request';
import { ApiErrorCode, ErrorType, createApiError } from '@/types/error';
import errorHandler from '@/utils/errorHandler';

// 状态
const activeTab = ref('basic');
const lastResponse = ref<any>(null);

// 模拟成功请求
const simulateSuccessRequest = async () => {
  try {
    // 使用模拟数据
    const response = await Promise.resolve({
      code: 200,
      message: '操作成功',
      data: {
        id: 1,
        name: '测试数据',
        createdAt: new Date().toISOString()
      }
    });
    
    lastResponse.value = response;
    
    ElMessage({
      message: '请求成功',
      type: 'success'
    });
  } catch (error) {
    // 错误已由拦截器处理
  }
};

// 模拟客户端错误
const simulateClientError = async () => {
  try {
    // 创建一个模拟的错误响应
    const error = {
      response: {
        status: 400,
        data: {
          code: 400,
          message: '请求参数错误',
          details: {
            field: 'username',
            error: '用户名不能为空'
          }
        },
        config: {
          url: '/api/users',
          method: 'post',
          data: JSON.stringify({ username: '' })
        }
      }
    };
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟服务器错误
const simulateServerError = async () => {
  try {
    // 创建一个模拟的错误响应
    const error = {
      response: {
        status: 500,
        data: {
          code: 500,
          message: '服务器内部错误',
          details: {
            error: 'Internal Server Error',
            trace: 'Error: Database connection failed'
          }
        },
        config: {
          url: '/api/users',
          method: 'get'
        }
      }
    };
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟网络错误
const simulateNetworkError = async () => {
  try {
    // 创建一个模拟的网络错误
    const error = new Error('Network Error');
    error.message = 'Network Error';
    error.name = 'NetworkError';
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟超时错误
const simulateTimeoutError = async () => {
  try {
    // 创建一个模拟的超时错误
    const error = new Error('timeout of 10000ms exceeded');
    error.code = 'ECONNABORTED';
    error.name = 'TimeoutError';
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟未授权错误
const simulateUnauthorizedError = async () => {
  try {
    // 创建一个模拟的未授权错误
    const error = {
      response: {
        status: 401,
        data: {
          code: 401,
          message: '未授权，请先登录',
        },
        config: {
          url: '/api/users/profile',
          method: 'get'
        }
      }
    };
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟权限不足错误
const simulateForbiddenError = async () => {
  try {
    // 创建一个模拟的权限不足错误
    const error = {
      response: {
        status: 403,
        data: {
          code: 403,
          message: '权限不足，无法访问该资源',
        },
        config: {
          url: '/api/admin/users',
          method: 'get'
        }
      }
    };
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟Token过期错误
const simulateTokenExpiredError = async () => {
  try {
    // 创建一个模拟的Token过期错误
    const error = {
      response: {
        status: 401,
        data: {
          code: 401,
          message: 'Token已过期，请重新登录',
        },
        config: {
          url: '/api/users/profile',
          method: 'get'
        }
      }
    };
    
    throw error;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟数据验证错误
const simulateValidationError = async () => {
  try {
    // 创建一个模拟的数据验证错误
    const apiError = createApiError(
      ApiErrorCode.VALIDATION_ERROR,
      '数据验证失败',
      ErrorType.BUSINESS,
      {
        details: {
          fields: {
            username: '用户名长度必须在3-20个字符之间',
            email: '邮箱格式不正确'
          }
        },
        url: '/api/users',
        method: 'post'
      }
    );
    
    throw apiError;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟业务处理错误
const simulateBusinessError = async () => {
  try {
    // 创建一个模拟的业务处理错误
    const apiError = createApiError(
      ApiErrorCode.BUSINESS_ERROR,
      '业务处理失败',
      ErrorType.BUSINESS,
      {
        details: {
          reason: '当前状态不允许执行此操作'
        },
        url: '/api/applications/1/approve',
        method: 'post'
      }
    );
    
    throw apiError;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟数据不存在错误
const simulateDataNotFoundError = async () => {
  try {
    // 创建一个模拟的数据不存在错误
    const apiError = createApiError(
      ApiErrorCode.DATA_NOT_FOUND,
      '数据不存在',
      ErrorType.BUSINESS,
      {
        details: {
          entity: 'User',
          id: 999
        },
        url: '/api/users/999',
        method: 'get'
      }
    );
    
    throw apiError;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟数据重复错误
const simulateDuplicateEntryError = async () => {
  try {
    // 创建一个模拟的数据重复错误
    const apiError = createApiError(
      ApiErrorCode.DUPLICATE_ENTRY,
      '数据已存在',
      ErrorType.BUSINESS,
      {
        details: {
          field: 'email',
          value: 'test@example.com'
        },
        url: '/api/users',
        method: 'post'
      }
    );
    
    throw apiError;
  } catch (error) {
    // 手动处理错误
    errorHandler.handleApiError(error);
  }
};

// 模拟未捕获的错误
const simulateUncaughtError = () => {
  // 这个错误会被全局错误处理器捕获
  const obj = null;
  obj.nonExistentMethod();
};

// 模拟未捕获的Promise错误
const simulateUncaughtPromiseError = () => {
  // 这个Promise错误会被全局错误处理器捕获
  Promise.reject(new Error('未捕获的Promise错误'));
};
</script>

<style scoped>
.error-handling-demo {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.demo-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
}

.section p {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
}

.demo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.response-display {
  margin-top: 20px;
  padding: 15px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  overflow: auto;
}

.response-display h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.response-display pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .demo-buttons {
    flex-direction: column;
  }
  
  .demo-buttons .el-button {
    width: 100%;
  }
}
</style>
