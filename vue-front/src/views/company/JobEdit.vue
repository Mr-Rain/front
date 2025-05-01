<template>
  <div class="job-edit-page">
    <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-nav">
      <el-breadcrumb-item :to="{ name: 'company-job-manage' }">职位管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never">
      <el-form
        ref="jobFormRef"
        :model="jobData"
        :rules="jobRules"
        label-width="100px"
        v-loading="loading"
        label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位名称" prop="title">
              <el-input v-model="jobData.title" placeholder="请输入职位名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="工作地点" prop="location">
              <el-input v-model="jobData.location" placeholder="如：城市/区域"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="职位类型" prop="jobType">
              <el-select v-model="jobData.jobType" placeholder="请选择类型" style="width: 100%;">
                <el-option label="全职" value="全职"></el-option>
                <el-option label="兼职" value="兼职"></el-option>
                <el-option label="实习" value="实习"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
           <el-col :span="8">
            <el-form-item label="经验要求" prop="experienceRequired">
                 <el-select v-model="jobData.experienceRequired" placeholder="请选择经验要求" style="width: 100%;">
                    <el-option label="不限" value="不限"></el-option>
                    <el-option label="应届毕业生" value="应届毕业生"></el-option>
                    <el-option label="1年以下" value="1年以下"></el-option>
                    <el-option label="1-3年" value="1-3年"></el-option>
                    <el-option label="3-5年" value="3-5年"></el-option>
                    <el-option label="5-10年" value="5-10年"></el-option>
                    <el-option label="10年以上" value="10年以上"></el-option>
                 </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学历要求" prop="educationRequired">
                 <el-select v-model="jobData.educationRequired" placeholder="请选择学历要求" style="width: 100%;">
                     <el-option label="不限" value="不限"></el-option>
                     <el-option label="初中及以下" value="初中及以下"></el-option>
                     <el-option label="高中" value="高中"></el-option>
                     <el-option label="中专/中技" value="中专/中技"></el-option>
                     <el-option label="大专" value="大专"></el-option>
                     <el-option label="本科" value="本科"></el-option>
                     <el-option label="硕士" value="硕士"></el-option>
                     <el-option label="博士" value="博士"></el-option>
                 </el-select>
            </el-form-item>
          </el-col>
        </el-row>

         <el-form-item label="薪资范围" prop="salaryRange">
             <el-input v-model="jobData.salaryRange" placeholder="如：10k-20k 或 15薪 等明确范围"></el-input>
             <!-- Or use two inputs for min/max -->
         </el-form-item>

        <el-form-item label="职位描述" prop="description">
          <el-input
            type="textarea"
            v-model="jobData.description"
            :rows="8"
            placeholder="详细描述工作内容、职责等 (支持Markdown)"
           ></el-input>
        </el-form-item>

         <el-form-item label="职位要求" prop="requirements">
          <el-input
            type="textarea"
            v-model="jobData.requirements"
            :rows="8"
            placeholder="详细描述任职资格、技能要求等 (支持Markdown)"
           ></el-input>
        </el-form-item>

         <el-form-item label="职位标签" prop="tags">
             <el-select
                v-model="jobData.tags"
                multiple
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                placeholder="输入或选择标签，回车创建"
                style="width: 100%;"
              >
                <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
              </el-select>
              <div class="form-tip">添加标签可以提高职位曝光度，最多可添加 10 个标签</div>
         </el-form-item>

         <el-form-item label="工作福利" prop="benefits">
             <el-select
                v-model="jobData.benefits"
                multiple
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                placeholder="输入或选择福利，回车创建"
                style="width: 100%;"
              >
                <el-option v-for="benefit in commonBenefits" :key="benefit" :label="benefit" :value="benefit" />
              </el-select>
              <div class="form-tip">添加福利可以提高应聘者兴趣</div>
         </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="jobStore.submitting">{{ submitButtonText }}</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useJobStore } from '@/stores/job';
import type { JobInfo, JobType } from '@/types/job';
import type { FormInstance, FormRules } from 'element-plus';
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption, ElRow, ElCol, ElMessage, ElBreadcrumb, ElBreadcrumbItem } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const jobStore = useJobStore();
const jobFormRef = ref<FormInstance>();

