<template>
  <div class="company-audit-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>企业资质审核</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="handleViewAuditLogs">
              <el-icon><Document /></el-icon> 审核记录
            </el-button>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filter-card">
        <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter" class="filter-form">
          <div class="search-form-container">
            <div class="search-inputs-group">
              <el-form-item label="审核状态" class="search-form-item">
                <el-select
                  v-model="listQuery.auditStatus"
                  placeholder="所有状态"
                  clearable
                  @change="handleFilter"
                  class="search-select"
                >
                  <el-option label="待审核" value="pending"></el-option>
                  <el-option label="已通过" value="approved"></el-option>
                  <el-option label="未通过" value="rejected"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="公司名称" class="search-form-item">
                <el-input
                  v-model="listQuery.keyword"
                  placeholder="输入公司名称搜索"
                  clearable
                  @clear="handleFilter"
                />
              </el-form-item>
            </div>
            <div class="search-button-group">
              <el-form-item class="search-button-item">
                <el-button type="primary" @click="handleFilter" :icon="Search" class="search-button">搜索</el-button>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <el-table :data="companyStore.auditList" v-loading="companyStore.loadingAuditList" style="width: 100%">
        <el-table-column label="公司名称" min-width="180">
          <template #default="scope">
            {{ scope.row.companyName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="行业" width="120">
          <template #default="scope">
            {{ scope.row.industry || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="地点" width="120">
          <template #default="scope">
            {{ scope.row.location || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="认证文件" width="120" align="center">
            <template #default="scope">
                <el-link
                  type="primary"
                  @click="previewLicense(scope.row.businessLicense || scope.row.businessLicense)"
                  :disabled="!(scope.row.businessLicense || scope.row.businessLicense)"
                >
                  预览文件
                </el-link>
            </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
             <template #default="scope">
               {{ formatTime(scope.row.submitTime) }}
             </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" align="center">
            <template #default="scope">
                 <el-tag
                   :type="getStatusTagType(scope.row.auditStatus)"
                   effect="light"
                 >
                   {{ formatAuditStatus(scope.row.auditStatus) }}
                 </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleViewDetail(scope.row)">审核</el-button>
            <!-- Or quick actions -->
             <!-- <el-button v-if="scope.row.audit_status === 'pending'" link type="success" size="small" @click="handleAudit(scope.row.id, 'approved')">通过</el-button>
             <el-button v-if="scope.row.audit_status === 'pending'" link type="danger" size="small" @click="handleAudit(scope.row.id, 'rejected')">拒绝</el-button> -->
          </template>
        </el-table-column>
         <template #empty>
            <el-empty description="暂无待审核的企业"></el-empty>
         </template>
      </el-table>

      <!-- Pagination -->
      <Pagination
        v-if="companyStore.auditTotal > 0"
        :total="companyStore.auditTotal"
        v-model:page="listQuery.page"
        v-model:limit="listQuery.pageSize"
        @pagination="fetchAuditList"
        class="list-pagination"
      />

    </el-card>

     <!-- Audit Detail Modal/Drawer -->
    <el-dialog v-model="detailDialogVisible" title="企业审核" width="600px">
        <div v-if="currentCompany" class="detail-content">
             <el-descriptions :column="1" border size="small" style="margin-bottom: 20px;">
                 <el-descriptions-item label="公司名称">{{ currentCompany.companyName || '-' }}</el-descriptions-item>
                 <el-descriptions-item label="行业">{{ currentCompany.industry || '-' }}</el-descriptions-item>
                 <el-descriptions-item label="地点">{{ currentCompany.location || '-' }}</el-descriptions-item>
                 <el-descriptions-item label="官网">
                    <el-link
                        :href="currentCompany.website"
                        target="_blank"
                        type="primary"
                        v-if="currentCompany.website"
                    >
                        {{ currentCompany.website }}
                    </el-link>
                    <span v-else>-</span>
                 </el-descriptions-item>
                 <el-descriptions-item label="提交时间">{{ formatTime(currentCompany.submitTime) }}</el-descriptions-item>
                 <el-descriptions-item label="联系人">
                    {{ currentCompany.contactPerson || '-' }}
                    <template v-if="currentCompany.contactEmail || currentCompany.contactPhone">
                        ({{ currentCompany.contactEmail || '' }} / {{ currentCompany.contactPhone || '' }})
                    </template>
                 </el-descriptions-item>
                 <el-descriptions-item label="公司介绍">{{ currentCompany.description || '-' }}</el-descriptions-item>
             </el-descriptions>

            <h4>认证文件</h4>
            <p v-if="currentCompany.businessLicense || currentCompany.businessLicense">
                <el-link type="primary" @click="previewLicense(currentCompany.businessLicense || currentCompany.businessLicense)">
                    {{ currentCompany.businessLicenseName || '点击预览认证文件' }}
                </el-link>
            </p>
            <p v-else>未上传认证文件</p>

            <h4>审核操作</h4>
            <el-form ref="auditFormRef" :model="auditData">
                 <el-form-item label="审核结果" prop="status" required>
                    <el-radio-group v-model="auditData.status">
                         <el-radio label="approved">审核通过</el-radio>
                         <el-radio label="rejected">审核拒绝</el-radio>
                    </el-radio-group>
                 </el-form-item>
                 <el-form-item label="审核意见" prop="message" v-if="auditData.status === 'rejected'">
                     <el-input type="textarea" v-model="auditData.message" placeholder="请输入拒绝原因 (将告知企业)"></el-input>
                 </el-form-item>
            </el-form>
        </div>
         <el-empty v-else description="无法加载企业信息"></el-empty>
        <template #footer>
             <el-button @click="detailDialogVisible = false">取消</el-button>
             <el-button type="primary" @click="handleAuditSubmit" :loading="companyStore.submittingAudit">提交审核结果</el-button>
        </template>
    </el-dialog>

    <!-- 审核记录抽屉 -->
    <audit-log-drawer
      v-model:visible="auditLogDrawerVisible"
      :company-id="selectedCompanyId"
      :audit-logs="auditLogs"
      :loading="loadingAuditLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCompanyStore } from '@/stores/company';
import type { CompanyProfile, CompanyAuditStatus, AuditPayload } from '@/types/company';
import type { FormInstance } from 'element-plus';
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElLink, ElDialog, ElDescriptions, ElDescriptionsItem, ElRadioGroup, ElRadio, ElIcon } from 'element-plus';
import { Search, Document } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';
import AuditLogDrawer from '@/components/admin/AuditLogDrawer.vue';
import { clearCacheByUrlPrefix } from '@/utils/cacheInterceptor';

const companyStore = useCompanyStore();
const route = useRoute();

// 审核记录相关
const auditLogDrawerVisible = ref(false);
const auditLogs = ref<any[]>([]);
const loadingAuditLogs = ref(false);

const listQuery = reactive({
    page: 1,
    pageSize: 10,
    auditStatus: 'pending' as CompanyAuditStatus | undefined, // Default to pending
    keyword: ''
});

// 监听审核状态变化，重新获取数据
watch(() => listQuery.auditStatus, () => {
    fetchAuditList();
});

const detailDialogVisible = ref(false);
const currentCompany = ref<CompanyProfile | null>(null);
const auditFormRef = ref<FormInstance>();
const auditData = reactive<AuditPayload>({
    status: 'approved',
    message: ''
});

const fetchAuditList = () => {
    // TODO: Ensure companyStore has fetchAuditList action
    console.log("Fetching audit list with query:", listQuery);
    companyStore.fetchAuditList(listQuery);
};

onMounted(() => {
    fetchAuditList();
});

const handleFilter = () => {
  listQuery.page = 1;
  fetchAuditList();
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '-';
  try {
    // 创建一个日期对象
    const date = new Date(timeStr);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return timeStr || '-';
    }

    // 格式化为本地时间字符串（北京时间）
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    console.error('日期格式化错误:', e);
    return timeStr || '-';
  }
};

const formatAuditStatus = (status: CompanyAuditStatus | undefined): string => {
     switch (status) {
        case 'pending': return '待审核';
        case 'approved': return '已通过';
        case 'rejected': return '未通过';
        default: return '未知';
    }
}

const getStatusTagType = (status: CompanyAuditStatus | undefined): ('success' | 'warning' | 'danger' | 'info') => {
     switch (status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        default: return 'info';
    }
}

const previewLicense = (url: string | undefined) => {
    if (url) {
        window.open(url, '_blank');
    } else {
        ElMessage.warning('未找到认证文件链接');
    }
}

const selectedCompanyId = ref<string | number>('');

// 监听路由参数
watch(() => route.query.id, (newId) => {
    if (newId && typeof newId === 'string') {
        // 如果有公司ID参数，直接打开详情对话框
        selectedCompanyId.value = newId;
        const company = companyStore.auditList.find(c => c.id === newId);
        if (company) {
            handleViewDetail(company);
        } else {
            // 如果在当前列表中找不到，可以尝试获取详情
            companyStore.getCompanyDetail(newId).then(company => {
                handleViewDetail(company);
            }).catch(() => {
                ElMessage.error('无法获取公司信息');
            });
        }
    }
}, { immediate: true });

const handleViewDetail = (company: CompanyProfile) => {
    currentCompany.value = company; // Store company data for dialog
    selectedCompanyId.value = company.id;
    // Reset audit form
    auditData.status = 'approved';
    auditData.message = '';
    detailDialogVisible.value = true;
    auditFormRef.value?.clearValidate();
}

// 查看审核记录
const handleViewAuditLogs = async () => {
    if (!selectedCompanyId.value && companyStore.auditList.length > 0) {
        // 如果没有选中公司，默认选择第一个
        selectedCompanyId.value = companyStore.auditList[0].id;
    }

    if (!selectedCompanyId.value) {
        ElMessage.warning('请先选择一个公司');
        return;
    }

    loadingAuditLogs.value = true;
    auditLogDrawerVisible.value = true;

    try {
        auditLogs.value = await companyStore.fetchAuditLogs(selectedCompanyId.value);
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        ElMessage.error('获取审核记录失败');
    } finally {
        loadingAuditLogs.value = false;
    }
}

const handleAuditSubmit = async () => {
    if (!auditFormRef.value || !currentCompany.value) return;
    // Add null check for currentCompany.value before accessing id
    const companyId = currentCompany.value.id;
    if (!companyId) {
        ElMessage.error('无法获取当前审核的公司ID');
        return;
    }

    auditFormRef.value.validate(async (valid) => {
        if (valid) {
            if (auditData.status === 'rejected' && !auditData.message?.trim()) {
                 ElMessage.warning('请填写审核拒绝原因');
                 return;
            }
            console.log(`Auditing company ${companyId} with status ${auditData.status}`);
            try {
                // 提交审核结果
                await companyStore.submitAudit(companyId, auditData.status === 'approved', auditData.message);
                ElMessage.success('审核结果提交成功');
                detailDialogVisible.value = false;

                // 清除缓存并重新获取列表
                ElMessage.info('正在刷新企业列表...');

                // 清除API缓存
                clearCacheByUrlPrefix('/api/admin/companies');

                setTimeout(() => {
                    // 根据当前选择的审核状态重新获取列表
                    fetchAuditList();
                }, 500);
            } catch (error) {
                ElMessage.error('提交失败');
            }
        }
    });
}

</script>

<style scoped>
.company-audit-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-card {
  background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 15px;
}

.search-form-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
}

.search-inputs-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  flex: 1;
}

.search-button-group {
  display: flex;
  gap: 10px;
}

.list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-content h4:first-child {
  margin-top: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .company-audit-page {
    padding: 10px;
  }

  .search-form-container {
    flex-direction: column;
  }

  .search-inputs-group {
    width: 100%;
  }

  .search-button-group {
    width: 100%;
    justify-content: flex-end;
  }

  .search-form-item {
    margin-bottom: 10px;
  }
}

</style>
