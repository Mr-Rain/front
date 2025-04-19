<template>
  <div class="company-audit-page">
    <el-card shadow="never">
      <template #header>
        <span>企业资质审核</span>
      </template>

      <!-- Filters -->
      <el-form :inline="true" :model="listQuery" @submit.prevent="handleFilter" class="filter-form">
         <el-form-item label="审核状态">
            <el-select v-model="listQuery.auditStatus" placeholder="所有状态" clearable @change="handleFilter">
                 <el-option label="待审核" value="pending"></el-option>
                 <el-option label="已通过" value="approved"></el-option>
                 <el-option label="未通过" value="rejected"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input v-model="listQuery.keyword" placeholder="输入公司名称搜索" clearable @clear="handleFilter"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" :icon="Search">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="companyStore.auditList" v-loading="companyStore.loadingAuditList" style="width: 100%">
        <el-table-column prop="company_name" label="公司名称" min-width="180"></el-table-column>
        <el-table-column prop="industry" label="行业" width="120"></el-table-column>
        <el-table-column prop="location" label="地点" width="120"></el-table-column>
        <el-table-column label="认证文件" width="120" align="center">
            <template #default="scope">
                <el-link type="primary" @click="previewLicense(scope.row.business_license)" :disabled="!scope.row.business_license">预览文件</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="submit_time" label="提交时间" width="180">
             <template #default="scope">{{ formatTime(scope.row.submit_time) }}</template>
        </el-table-column>
         <el-table-column prop="audit_status" label="审核状态" width="120" align="center">
            <template #default="scope">
                 <el-tag :type="getStatusTagType(scope.row.audit_status)" effect="light">{{ formatAuditStatus(scope.row.audit_status) }}</el-tag>
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
                 <el-descriptions-item label="公司名称">{{ currentCompany.company_name }}</el-descriptions-item>
                 <el-descriptions-item label="行业">{{ currentCompany.industry }}</el-descriptions-item>
                 <el-descriptions-item label="地点">{{ currentCompany.location }}</el-descriptions-item>
                 <el-descriptions-item label="官网"> <el-link :href="currentCompany.website" target="_blank" type="primary" v-if="currentCompany.website">{{ currentCompany.website }}</el-link><span v-else>-</span></el-descriptions-item>
                 <el-descriptions-item label="提交时间">{{ formatTime(currentCompany.submit_time) }}</el-descriptions-item>
                  <el-descriptions-item label="联系人">{{ currentCompany.contact_person }} ({{ currentCompany.contact_email }} / {{ currentCompany.contact_phone }})</el-descriptions-item>
                   <el-descriptions-item label="公司介绍">{{ currentCompany.description }}</el-descriptions-item>
             </el-descriptions>

            <h4>认证文件</h4>
            <p v-if="currentCompany.business_license">
                <el-link type="primary" @click="previewLicense(currentCompany.business_license)">{{ currentCompany.business_license_name || '点击预览认证文件' }}</el-link>
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

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useCompanyStore } from '@/stores/company'; // Assuming company store handles audit list
import type { CompanyProfile, CompanyAuditStatus, AuditPayload } from '@/types/company';
import type { FormInstance } from 'element-plus';
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElEmpty, ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElLink, ElDialog, ElDescriptions, ElDescriptionsItem, ElRadioGroup, ElRadio } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import Pagination from '@/components/common/Pagination.vue';

const companyStore = useCompanyStore();

const listQuery = reactive({
    page: 1,
    pageSize: 10,
    auditStatus: 'pending' as CompanyAuditStatus | undefined, // Default to pending
    keyword: ''
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
    return new Date(timeStr).toLocaleString();
  } catch (e) {
    return timeStr;
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

const handleViewDetail = (company: CompanyProfile) => {
    currentCompany.value = company; // Store company data for dialog
    // Reset audit form
    auditData.status = 'approved';
    auditData.message = '';
    detailDialogVisible.value = true;
    auditFormRef.value?.clearValidate();
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
            // TODO: Ensure companyStore has submitAuditResult action
             try {
                 await companyStore.submitAuditResult(companyId, auditData);
                 ElMessage.success('审核结果提交成功');
                 detailDialogVisible.value = false;
                 fetchAuditList(); // Refresh list
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

.filter-form {
    margin-bottom: 15px;
}

.list-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.detail-content h4 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.1em;
}
.detail-content h4:first-child {
    margin-top: 0;
}

</style> 