const jobId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!jobId.value);
const loading = ref(false); // Local loading state for fetching detail

// 常用标签
const commonTags = [
  'Vue', 'React', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS',
  'Java', 'Python', 'C++', 'Go', 'PHP', 'Node.js', 'Spring Boot',
  '前端', '后端', '全栈', '移动端', '大数据', '人工智能',
  '云计算', 'DevOps', '微服务', '数据库', 'UI/UX', '产品',
  '运营', '市场', '销售', '客服', '行政', '人力资源',
  '财务', '法务', '技术支持', '项目管理'
];

// 常用福利
const commonBenefits = [
  '五险一金', '补充医疗保险', '带薪年假', '带薪病假',
  '弹性工作', '远程办公', '加班补贴', '全勤奖',
  '定期体检', '节日福利', '生日福利', '员工旅游',
  '员工活动', '免费午餐', '免费班车', '员工折扣',
  '股票期权', '技能培训', '晋升空间', '绩效奖金'
];

// Initialize form data
const jobData = reactive<Partial<JobInfo>>({
    title: '',
    location: '',
    jobType: '全职' as JobType,
    salaryRange: '',
    experienceRequired: '不限',
    educationRequired: '不限',
    description: '',
    requirements: '',
    tags: [],
    benefits: []
});

const jobRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入工作地点', trigger: 'blur' }],
  jobType: [{ required: true, message: '请选择职位类型', trigger: 'change' }],
  salaryRange: [{ required: true, message: '请输入薪资范围', trigger: 'blur' }],
  experienceRequired: [{ required: true, message: '请选择经验要求', trigger: 'change' }],
  educationRequired: [{ required: true, message: '请选择学历要求', trigger: 'change' }],
  description: [{ required: true, message: '请输入职位描述', trigger: 'blur' }],
  requirements: [{ required: true, message: '请输入职位要求', trigger: 'blur' }],
});

const pageTitle = computed(() => isEditing.value ? '编辑职位' : '发布新职位');
const submitButtonText = computed(() => isEditing.value ? '保存修改' : '立即发布');

onMounted(() => {
    if (isEditing.value && jobId.value) {
        fetchJobDetails(jobId.value);
    } else {
        // Reset to default for new job
        Object.assign(jobData, {
            title: '', location: '', jobType: '全职', salaryRange: '',
            experienceRequired: '不限', educationRequired: '不限',
            description: '', requirements: '', tags: [], benefits: []
        });
        jobStore.clearCurrentJob(); // Clear any previous detail
    }
});

const fetchJobDetails = async (id: string) => {
    loading.value = true;
    await jobStore.fetchJobDetail(id);
    if (jobStore.currentJob) {
        Object.assign(jobData, jobStore.currentJob);
        // Ensure tags is an array
        if (jobData.tags === null || jobData.tags === undefined) {
             jobData.tags = [];
        }
    } else {
        // Handle error, maybe redirect back
        ElMessage.error('加载职位信息失败');
        router.push({ name: 'company-job-manage' });
    }
    loading.value = false;
};

const handleSubmit = async () => {
  if (!jobFormRef.value) return;
  await jobFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditing.value && jobId.value) {
          // Update existing job
          await jobStore.updateJob(jobId.value, jobData);
        } else {
          // Create new job
          await jobStore.createJob(jobData);
        }
         // Success messages handled in store actions
        router.push({ name: 'company-job-manage' }); // Redirect back to list on success
      } catch (error) {
        // Errors handled in store actions
        console.error("Job submission failed:", error);
      }
    } else {
      ElMessage.error('请检查表单项是否填写完整');
    }
  });
};

const goBack = () => {
    router.push({ name: 'company-job-manage' });
};

</script>

<style scoped>
.job-edit-page {
  padding: 20px;
}

.breadcrumb-nav {
  margin-bottom: 20px;
}

/* Add some spacing below form items */
.el-form-item {
  margin-bottom: 22px;
}

/* Style for the tags select */
:deep(.el-select .el-select__tags-text) {
  max-width: 100px; /* Limit tag text width */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Form tips */
.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
  line-height: 1.4;
}

/* Responsive styles */
@media (max-width: 768px) {
  .job-edit-page {
    padding: 10px;
  }

  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>